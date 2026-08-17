import {
  AlertTriangle,
  ArrowLeft,
  Check,
  HeartPulse,
  MessageCircle,
  Stethoscope,
  UserRound,
} from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useRhwApp } from "../context/RhwAppContext";
import {
  ACTION_LABELS,
  COMPLAINT_LABELS,
  CONDITION_LABELS,
  LOCATION_LABELS,
  OPTION_LABELS,
  RATIONALE_LABELS,
  RHW_OUTCOME_LABELS,
  SYMPTOM_LABELS,
  WARNING_LABELS,
  assessmentT,
  localizedLabel,
} from "../i18n/symptomAssessmentLanguage";
import {
  assessmentAnswers,
  assessmentResultFromRow,
  claimSymptomAssessment,
  getSymptomAssessment,
  getSymptomAssessmentPatient,
  submitRhwSymptomAssessmentReview,
  type SymptomAssessmentRow,
} from "../services/symptomAssessmentService";
import type { RhwPatientSummary } from "../services/rhwDataService";
import { colors, fonts, radius } from "../theme";

const OUTCOMES = [
  "more_information_needed",
  "working_assessment_agrees",
  "different_condition_suspected",
  "needs_physical_exam",
  "needs_diagnostic_testing",
  "doctor_review",
  "specialist_referral",
  "emergency_escalation",
  "follow_up_close",
] as const;

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function patientName(patient: RhwPatientSummary | null, fallback: string) {
  const name = [patient?.firstName, patient?.lastName].map(clean).filter(Boolean).join(" ");
  return name || fallback;
}

export default function RhwSymptomAssessmentReviewScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ assessmentId?: string }>();
  const assessmentId = clean(params.assessmentId);
  const { user, language } = useRhwApp();
  const t = (text: string) => assessmentT(language, text);

  const [row, setRow] = useState<SymptomAssessmentRow | null>(null);
  const [patient, setPatient] = useState<RhwPatientSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<string>("more_information_needed");
  const [clinicalNote, setClinicalNote] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [patientMessage, setPatientMessage] = useState("");

  const load = async () => {
    if (!assessmentId) {
      setLoading(false);
      return;
    }

    try {
      const current = await getSymptomAssessment(assessmentId);
      setRow(current);
      setPatient(await getSymptomAssessmentPatient(current));
      setOutcome(clean(current.rhwReviewStatus) || "more_information_needed");
      setClinicalNote(clean(current.rhwAssessment));
      setNextStep(clean(current.rhwNextStep));
    } catch (error: any) {
      Alert.alert(t("RHW clinical review"), error?.message ?? "Could not load this assessment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [assessmentId]);

  const answers = useMemo(() => (row ? assessmentAnswers(row) : null), [row]);
  const result = useMemo(() => (row ? assessmentResultFromRow(row) : null), [row]);

  const mine = !!row && clean(row.assignedRhwUserId) === clean(user?.$id);
  const unassigned = !!row && !clean(row.assignedRhwUserId);

  const claim = async () => {
    if (!row) return;
    try {
      setBusy(true);
      setRow(await claimSymptomAssessment(row.$id));
    } catch (error: any) {
      Alert.alert(t("RHW clinical review"), error?.message ?? "Could not claim this review.");
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!row) return;
    if (!mine) {
      Alert.alert(t("RHW clinical review"), t("Claim review"));
      return;
    }

    if (!clean(clinicalNote) && !clean(patientMessage)) {
      Alert.alert(t("RHW clinical review"), t("Add a clinical note or a message to the patient before sending."));
      return;
    }

    try {
      setBusy(true);
      const updated = await submitRhwSymptomAssessmentReview({
        assessmentId: row.$id,
        outcome,
        clinicalNote,
        nextStep,
        patientMessage,
      });
      setRow(updated);
      setPatientMessage("");
      Alert.alert(t("Review sent"), t("The patient can now see your review and message in MediReach."));
    } catch (error: any) {
      Alert.alert(t("RHW clinical review"), error?.message ?? "Could not send the review.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.charcoal} /></View>;
  }

  if (!row || !answers || !result) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Assessment not found.</Text>
        <Pressable onPress={() => router.back()} style={styles.secondary}><Text style={styles.secondaryText}>{t("Back")}</Text></Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top + 10, 20) }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topbar}>
        <Pressable onPress={() => router.back()} style={styles.back}><ArrowLeft size={20} color={colors.charcoal} /></Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t("RHW clinical review")}</Text>
          <Text style={styles.subtitle}>{t("Patient Health Checks")}</Text>
        </View>
        <View style={styles.iconBox}><Stethoscope size={21} color={colors.white} /></View>
      </View>

      <View style={styles.patientCard}>
        <View style={styles.patientIcon}><UserRound size={20} color={colors.charcoal} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.patientName}>{patientName(patient, row.patientId)}</Text>
          <Text style={styles.meta}>{localizedLabel(language, COMPLAINT_LABELS, row.mainComplaint)} · {assessmentT(language, row.triageLevel === "critical" ? "Critical" : row.triageLevel === "urgent" ? "Urgent" : row.triageLevel === "moderate" ? "Moderate" : "Routine")}</Text>
          {typeof row.distanceKm === "number" ? <Text style={styles.distance}>{row.distanceKm.toFixed(2)} km</Text> : null}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("Patient reported")}</Text>
        <View style={styles.dataRow}><Text style={styles.label}>{t("Where do you feel it?")}</Text><Text style={styles.value}>{localizedLabel(language, LOCATION_LABELS, answers.location)}</Text></View>
        <View style={styles.dataRow}><Text style={styles.label}>{t("How did it start?")}</Text><Text style={styles.value}>{localizedLabel(language, OPTION_LABELS, answers.onset)}</Text></View>
        <View style={styles.dataRow}><Text style={styles.label}>{t("How long has it been happening?")}</Text><Text style={styles.value}>{localizedLabel(language, OPTION_LABELS, answers.duration)}</Text></View>
        <View style={styles.dataRow}><Text style={styles.label}>{t("How bad is it?")}</Text><Text style={styles.value}>{answers.severity}/10</Text></View>
        <View style={styles.dataRow}><Text style={styles.label}>{t("What does it feel like?")}</Text><Text style={styles.value}>{localizedLabel(language, OPTION_LABELS, answers.character)}</Text></View>

        {answers.associatedSymptoms.length ? (
          <View style={styles.symptoms}>
            {answers.associatedSymptoms.map(code => <View key={code} style={styles.symptomChip}><Text style={styles.symptomText}>{localizedLabel(language, SYMPTOM_LABELS, code)}</Text></View>)}
          </View>
        ) : null}

        {clean(answers.freeText) ? (
          <View style={styles.quote}><Text style={styles.quoteLabel}>{t("In your own words")}</Text><Text style={styles.quoteText}>{answers.freeText}</Text></View>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("Preliminary possibilities")}</Text>
        {result.possibleConditionCodes.map(code => <Text key={code} style={styles.bullet}>• {localizedLabel(language, CONDITION_LABELS, code)}</Text>)}

        {result.warningSignCodes.length ? (
          <View style={styles.warningBox}>
            <View style={styles.warningTop}><AlertTriangle size={17} color={colors.charcoal} /><Text style={styles.warningTitle}>{t("Warning signs")}</Text></View>
            {result.warningSignCodes.map(code => <Text key={code} style={styles.warningText}>• {localizedLabel(language, WARNING_LABELS, code)}</Text>)}
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>{t("Why MediReach thinks this")}</Text>
        {result.rationaleCodes.map(code => <Text key={code} style={styles.reason}>• {localizedLabel(language, RATIONALE_LABELS, code)}</Text>)}
        <Text style={styles.sectionTitle}>{t("What to do next")}</Text>
        <Text style={styles.nextText}>{localizedLabel(language, ACTION_LABELS, result.recommendedActionCode)}</Text>
      </View>

      {!mine ? (
        <Pressable disabled={!unassigned || busy} onPress={claim} style={[styles.primary, (!unassigned || busy) && styles.disabled]}>
          {busy ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryText}>{unassigned ? t("Claim review") : t("Another health worker is reviewing this assessment")}</Text>}
        </Pressable>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("RHW clinical review")}</Text>
          <Text style={styles.sectionTitle}>{t("Outcome")}</Text>
          <View style={styles.wrap}>
            {OUTCOMES.map(code => {
              const active = outcome === code;
              return (
                <Pressable key={code} onPress={() => setOutcome(code)} style={[styles.pill, active && styles.pillActive]}>
                  {active ? <Check size={12} color={colors.white} /> : null}
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{localizedLabel(language, RHW_OUTCOME_LABELS, code)}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>{t("Clinical note")}</Text>
          <TextInput value={clinicalNote} onChangeText={setClinicalNote} multiline textAlignVertical="top" style={styles.input} placeholder={t("What did you confirm, suspect, or still need to check?")} placeholderTextColor={colors.softMuted} />

          <Text style={styles.sectionTitle}>{t("What to do next")}</Text>
          <TextInput value={nextStep} onChangeText={setNextStep} multiline textAlignVertical="top" style={styles.smallInput} placeholder={t("Example: come to the clinic today, answer more questions, or arrange testing.")} placeholderTextColor={colors.softMuted} />

          <Text style={styles.sectionTitle}>{t("Message to patient")}</Text>
          <Text style={styles.helper}>{t("Write what you want the patient to do or answer next.")}</Text>
          <TextInput value={patientMessage} onChangeText={setPatientMessage} multiline textAlignVertical="top" style={styles.input} placeholder={t("Write your message to the patient...")} placeholderTextColor={colors.softMuted} />

          <Pressable disabled={busy} onPress={submit} style={[styles.primary, busy && styles.disabled]}>
            {busy ? <ActivityIndicator color={colors.white} /> : <><MessageCircle size={17} color={colors.white} /><Text style={styles.primaryText}>{t("Send review")}</Text></>}
          </Pressable>
        </View>
      )}

      <View style={styles.source}><HeartPulse size={14} color={colors.muted} /><Text style={styles.sourceText}>MediReach guided patient assessment · {row.$id}</Text></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:{flex:1,backgroundColor:colors.canvas},content:{paddingHorizontal:18,paddingBottom:44},center:{flex:1,backgroundColor:colors.canvas,alignItems:"center",justifyContent:"center",padding:24},errorText:{fontFamily:fonts.bold,color:colors.text,fontSize:12,marginBottom:12},
  topbar:{flexDirection:"row",alignItems:"center",gap:10,marginBottom:14},back:{width:42,height:42,borderRadius:13,borderWidth:1,borderColor:colors.border,backgroundColor:colors.white,alignItems:"center",justifyContent:"center"},title:{fontFamily:fonts.bold,fontSize:22,color:colors.text},subtitle:{marginTop:2,fontFamily:fonts.regular,fontSize:9,color:colors.muted},iconBox:{width:44,height:44,borderRadius:14,backgroundColor:colors.charcoal,alignItems:"center",justifyContent:"center"},
  patientCard:{padding:13,borderRadius:radius.large,borderWidth:1,borderColor:colors.border,backgroundColor:colors.white,flexDirection:"row",alignItems:"center",gap:10},patientIcon:{width:42,height:42,borderRadius:13,backgroundColor:colors.surfaceSoft,alignItems:"center",justifyContent:"center"},patientName:{fontFamily:fonts.bold,fontSize:12,color:colors.text},meta:{marginTop:3,fontFamily:fonts.regular,fontSize:9,color:colors.muted},distance:{marginTop:3,fontFamily:fonts.bold,fontSize:8,color:colors.charcoal},
  card:{marginTop:12,padding:14,borderRadius:radius.large,borderWidth:1,borderColor:colors.border,backgroundColor:colors.white},cardTitle:{fontFamily:fonts.bold,fontSize:13,color:colors.text},dataRow:{marginTop:10,paddingBottom:8,borderBottomWidth:1,borderBottomColor:colors.border},label:{fontFamily:fonts.regular,fontSize:8,color:colors.muted},value:{marginTop:3,fontFamily:fonts.bold,fontSize:10,color:colors.text},symptoms:{marginTop:10,flexDirection:"row",flexWrap:"wrap",gap:6},symptomChip:{paddingHorizontal:9,paddingVertical:6,borderRadius:999,backgroundColor:colors.surfaceSoft},symptomText:{fontFamily:fonts.bold,fontSize:7,color:colors.charcoal},quote:{marginTop:12,padding:11,borderRadius:radius.card,backgroundColor:colors.canvas},quoteLabel:{fontFamily:fonts.bold,fontSize:8,color:colors.muted},quoteText:{marginTop:5,fontFamily:fonts.regular,fontSize:10,lineHeight:16,color:colors.text},
  bullet:{marginTop:7,fontFamily:fonts.bold,fontSize:10,lineHeight:15,color:colors.text},warningBox:{marginTop:13,padding:11,borderRadius:radius.card,backgroundColor:colors.surfaceSoft},warningTop:{flexDirection:"row",alignItems:"center",gap:6},warningTitle:{fontFamily:fonts.bold,fontSize:10,color:colors.text},warningText:{marginTop:5,fontFamily:fonts.regular,fontSize:9,lineHeight:14,color:colors.text},sectionTitle:{marginTop:15,marginBottom:6,fontFamily:fonts.bold,fontSize:10,color:colors.text},reason:{fontFamily:fonts.regular,fontSize:9,lineHeight:14,color:colors.muted,marginBottom:3},nextText:{fontFamily:fonts.bold,fontSize:9,lineHeight:15,color:colors.text},
  primary:{marginTop:13,minHeight:50,paddingHorizontal:14,borderRadius:radius.card,backgroundColor:colors.charcoal,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:7},primaryText:{fontFamily:fonts.bold,fontSize:9,color:colors.white},secondary:{minHeight:44,paddingHorizontal:14,borderRadius:radius.card,borderWidth:1,borderColor:colors.border,alignItems:"center",justifyContent:"center"},secondaryText:{fontFamily:fonts.bold,fontSize:9,color:colors.charcoal},disabled:{opacity:.55},wrap:{flexDirection:"row",flexWrap:"wrap",gap:7},pill:{minHeight:38,paddingHorizontal:10,borderRadius:999,borderWidth:1,borderColor:colors.border,backgroundColor:colors.canvas,flexDirection:"row",alignItems:"center",gap:5},pillActive:{backgroundColor:colors.charcoal,borderColor:colors.charcoal},pillText:{fontFamily:fonts.bold,fontSize:7,color:colors.text},pillTextActive:{color:colors.white},input:{minHeight:120,padding:11,borderRadius:radius.card,borderWidth:1,borderColor:colors.border,backgroundColor:colors.canvas,fontFamily:fonts.regular,fontSize:9,lineHeight:15,color:colors.text},smallInput:{minHeight:80,padding:11,borderRadius:radius.card,borderWidth:1,borderColor:colors.border,backgroundColor:colors.canvas,fontFamily:fonts.regular,fontSize:9,lineHeight:15,color:colors.text},helper:{marginBottom:7,fontFamily:fonts.regular,fontSize:8,lineHeight:12,color:colors.muted},source:{marginTop:14,flexDirection:"row",alignItems:"center",gap:5},sourceText:{fontFamily:fonts.regular,fontSize:7,color:colors.softMuted},
});
