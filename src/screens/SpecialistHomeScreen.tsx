import {
  BriefcaseMedical,
  ClipboardList,
  MessageCircle,
  Microscope,
  Stethoscope,
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

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import SpecialistLoading from "../components/specialist/SpecialistLoading";

import {
  useSpecialistApp,
} from "../context/SpecialistAppContext";

import {
  loadSpecialistHomeSnapshot,
  type SpecialistHomeSnapshot,
} from "../services/specialistDataService";

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

export default function SpecialistHomeScreen() {
  const {
    loading,
    profile,
  } =
    useSpecialistApp();

  const [
    snapshot,
    setSnapshot,
  ] =
    useState<
      SpecialistHomeSnapshot | null
    >(null);

  const [
    loadingSnapshot,
    setLoadingSnapshot,
  ] =
    useState(true);

  useEffect(() => {
    let active = true;

    loadSpecialistHomeSnapshot()
      .then(
        (value) => {
          if (active) {
            setSnapshot(
              value,
            );
          }
        },
      )
      .catch(() => {
        if (active) {
          setSnapshot(
            null,
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoadingSnapshot(
            false,
          );
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
    return (
      <SpecialistLoading />
    );
  }

  const firstName =
    String(
      profile?.firstName ||
        "Specialist",
    );

  const discipline =
    [
      profile?.specialty,
      profile?.subspecialty,
    ]
      .filter(Boolean)
      .join(" • ");

  return (
    <SafeAreaView
      style={styles.safe}
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      <ScrollView
        style={styles.root}
        contentContainerStyle={
          styles.content
        }
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Microscope
              size={24}
              color={colors.white}
            />
          </View>

          <Text style={styles.eyebrow}>
            SPECIALIST WORKSPACE
          </Text>

          <Text style={styles.title}>
            Hello, {firstName}
          </Text>

          <Text style={styles.subtitle}>
            Referral review, specialist case assessment and coordinated clinical guidance.
          </Text>

          <View style={styles.workplace}>
            <Text style={styles.workplaceLabel}>
              Workplace
            </Text>

            <Text style={styles.workplaceValue}>
              {profile?.facilityName ||
                "Facility not linked"}
            </Text>

            <Text style={styles.workplaceMeta}>
              {discipline ||
                "Specialist account"}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Live workspace
        </Text>

        <View style={styles.metrics}>
          <Metric
            label="Referrals"
            value={
              snapshot
                ?.referralCount ??
              null
            }
            icon={
              <BriefcaseMedical
                size={18}
                color={
                  colors.charcoal
                }
              />
            }
          />

          <Metric
            label="Care packets"
            value={
              snapshot
                ?.carePacketCount ??
              null
            }
            icon={
              <ClipboardList
                size={18}
                color={
                  colors.charcoal
                }
              />
            }
          />

          <Metric
            label="Encounters"
            value={
              snapshot
                ?.encounterCount ??
              null
            }
            icon={
              <Stethoscope
                size={18}
                color={
                  colors.charcoal
                }
              />
            }
          />

          <Metric
            label="Chats"
            value={
              snapshot
                ?.conversationCount ??
              null
            }
            icon={
              <MessageCircle
                size={18}
                color={
                  colors.charcoal
                }
              />
            }
          />
        </View>

        <Text style={styles.sectionTitle}>
          Quick actions
        </Text>

        <View style={styles.actions}>
          <Pressable
            onPress={() =>
              router.push(
                "/(specialist-tabs)/referrals" as any,
              )
            }
            style={styles.action}
          >
            <BriefcaseMedical
              size={20}
              color={colors.charcoal}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>
                Open referrals
              </Text>

              <Text style={styles.actionText}>
                Review referrals currently available to this specialist account.
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() =>
              router.push(
                "/(specialist-tabs)/cases" as any,
              )
            }
            style={styles.action}
          >
            <ClipboardList
              size={20}
              color={colors.charcoal}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>
                Open cases
              </Text>

              <Text style={styles.actionText}>
                Review care packets and encounter context.
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor:
        colors.canvas,
    },

    root: {
      flex: 1,
      backgroundColor:
        colors.canvas,
    },

    content: {
      padding: 18,
      paddingBottom: 100,
    },

    hero: {
      padding: 20,
      borderRadius:
        radius.large,
      backgroundColor:
        colors.charcoal,
    },

    heroIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor:
        "rgba(255,255,255,0.12)",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    eyebrow: {
      marginTop: 16,
      fontFamily:
        fonts.bold,
      fontSize: 8,
      letterSpacing: 1,
      color:
        colors.border,
    },

    title: {
      marginTop: 5,
      fontFamily:
        fonts.bold,
      fontSize: 27,
      color:
        colors.white,
    },

    subtitle: {
      marginTop: 7,
      maxWidth: 320,
      fontFamily:
        fonts.regular,
      fontSize: 11,
      lineHeight: 17,
      color:
        colors.border,
    },

    workplace: {
      marginTop: 18,
      padding: 13,
      borderRadius:
        radius.card,
      backgroundColor:
        "rgba(255,255,255,0.09)",
    },

    workplaceLabel: {
      fontFamily:
        fonts.regular,
      fontSize: 8,
      color:
        colors.border,
    },

    workplaceValue: {
      marginTop: 2,
      fontFamily:
        fonts.bold,
      fontSize: 12,
      color:
        colors.white,
    },

    workplaceMeta: {
      marginTop: 3,
      fontFamily:
        fonts.regular,
      fontSize: 8,
      color:
        colors.border,
    },

    sectionTitle: {
      marginTop: 22,
      marginBottom: 10,
      fontFamily:
        fonts.bold,
      fontSize: 14,
      color:
        colors.text,
    },

    metrics: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 10,
    },

    metric: {
      width: "48%",
      minHeight: 118,
      padding: 14,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.white,
    },

    metricIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor:
        colors.surfaceSoft,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    metricValue: {
      marginTop: 11,
      fontFamily:
        fonts.bold,
      fontSize: 24,
      color:
        colors.text,
    },

    metricLabel: {
      marginTop: 2,
      fontFamily:
        fonts.regular,
      fontSize: 9,
      color:
        colors.muted,
    },

    actions: {
      gap: 10,
    },

    action: {
      minHeight: 74,
      padding: 14,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.white,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 12,
    },

    actionTitle: {
      fontFamily:
        fonts.bold,
      fontSize: 11,
      color:
        colors.text,
    },

    actionText: {
      marginTop: 3,
      fontFamily:
        fonts.regular,
      fontSize: 8,
      lineHeight: 12,
      color:
        colors.muted,
    },
  });
