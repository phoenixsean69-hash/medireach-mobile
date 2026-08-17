import {
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
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  loadSpecialistCases,
  type SpecialistCasesSnapshot,
} from "../services/specialistDataService";

import {
  colors,
  fonts,
  radius,
} from "../theme";

function nice(
  value: unknown,
) {
  return String(
    value || "",
  )
    .replace(/_/g, " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

export default function SpecialistCasesScreen() {
  const [
    snapshot,
    setSnapshot,
  ] =
    useState<
      SpecialistCasesSnapshot | null
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
          await loadSpecialistCases(),
        );
      }
      catch (
        nextError: any
      ) {
        setError(
          nextError?.message ??
            "Specialist case data is not currently available.",
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

  const encounters =
    snapshot?.encounters ??
    [];

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              load(true)
            }
          />
        }
      >
        <View style={styles.heading}>
          <View style={styles.headingIcon}>
            <ClipboardList
              size={22}
              color={colors.white}
            />
          </View>

          <Text style={styles.title}>
            Cases
          </Text>

          <Text style={styles.subtitle}>
            Care packets and encounter context available for specialist review.
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
              Case data unavailable
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
                  size={18}
                  color={
                    colors.charcoal
                  }
                />
                <Text style={styles.metricValue}>
                  {packets.length}
                </Text>
                <Text style={styles.metricLabel}>
                  Care packets
                </Text>
              </View>

              <View style={styles.metric}>
                <Stethoscope
                  size={18}
                  color={
                    colors.charcoal
                  }
                />
                <Text style={styles.metricValue}>
                  {encounters.length}
                </Text>
                <Text style={styles.metricLabel}>
                  Encounters
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              Care packets
            </Text>

            {packets.length === 0 ? (
              <View style={styles.stateCard}>
                <Text style={styles.stateTitle}>
                  No care packets
                </Text>

                <Text style={styles.stateText}>
                  No accessible specialist care packets are available.
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
                      <Text style={styles.cardTitle}>
                        {row.summary ||
                          row.assessment ||
                          "Care packet"}
                      </Text>

                      <Text style={styles.cardMeta}>
                        {[
                          row.triageLevel
                            ? nice(
                                row.triageLevel,
                              )
                            : "",
                          row.status
                            ? nice(
                                row.status,
                              )
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" • ")}
                      </Text>
                    </View>
                  ),
                )}
              </View>
            )}
          </>
        )}
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
      flexDirection:
        "row",
      gap: 10,
    },
    metric: {
      flex: 1,
      minHeight: 88,
      padding: 13,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.white,
    },
    metricValue: {
      marginTop: 7,
      fontFamily:
        fonts.bold,
      fontSize: 22,
      color:
        colors.text,
    },
    metricLabel: {
      marginTop: 2,
      fontFamily:
        fonts.regular,
      fontSize: 8,
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
