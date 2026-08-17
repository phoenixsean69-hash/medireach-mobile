import * as Location from "expo-location";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  HeartPulse,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
} from "lucide-react-native";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CitizenOfflineBanner from "../components/citizen/CitizenOfflineBanner";
import { useCitizenApp } from "../context/CitizenAppContext";
import {
  ACTION_LABELS,
  COMPLAINT_LABELS,
  CONDITION_LABELS,
  LOCATION_LABELS,
  OPTION_LABELS,
  RATIONALE_LABELS,
  SYMPTOM_LABELS,
  WARNING_LABELS,
  assessmentT,
  localizedLabel,
} from "../i18n/symptomAssessmentLanguage";
import {
  COMPLAINTS,
  DURATION_CHOICES,
  ONSET_CHOICES,
  SIDE_CHOICES,
  associatedChoices,
  characterChoices,
  locationChoices,
  type Choice,
} from "../services/symptomAssessmentQuestions";
import {
  assessmentAnswers,
  assessmentResultFromRow,
  listMySymptomAssessments,
  requestRhwReview,
  saveCompletedSymptomAssessment,
  syncPendingSymptomAssessments,
  type SymptomAssessmentRow,
} from "../services/symptomAssessmentService";
import type {
  SymptomAssessmentAnswers,
  SymptomComplaint,
} from "../services/symptomAssessmentEngine";
import { colors, fonts, radius } from "../theme";

const EMPTY: SymptomAssessmentAnswers = {
  mainComplaint: "headache",
  location: "left_head",
  side: "left",
  onset: "gradual",
  duration: "today",
  severity: 5,
  character: "throbbing",
  associatedSymptoms: [],
  freeText: "",
};

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, active && styles.pillActive]}>
      {active ? <Check size={13} color={colors.white} /> : null}
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ChoiceGroup({
  values,
  selected,
  onSelect,
  translate,
}: {
  values: Choice[];
  selected: string;
  onSelect: (value: string) => void;
  translate: (label: string) => string;
}) {
  return (
    <View style={styles.wrap}>
      {values.map(item => (
        <Pill
          key={item.value}
          label={translate(item.label)}
          active={selected === item.value}
          onPress={() => onSelect(item.value)}
        />
      ))}
    </View>
  );
}

function StatusChip({ value, t }: { value: string; t: (text: string) => string }) {
  const label =
    value === "awaiting_rhw_review"
      ? t("Awaiting RHW review")
      : value === "rhw_reviewing"
        ? t("RHW reviewing")
        : value === "more_information_needed"
          ? t("More information needed")
          : value === "under_care"
            ? t("Under care")
            : value === "closed"
              ? t("Closed")
              : value === "completed_not_sent"
                ? t("Not sent for review")
                : value.replace(/_/g, " ");

  return (
    <View style={styles.statusChip}>
      <Text style={styles.statusText}>{label}</Text>
    </View>
  );
}

export default function CitizenHealthCheckScreen() {
  const insets = useSafeAreaInsets();
  const { patient, language } = useCitizenApp();
  const t = useCallback((text: string) => assessmentT(language, text), [language]);

  const [step, setStep] = useState<"intro" | "questions" | "result">("intro");
  const [answers, setAnswers] = useState<SymptomAssessmentAnswers>(EMPTY);
  const [current, setCurrent] = useState<SymptomAssessmentRow | null>(null);
  const [history, setHistory] = useState<SymptomAssessmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      await syncPendingSymptomAssessments().catch(() => null);
      setHistory(await listMySymptomAssessments());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load]),
  );

  const locations = useMemo(
    () => locationChoices(answers.mainComplaint),
    [answers.mainComplaint],
  );

  const characters = useMemo(
    () => characterChoices(answers.mainComplaint),
    [answers.mainComplaint],
  );

  const associated = useMemo(
    () => associatedChoices(answers.mainComplaint),
    [answers.mainComplaint],
  );

  const result = current ? assessmentResultFromRow(current) : null;

  const resetForComplaint = (value: string) => {
    const complaint = value as SymptomComplaint;
    const nextLocations = locationChoices(complaint);
    const nextCharacters = characterChoices(complaint);

    setAnswers({
      ...EMPTY,
      mainComplaint: complaint,
      location: nextLocations[0]?.value ?? "other",
      side: "not_sure",
      character: nextCharacters[0]?.value ?? "dull",
    });
  };

  const toggleAssociated = (value: string) => {
    setAnswers(previous => ({
      ...previous,
      associatedSymptoms: previous.associatedSymptoms.includes(value)
        ? previous.associatedSymptoms.filter(item => item !== value)
        : [...previous.associatedSymptoms, value],
    }));
  };

  const finish = async () => {
    try {
      setBusy(true);
      const saved = await saveCompletedSymptomAssessment({
        answers,
        preferredLanguage: language,
        latitude: patient?.homeLatitude ?? null,
        longitude: patient?.homeLongitude ?? null,
      });
      setCurrent(saved.row);
      setStep("result");
      await load();
    } catch (error: any) {
      Alert.alert(t("Health Check"), error?.message ?? "Could not save this Health Check.");
    } finally {
      setBusy(false);
    }
  };

  const resolveLocation = async () => {
    const savedLat = Number(patient?.homeLatitude);
    const savedLon = Number(patient?.homeLongitude);

    if (Number.isFinite(savedLat) && Number.isFinite(savedLon)) {
      return { latitude: savedLat, longitude: savedLon };
    }

    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== "granted") {
      throw new Error(t("MediReach needs your saved home location or current GPS before routing this assessment to a nearby RHW."));
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  };

  const requestReview = async () => {
    if (!current) return;

    try {
      setBusy(true);
      const location = await resolveLocation();
      const updated = await requestRhwReview({ assessment: current, ...location });
      setCurrent(updated);
      await load();
      Alert.alert(
        t("Review sent"),
        updated.syncStatus === "waiting_to_sync"
          ? t("Your Health Check is saved on this phone and will be sent to nearby RHWs when connectivity returns.")
          : t("Your Health Check is now visible to nearby RHWs for review."),
      );
    } catch (error: any) {
      Alert.alert(t("Location is needed"), error?.message ?? t("MediReach needs your saved home location or current GPS before routing this assessment to a nearby RHW."));
    } finally {
      setBusy(false);
    }
  };

  const openHistory = (row: SymptomAssessmentRow) => {
    setCurrent(row);
    const parsed = assessmentAnswers(row);
    if (parsed) setAnswers(parsed);
    setStep("result");
  };

  const triageLabel = (value: string) =>
    value === "critical" ? "Critical" : value === "urgent" ? "Urgent" : value === "moderate" ? "Moderate" : "Routine";

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top + 10, 20) }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <CitizenOfflineBanner />

      <View style={styles.topbar}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <ArrowLeft size={20} color={colors.charcoal} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t("Health Check")}</Text>
          <Text style={styles.subtitle}>{t("Check my symptoms")}</Text>
        </View>
        <View style={styles.iconBox}>
          <HeartPulse size={21} color={colors.white} />
        </View>
      </View>

      {step === "intro" ? (
        <>
          <View style={styles.hero}>
            <ShieldCheck size={28} color={colors.charcoal} />
            <Text style={styles.heroTitle}>{t("Tell MediReach what you feel. It will ask focused questions and prepare a preliminary assessment for a health worker to review.")}</Text>
            <View style={styles.notice}>
              <Text style={styles.noticeTitle}>{t("No equipment needed")}</Text>
              <Text style={styles.noticeText}>{t("This check only uses what you feel and observe. Medical-device and laboratory measurements are left to real equipment and future IoT integration.")}</Text>
            </View>
            <Pressable style={styles.primary} onPress={() => setStep("questions")}>
              <Text style={styles.primaryText}>{t("Start Health Check")}</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>{t("Your recent Health Checks")}</Text>
          {loading ? (
            <ActivityIndicator color={colors.charcoal} />
          ) : history.length === 0 ? (
            <View style={styles.empty}><Text style={styles.emptyText}>{t("No Health Checks yet")}</Text></View>
          ) : (
            <View style={styles.list}>
              {history.slice(0, 8).map(row => (
                <Pressable key={row.$id} onPress={() => openHistory(row)} style={styles.historyCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyTitle}>{localizedLabel(language, COMPLAINT_LABELS, row.mainComplaint)}</Text>
                    <Text style={styles.historyMeta}>{assessmentT(language, triageLabel(row.triageLevel))}</Text>
                  </View>
                  <StatusChip value={row.status} t={t} />
                </Pressable>
              ))}
            </View>
          )}
        </>
      ) : null}

      {step === "questions" ? (
        <View style={styles.formCard}>
          <Text style={styles.question}>{t("What is bothering you most?")}</Text>
          <ChoiceGroup values={COMPLAINTS} selected={answers.mainComplaint} onSelect={resetForComplaint} translate={t} />

          <Text style={styles.question}>{t("Where do you feel it?")}</Text>
          <ChoiceGroup values={locations} selected={answers.location} onSelect={value => setAnswers(previous => ({ ...previous, location: value }))} translate={t} />

          <Text style={styles.question}>{t("Which side?")}</Text>
          <ChoiceGroup values={SIDE_CHOICES} selected={answers.side} onSelect={value => setAnswers(previous => ({ ...previous, side: value }))} translate={t} />

          <Text style={styles.question}>{t("How did it start?")}</Text>
          <ChoiceGroup values={ONSET_CHOICES} selected={answers.onset} onSelect={value => setAnswers(previous => ({ ...previous, onset: value }))} translate={t} />

          <Text style={styles.question}>{t("How long has it been happening?")}</Text>
          <ChoiceGroup values={DURATION_CHOICES} selected={answers.duration} onSelect={value => setAnswers(previous => ({ ...previous, duration: value }))} translate={t} />

          <Text style={styles.question}>{t("How bad is it?")}</Text>
          <View style={styles.severityRow}>
            {[1,2,3,4,5,6,7,8,9,10].map(value => (
              <Pressable key={value} onPress={() => setAnswers(previous => ({ ...previous, severity: value }))} style={[styles.severity, answers.severity === value && styles.severityActive]}>
                <Text style={[styles.severityText, answers.severity === value && styles.severityTextActive]}>{value}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.question}>{t("What does it feel like?")}</Text>
          <ChoiceGroup values={characters} selected={answers.character} onSelect={value => setAnswers(previous => ({ ...previous, character: value }))} translate={t} />

          <Text style={styles.question}>{t("What else are you feeling or noticing?")}</Text>
          <View style={styles.wrap}>
            {associated.map(item => (
              <Pill key={item.value} label={t(item.label)} active={answers.associatedSymptoms.includes(item.value)} onPress={() => toggleAssociated(item.value)} />
            ))}
          </View>

          <Text style={styles.question}>{t("In your own words")}</Text>
          <Text style={styles.helper}>{t("Add anything important that the health worker should know.")}</Text>
          <TextInput
            value={answers.freeText}
            onChangeText={value => setAnswers(previous => ({ ...previous, freeText: value }))}
            multiline
            textAlignVertical="top"
            style={styles.input}
            placeholder={t("Describe what you feel in your own words...")}
            placeholderTextColor={colors.softMuted}
          />

          <Pressable disabled={busy} style={[styles.primary, busy && styles.disabled]} onPress={finish}>
            {busy ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryText}>{t("See my result")}</Text>}
          </Pressable>
        </View>
      ) : null}

      {step === "result" && current && result ? (
        <View style={styles.resultCard}>
          <View style={styles.resultTop}>
            <View style={styles.triageIcon}>
              {result.triageLevel === "critical" ? <AlertTriangle size={22} color={colors.white} /> : <Stethoscope size={22} color={colors.white} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.resultTitle}>{t("Based on what you told me, you may have:")}</Text>
              <Text style={styles.triage}>{assessmentT(language, triageLabel(result.triageLevel))}</Text>
            </View>
          </View>

          <View style={styles.possibilityList}>
            {result.possibleConditionCodes.map(code => (
              <View key={code} style={styles.bulletRow}><View style={styles.dot} /><Text style={styles.bulletText}>{localizedLabel(language, CONDITION_LABELS, code)}</Text></View>
            ))}
          </View>

          {result.warningSignCodes.length ? (
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>{t("Warning signs")}</Text>
              {result.warningSignCodes.map(code => <Text key={code} style={styles.warningText}>• {localizedLabel(language, WARNING_LABELS, code)}</Text>)}
            </View>
          ) : null}

          <Text style={styles.resultSection}>{t("Why MediReach thinks this")}</Text>
          {result.rationaleCodes.map(code => <Text key={code} style={styles.reason}>• {localizedLabel(language, RATIONALE_LABELS, code)}</Text>)}

          <Text style={styles.resultSection}>{t("What to do next")}</Text>
          <Text style={styles.actionText}>{localizedLabel(language, ACTION_LABELS, result.recommendedActionCode)}</Text>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>{t("This is a preliminary symptom assessment, not a confirmed diagnosis.")}</Text>
            <Text style={styles.disclaimerText}>{t("A Rural Health Worker should confirm, refine or escalate it.")}</Text>
          </View>

          <StatusChip value={current.status} t={t} />

          {clean(current.rhwAssessment) ? (
            <View style={styles.rhwReply}>
              <Text style={styles.rhwReplyTitle}>{t("RHW clinical review")}</Text>
              <Text style={styles.rhwReplyText}>{current.rhwAssessment}</Text>
              {clean(current.rhwNextStep) ? <Text style={styles.rhwReplyNext}>{current.rhwNextStep}</Text> : null}
            </View>
          ) : null}

          {current.status === "completed_not_sent" || current.status === "waiting_to_sync" ? (
            <Pressable disabled={busy} onPress={requestReview} style={[styles.primary, busy && styles.disabled]}>
              {busy ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryText}>{t("Ask a Health Worker to Review")}</Text>}
            </Pressable>
          ) : null}

          {result.triageLevel === "critical" ? (
            <Pressable onPress={() => router.push("/(citizen-tabs)/sos")} style={styles.emergencyButton}>
              <AlertTriangle size={18} color={colors.white} />
              <Text style={styles.emergencyText}>{t("Open SOS")}</Text>
            </Pressable>
          ) : null}

          {clean(current.conversationId) ? (
            <Pressable onPress={() => router.push("/(citizen-tabs)/messages")} style={styles.secondaryButton}>
              <MessageCircle size={17} color={colors.charcoal} />
              <Text style={styles.secondaryText}>{assessmentT(language, "Messages")}</Text>
            </Pressable>
          ) : null}

          <Pressable onPress={() => { setCurrent(null); setAnswers(EMPTY); setStep("intro"); load(); }} style={styles.restart}>
            <RefreshCw size={16} color={colors.charcoal} />
            <Text style={styles.restartText}>{t("Start another Health Check")}</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:{flex:1,backgroundColor:colors.canvas}, content:{paddingHorizontal:18,paddingBottom:44},
  topbar:{flexDirection:"row",alignItems:"center",gap:10,marginBottom:14}, back:{width:42,height:42,borderRadius:13,borderWidth:1,borderColor:colors.border,alignItems:"center",justifyContent:"center",backgroundColor:colors.white},
  title:{fontFamily:fonts.bold,fontSize:23,color:colors.text},subtitle:{marginTop:2,fontFamily:fonts.regular,fontSize:9,color:colors.muted}, iconBox:{width:44,height:44,borderRadius:14,backgroundColor:colors.charcoal,alignItems:"center",justifyContent:"center"},
  hero:{padding:17,borderRadius:radius.large,backgroundColor:colors.white,borderWidth:1,borderColor:colors.border},heroTitle:{marginTop:10,fontFamily:fonts.bold,fontSize:15,lineHeight:22,color:colors.text},notice:{marginTop:14,padding:12,borderRadius:radius.card,backgroundColor:colors.surfaceSoft},noticeTitle:{fontFamily:fonts.bold,fontSize:10,color:colors.text},noticeText:{marginTop:4,fontFamily:fonts.regular,fontSize:8,lineHeight:13,color:colors.muted},
  primary:{marginTop:16,minHeight:50,paddingHorizontal:16,borderRadius:radius.card,backgroundColor:colors.charcoal,alignItems:"center",justifyContent:"center"},primaryText:{fontFamily:fonts.bold,fontSize:10,color:colors.white},disabled:{opacity:.6},
  sectionTitle:{marginTop:22,marginBottom:9,fontFamily:fonts.bold,fontSize:14,color:colors.text},empty:{padding:15,borderRadius:radius.card,borderWidth:1,borderColor:colors.border,backgroundColor:colors.white},emptyText:{fontFamily:fonts.regular,fontSize:9,color:colors.muted},list:{gap:8},historyCard:{padding:12,borderRadius:radius.card,borderWidth:1,borderColor:colors.border,backgroundColor:colors.white,flexDirection:"row",alignItems:"center",gap:8},historyTitle:{fontFamily:fonts.bold,fontSize:10,color:colors.text},historyMeta:{marginTop:3,fontFamily:fonts.regular,fontSize:8,color:colors.muted},
  statusChip:{alignSelf:"flex-start",paddingHorizontal:9,paddingVertical:5,borderRadius:999,backgroundColor:colors.surfaceSoft},statusText:{fontFamily:fonts.bold,fontSize:7,color:colors.charcoal,textTransform:"capitalize"},
  formCard:{padding:15,borderRadius:radius.large,borderWidth:1,borderColor:colors.border,backgroundColor:colors.white},question:{marginTop:17,marginBottom:8,fontFamily:fonts.bold,fontSize:12,color:colors.text},helper:{marginTop:-4,marginBottom:8,fontFamily:fonts.regular,fontSize:8,lineHeight:13,color:colors.muted},wrap:{flexDirection:"row",flexWrap:"wrap",gap:7},pill:{minHeight:38,paddingHorizontal:11,borderRadius:999,borderWidth:1,borderColor:colors.border,backgroundColor:colors.canvas,flexDirection:"row",alignItems:"center",gap:5},pillActive:{backgroundColor:colors.charcoal,borderColor:colors.charcoal},pillText:{fontFamily:fonts.bold,fontSize:8,color:colors.text},pillTextActive:{color:colors.white},severityRow:{flexDirection:"row",flexWrap:"wrap",gap:6},severity:{width:38,height:38,borderRadius:12,borderWidth:1,borderColor:colors.border,alignItems:"center",justifyContent:"center",backgroundColor:colors.canvas},severityActive:{backgroundColor:colors.charcoal,borderColor:colors.charcoal},severityText:{fontFamily:fonts.bold,fontSize:9,color:colors.text},severityTextActive:{color:colors.white},input:{minHeight:130,padding:12,borderRadius:radius.card,borderWidth:1,borderColor:colors.border,backgroundColor:colors.canvas,fontFamily:fonts.regular,fontSize:10,lineHeight:16,color:colors.text},
  resultCard:{padding:16,borderRadius:radius.large,borderWidth:1,borderColor:colors.border,backgroundColor:colors.white},resultTop:{flexDirection:"row",alignItems:"center",gap:10},triageIcon:{width:46,height:46,borderRadius:14,backgroundColor:colors.charcoal,alignItems:"center",justifyContent:"center"},resultTitle:{fontFamily:fonts.bold,fontSize:14,lineHeight:20,color:colors.text},triage:{marginTop:4,fontFamily:fonts.bold,fontSize:9,color:colors.muted,textTransform:"uppercase"},possibilityList:{marginTop:15,gap:8},bulletRow:{flexDirection:"row",alignItems:"flex-start",gap:8},dot:{width:7,height:7,borderRadius:4,marginTop:5,backgroundColor:colors.charcoal},bulletText:{flex:1,fontFamily:fonts.bold,fontSize:10,lineHeight:16,color:colors.text},warningBox:{marginTop:16,padding:12,borderRadius:radius.card,backgroundColor:colors.surfaceSoft},warningTitle:{fontFamily:fonts.bold,fontSize:10,color:colors.text},warningText:{marginTop:5,fontFamily:fonts.regular,fontSize:9,lineHeight:14,color:colors.text},resultSection:{marginTop:17,marginBottom:6,fontFamily:fonts.bold,fontSize:11,color:colors.text},reason:{fontFamily:fonts.regular,fontSize:9,lineHeight:15,color:colors.muted,marginBottom:3},actionText:{fontFamily:fonts.bold,fontSize:10,lineHeight:16,color:colors.text},disclaimer:{marginTop:15,padding:11,borderRadius:radius.card,borderWidth:1,borderColor:colors.border},disclaimerText:{fontFamily:fonts.regular,fontSize:8,lineHeight:13,color:colors.muted,marginBottom:3},rhwReply:{marginTop:14,padding:12,borderRadius:radius.card,backgroundColor:colors.surfaceSoft},rhwReplyTitle:{fontFamily:fonts.bold,fontSize:10,color:colors.text},rhwReplyText:{marginTop:6,fontFamily:fonts.regular,fontSize:9,lineHeight:15,color:colors.text},rhwReplyNext:{marginTop:7,fontFamily:fonts.bold,fontSize:9,lineHeight:14,color:colors.charcoal},emergencyButton:{marginTop:9,minHeight:48,borderRadius:radius.card,backgroundColor:colors.error,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:7},emergencyText:{fontFamily:fonts.bold,fontSize:10,color:colors.white},secondaryButton:{marginTop:9,minHeight:46,borderRadius:radius.card,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surfaceSoft,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:7},secondaryText:{fontFamily:fonts.bold,fontSize:9,color:colors.charcoal},restart:{marginTop:11,minHeight:42,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:6},restartText:{fontFamily:fonts.bold,fontSize:8,color:colors.charcoal},
});
