import {
  BriefcaseMedical,
  ClipboardList,
  Stethoscope,
} from "lucide-react-native";

import {
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useDoctorApp,
} from "../context/DoctorAppContext";

import {
  loadDoctorCases,
  type DoctorCaseSnapshot,
} from "../services/doctorDataService";

import {
  colors,
  fonts,
  radius,
} from "../theme";

function niceStatus(
  value: unknown,
) {
  return String(
    value || "unknown",
  )
    .replace(/_/g, " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

export default function DoctorCasesScreen() {
  const { t } =
    useDoctorApp();

  const [
    snapshot,
    setSnapshot,
  ] =
    useState<
      DoctorCaseSnapshot | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const load =
    async (
      refresh = false,
    ) => {
      refresh
        ? setRefreshing(true)
        : setLoading(true);

      setError("");

      try {
        setSnapshot(
          await loadDoctorCases(),
        );
      }
      catch (
        nextError: any
      ) {
        setError(
          nextError?.message ??
            t(
              "Case data is not currently available.",
            ),
        );
      }
      finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

  useEffect(() => {
    load();
  }, []);

  const packets =
    snapshot?.carePackets ??
    [];

  const referrals =
    snapshot?.referrals ??
    [];

  const encounters =
    snapshot?.encounters ??
    [];

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={
        styles.content
      }
      refreshControl={
        <RefreshControl
          refreshing={
            refreshing
          }
          onRefresh={() =>
            load(true)
          }
        />
      }
    >
      <View style={styles.heading}>
        <View style={styles.headingIcon}>
          <BriefcaseMedical
            size={22}
            color={colors.white}
          />
        </View>

        <Text style={styles.title}>
          {t("Cases")}
        </Text>

        <Text style={styles.subtitle}>
          {t(
            "Clinical cases available to your doctor account.",
          )}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          style={{
            marginTop: 28,
          }}
          color={
            colors.charcoal
          }
        />
      ) : error ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>
            {t(
              "Case data unavailable",
            )}
          </Text>

          <Text style={styles.stateText}>
            {error}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.metrics}>
            <View style={styles.metric}>
              <ClipboardList
                size={19}
                color={
                  colors.charcoal
                }
              />

              <Text style={styles.metricValue}>
                {packets.length}
              </Text>

              <Text style={styles.metricLabel}>
                {t(
                  "Care packets available",
                )}
              </Text>
            </View>

            <View style={styles.metric}>
              <BriefcaseMedical
                size={19}
                color={
                  colors.charcoal
                }
              />

              <Text style={styles.metricValue}>
                {referrals.length}
              </Text>

              <Text style={styles.metricLabel}>
                {t(
                  "Referrals available",
                )}
              </Text>
            </View>

            <View style={styles.metric}>
              <Stethoscope
                size={19}
                color={
                  colors.charcoal
                }
              />

              <Text style={styles.metricValue}>
                {encounters.length}
              </Text>

              <Text style={styles.metricLabel}>
                {t(
                  "Encounters available",
                )}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>
            {t(
              "Recent care packets",
            )}
          </Text>

          {packets.length === 0 ? (
            <View style={styles.stateCard}>
              <Text style={styles.stateTitle}>
                {t(
                  "No care packets",
                )}
              </Text>

              <Text style={styles.stateText}>
                {t(
                  "No accessible care packets are available.",
                )}
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {packets.map(
                (row) => (
                  <View
                    key={row.$id}
                    style={styles.card}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>
                        {row.summary ||
                          row.assessment ||
                          t("Care packet")}
                      </Text>

                      <Text style={styles.cardMeta}>
                        {[
                          row.triageLevel
                            ? t(
                                niceStatus(
                                  row.triageLevel,
                                ),
                              )
                            : "",
                          row.status
                            ? t(
                                niceStatus(
                                  row.status,
                                ),
                              )
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" • ")}
                      </Text>
                    </View>
                  </View>
                ),
              )}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles =
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor:
        colors.canvas,
    },

    content: {
      padding: 18,
      paddingBottom: 100,
    },

    heading: {
      padding: 18,
      borderRadius:
        radius.large,
      backgroundColor:
        colors.charcoal,
    },

    headingIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor:
        "rgba(255,255,255,0.12)",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    title: {
      marginTop: 13,
      fontFamily:
        fonts.bold,
      fontSize: 24,
      color:
        colors.white,
    },

    subtitle: {
      marginTop: 5,
      fontFamily:
        fonts.regular,
      fontSize: 9,
      lineHeight: 14,
      color:
        colors.border,
    },

    metrics: {
      marginTop: 14,
      gap: 9,
    },

    metric: {
      minHeight: 80,
      padding: 13,
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
      gap: 10,
    },

    metricValue: {
      minWidth: 36,
      fontFamily:
        fonts.bold,
      fontSize: 22,
      color:
        colors.text,
    },

    metricLabel: {
      flex: 1,
      fontFamily:
        fonts.regular,
      fontSize: 9,
      color:
        colors.muted,
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

    stateCard: {
      marginTop: 14,
      padding: 16,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.white,
    },

    stateTitle: {
      fontFamily:
        fonts.bold,
      fontSize: 11,
      color:
        colors.text,
    },

    stateText: {
      marginTop: 4,
      fontFamily:
        fonts.regular,
      fontSize: 9,
      lineHeight: 14,
      color:
        colors.muted,
    },

    list: {
      gap: 9,
    },

    card: {
      minHeight: 76,
      padding: 13,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.white,
    },

    cardTitle: {
      fontFamily:
        fonts.bold,
      fontSize: 10,
      color:
        colors.text,
    },

    cardMeta: {
      marginTop: 4,
      fontFamily:
        fonts.regular,
      fontSize: 8,
      color:
        colors.muted,
    },
  });
