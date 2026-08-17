import {
  MessageCircle,
  UsersRound,
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
  useNurseApp,
} from "../context/NurseAppContext";

import {
  listNurseConversations,
  type NurseGenericRow,
} from "../services/nurseDataService";

import {
  colors,
  fonts,
  radius,
} from "../theme";

export default function NurseMessagesScreen() {
  const { t } =
    useNurseApp();

  const [rows, setRows] =
    useState<NurseGenericRow[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
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
          await listNurseConversations(),
        );
      }
      catch (
        nextError: any
      ) {
        setError(
          nextError?.message ??
            t(
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

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
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
          {t("Messages")}
        </Text>

        <Text style={styles.subtitle}>
          {t(
            "Secure conversations where your nurse account is a participant.",
          )}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          style={{ marginTop: 28 }}
          color={colors.charcoal}
        />
      ) : error ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>
            {t("Messages unavailable")}
          </Text>

          <Text style={styles.stateText}>
            {error}
          </Text>
        </View>
      ) : rows.length === 0 ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>
            {t("No conversations")}
          </Text>

          <Text style={styles.stateText}>
            {t(
              "Conversations involving this nurse account will appear here.",
            )}
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {rows.map(
            (row) => {
              const participants =
                Array.isArray(
                  row.participantIds,
                )
                  ? row.participantIds.length
                  : 0;

              return (
                <View
                  key={row.$id}
                  style={styles.card}
                >
                  <View style={styles.icon}>
                    <UsersRound
                      size={18}
                      color={
                        colors.charcoal
                      }
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>
                      {row.title ||
                        row.conversationType ||
                        t("Care conversation")}
                    </Text>

                    <Text style={styles.cardMeta}>
                      {participants}
                      {" "}
                      {t("participants")}
                      {" • "}
                      {t(
                        String(
                          row.status ||
                            "active",
                        )
                          .replace(/_/g, " ")
                          .replace(
                            /\b\w/g,
                            (letter) =>
                              letter.toUpperCase(),
                          ),
                      )}
                    </Text>
                  </View>
                </View>
              );
            },
          )}
        </View>
      )}
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
    heading: {
      padding: 18,
      borderRadius: radius.large,
      backgroundColor: colors.charcoal,
    },
    headingIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: "rgba(255,255,255,0.12)",
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      marginTop: 13,
      fontFamily: fonts.bold,
      fontSize: 24,
      color: colors.white,
    },
    subtitle: {
      marginTop: 5,
      fontFamily: fonts.regular,
      fontSize: 9,
      lineHeight: 14,
      color: colors.border,
    },
    stateCard: {
      marginTop: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.card,
      backgroundColor: colors.white,
    },
    stateTitle: {
      fontFamily: fonts.bold,
      fontSize: 11,
      color: colors.text,
    },
    stateText: {
      marginTop: 4,
      fontFamily: fonts.regular,
      fontSize: 9,
      lineHeight: 14,
      color: colors.muted,
    },
    list: {
      marginTop: 14,
      gap: 9,
    },
    card: {
      minHeight: 72,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.card,
      backgroundColor: colors.white,
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
    },
    icon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: colors.surfaceSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    cardTitle: {
      fontFamily: fonts.bold,
      fontSize: 10,
      color: colors.text,
    },
    cardMeta: {
      marginTop: 3,
      fontFamily: fonts.regular,
      fontSize: 8,
      color: colors.muted,
    },
  });
