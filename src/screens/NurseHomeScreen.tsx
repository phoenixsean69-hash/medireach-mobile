import UssdDemoLauncherCard from "../components/ussd/UssdDemoLauncherCard";
import {
  BellRing,
  HeartPulse,
  MessageCircle,
  Stethoscope,
  UsersRound,
} from "lucide-react-native";

import {
  router,
} from "expo-router";

import {
  useEffect,
  useState,
} from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import NurseLoading from "../components/nurse/NurseLoading";

import {
  useNurseApp,
} from "../context/NurseAppContext";

import {
  loadNurseHomeSnapshot,
  type NurseHomeSnapshot,
} from "../services/nurseDataService";

import {
  colors,
  fonts,
  radius,
} from "../theme";

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value:
    number | null;
  icon:
    React.ReactNode;
}) {
  return (
    <View style={styles.metric}>
      <View style={styles.metricIcon}>
        {icon}
      </View>

      <Text style={styles.metricValue}>
        {value === null ? "—" : value}
      </Text>

      <Text style={styles.metricLabel}>
        {label}
      </Text>
    </View>
  );
}

export default function NurseHomeScreen() {
  const {
    loading,
    profile,
    t,
  } =
    useNurseApp();

  const [
    snapshot,
    setSnapshot,
  ] =
    useState<
      NurseHomeSnapshot | null
    >(null);

  const [
    loadingSnapshot,
    setLoadingSnapshot,
  ] =
    useState(true);

  useEffect(() => {
    let active = true;

    loadNurseHomeSnapshot()
      .then((value) => {
        if (active) {
          setSnapshot(value);
        }
      })
      .catch(() => {
        if (active) {
          setSnapshot(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoadingSnapshot(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (
    loading ||
    loadingSnapshot
  ) {
    return <NurseLoading />;
  }

  const firstName =
    String(
      profile?.firstName ||
        t("Nurse"),
    );

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
    >
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Stethoscope
            size={24}
            color={colors.white}
          />
        </View>

        <Text style={styles.eyebrow}>
          {t("NURSE WORKSPACE")}
        </Text>

        <Text style={styles.title}>
          {t("Hello")}, {firstName}
        </Text>

        <Text style={styles.subtitle}>
          {t(
            "Facility care, patient monitoring and care-team coordination.",
          )}
        </Text>

        <View style={styles.workplace}>
          <Text style={styles.workplaceLabel}>
            {t("Workplace")}
          </Text>

          <Text style={styles.workplaceValue}>
            {profile?.facilityName ||
              t("Facility not linked")}
          </Text>

          <Text style={styles.workplaceMeta}>
            {[
              profile?.nursingCadre,
              profile?.departmentWard,
            ]
              .filter(Boolean)
              .join(" • ") ||
              t("Nurse account")}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        {t("Live workspace")}
      </Text>

      <View style={styles.metrics}>
        <Metric
          label={t("Patients")}
          value={
            snapshot?.patientCount ??
            null
          }
          icon={
            <UsersRound
              size={18}
              color={colors.charcoal}
            />
          }
        />

        <Metric
          label={t("Open care requests")}
          value={
            snapshot?.openCareCount ??
            null
          }
          icon={
            <HeartPulse
              size={18}
              color={colors.charcoal}
            />
          }
        />

        <Metric
          label={t("Active SOS")}
          value={
            snapshot?.urgentSosCount ??
            null
          }
          icon={
            <BellRing
              size={18}
              color={colors.error}
            />
          }
        />

        <Metric
          label={t("Chats")}
          value={
            snapshot?.conversationCount ??
            null
          }
          icon={
            <MessageCircle
              size={18}
              color={colors.charcoal}
            />
          }
        />
      </View>

      <Text style={styles.sectionTitle}>
        {t("Quick actions")}
      </Text>

      <View style={styles.actions}>
        <Pressable
          onPress={() =>
            router.push(
              "/(nurse-tabs)/patients" as any,
            )
          }
          style={styles.action}
        >
          <UsersRound
            size={20}
            color={colors.charcoal}
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>
              {t("Open patients")}
            </Text>

            <Text style={styles.actionText}>
              {t(
                "Review patient records currently accessible to you.",
              )}
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() =>
            router.push(
              "/(nurse-tabs)/care" as any,
            )
          }
          style={styles.action}
        >
          <HeartPulse
            size={20}
            color={colors.charcoal}
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>
              {t("Open care")}
            </Text>

            <Text style={styles.actionText}>
              {t(
                "Review care requests and urgent emergency activity.",
              )}
            </Text>
          </View>
        </Pressable>
      </View>
          <UssdDemoLauncherCard />
</ScrollView>
  );
}

const styles =
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    content: {
      padding: 18,
      paddingBottom: 100,
    },
    hero: {
      padding: 20,
      borderRadius: radius.large,
      backgroundColor: colors.charcoal,
    },
    heroIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: "rgba(255,255,255,0.12)",
      alignItems: "center",
      justifyContent: "center",
    },
    eyebrow: {
      marginTop: 16,
      fontFamily: fonts.bold,
      fontSize: 8,
      letterSpacing: 1,
      color: colors.border,
    },
    title: {
      marginTop: 5,
      fontFamily: fonts.bold,
      fontSize: 27,
      color: colors.white,
    },
    subtitle: {
      marginTop: 7,
      maxWidth: 320,
      fontFamily: fonts.regular,
      fontSize: 11,
      lineHeight: 17,
      color: colors.border,
    },
    workplace: {
      marginTop: 18,
      padding: 13,
      borderRadius: radius.card,
      backgroundColor: "rgba(255,255,255,0.09)",
    },
    workplaceLabel: {
      fontFamily: fonts.regular,
      fontSize: 8,
      color: colors.border,
    },
    workplaceValue: {
      marginTop: 2,
      fontFamily: fonts.bold,
      fontSize: 12,
      color: colors.white,
    },
    workplaceMeta: {
      marginTop: 3,
      fontFamily: fonts.regular,
      fontSize: 8,
      color: colors.border,
    },
    sectionTitle: {
      marginTop: 22,
      marginBottom: 10,
      fontFamily: fonts.bold,
      fontSize: 14,
      color: colors.text,
    },
    metrics: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    metric: {
      width: "48%",
      minHeight: 118,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.card,
      backgroundColor: colors.white,
    },
    metricIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor: colors.surfaceSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    metricValue: {
      marginTop: 11,
      fontFamily: fonts.bold,
      fontSize: 24,
      color: colors.text,
    },
    metricLabel: {
      marginTop: 2,
      fontFamily: fonts.regular,
      fontSize: 9,
      color: colors.muted,
    },
    actions: {
      gap: 10,
    },
    action: {
      minHeight: 74,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.card,
      backgroundColor: colors.white,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    actionTitle: {
      fontFamily: fonts.bold,
      fontSize: 11,
      color: colors.text,
    },
    actionText: {
      marginTop: 3,
      fontFamily: fonts.regular,
      fontSize: 8,
      lineHeight: 12,
      color: colors.muted,
    },
  });
