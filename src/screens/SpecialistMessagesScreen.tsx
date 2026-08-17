import {
  MessageCircle,
  MessageSquarePlus,
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
  ActivityIndicator,
  Pressable,
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
  useSpecialistApp,
} from "../context/SpecialistAppContext";

import {
  translateConsultText,
  translateConsultTitle,
} from "../i18n/consultLanguage";

import {
  listSpecialistConversations,
  type SpecialistGenericRow,
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
      letter =>
        letter.toUpperCase(),
    );
}

export default function SpecialistMessagesScreen() {
  const {
    language,
  } =
    useSpecialistApp();

  const tr =
    (
      text: string,
    ) =>
      translateConsultText(
        text,
        language,
      );

  const [
    rows,
    setRows,
  ] =
    useState<
      SpecialistGenericRow[]
    >([]);

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
        setRows(
          await listSpecialistConversations(),
        );
      }
      catch (
        nextError: any
      ) {
        setError(
          nextError?.message ??
            tr(
              "Conversations are not currently available.",
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

  const nurseConsultCount =
    rows.filter(
      row =>
        String(
          row.conversationType ||
            "",
        ) ===
        "nurse_specialist_consult",
    ).length;

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
            <MessageCircle
              size={22}
              color={colors.white}
            />
          </View>

          <Text style={styles.title}>
            {tr(
              "Messages",
            )}
          </Text>

          <Text style={styles.subtitle}>
            {tr(
              "Secure care-team conversations and consultation requests sent to this specialist account.",
            )}
          </Text>
        </View>

        {!loading &&
        !error ? (
          <View style={styles.consultSummary}>
            <MessageSquarePlus
              size={19}
              color={
                colors.charcoal
              }
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.summaryValue}>
                {nurseConsultCount}
              </Text>

              <Text style={styles.summaryLabel}>
                {tr(
                  nurseConsultCount ===
                    1
                    ? "Nurse consult"
                    : "Nurse consults",
                )}
              </Text>
            </View>
          </View>
        ) : null}

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
              {tr(
                "Messages unavailable",
              )}
            </Text>

            <Text style={styles.stateText}>
              {error}
            </Text>
          </View>
        ) : rows.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>
              {tr(
                "No conversations",
              )}
            </Text>

            <Text style={styles.stateText}>
              {tr(
                "Nurse consultation requests and other care-team conversations will appear here.",
              )}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {rows.map(
              row => {
                const participants =
                  Array.isArray(
                    row.participantIds,
                  )
                    ? row
                        .participantIds
                        .length
                    : 0;

                const isNurseConsult =
                  String(
                    row.conversationType ||
                      "",
                  ) ===
                  "nurse_specialist_consult";

                return (
                  <Pressable
                    key={row.$id}
                    onPress={() =>
                      router.push({
                        pathname:
                          "/(specialist-tabs)/consult-thread",
                        params: {
                          conversationId:
                            row.$id,
                        },
                      } as any)
                    }
                    style={styles.card}
                  >
                    <View style={styles.icon}>
                      {isNurseConsult ? (
                        <MessageSquarePlus
                          size={18}
                          color={
                            colors.charcoal
                          }
                        />
                      ) : (
                        <UsersRound
                          size={18}
                          color={
                            colors.charcoal
                          }
                        />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>
                        {row.title
                          ? translateConsultTitle(
                              row.title,
                              language,
                            )
                          : tr(
                              nice(
                                row.conversationType,
                              ) ||
                                "Care conversation",
                            )}
                      </Text>

                      <Text style={styles.cardMeta}>
                        {isNurseConsult
                          ? tr(
                              "Nurse consult",
                            )
                          : tr(
                              nice(
                                row.conversationType ||
                                  "Care conversation",
                              ),
                            )}
                        {" • "}
                        {participants}
                        {" "}
                        {tr(
                          "participants",
                        )}
                      </Text>

                      <Text style={styles.cardStatus}>
                        {tr(
                          nice(
                            row.status ||
                              "active",
                          ),
                        )}
                      </Text>
                    </View>
                  </Pressable>
                );
              },
            )}
          </View>
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
    consultSummary: {
      marginTop: 14,
      minHeight: 64,
      paddingHorizontal: 13,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.white,
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
    },
    summaryValue: {
      fontFamily: fonts.bold,
      fontSize: 16,
      color: colors.text,
    },
    summaryLabel: {
      marginTop: 1,
      fontFamily:
        fonts.regular,
      fontSize: 8,
      color: colors.muted,
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
      marginTop: 14,
      gap: 9,
    },
    card: {
      minHeight: 76,
      padding: 12,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.white,
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
    },
    icon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor:
        colors.surfaceSoft,
      alignItems: "center",
      justifyContent:
        "center",
    },
    cardTitle: {
      fontFamily:
        fonts.bold,
      fontSize: 10,
      color:
        colors.text,
    },
    cardMeta: {
      marginTop: 3,
      fontFamily:
        fonts.regular,
      fontSize: 8,
      color:
        colors.muted,
    },
    cardStatus: {
      marginTop: 2,
      fontFamily:
        fonts.regular,
      fontSize: 7,
      color:
        colors.softMuted,
    },
  });
