import {
  BellRing,
  HeartPulse,
  Siren,
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
  listNurseCareRequests,
  listNurseSosAlerts,
  type NurseGenericRow,
} from "../services/nurseDataService";

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

export default function NurseCareScreen() {
  const { t } =
    useNurseApp();

  const [careRows, setCareRows] =
    useState<NurseGenericRow[]>([]);

  const [sosRows, setSosRows] =
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
        const [care, sos] =
          await Promise.all([
            listNurseCareRequests(),
            listNurseSosAlerts(),
          ]);

        setCareRows(care);
        setSosRows(sos);
      }
      catch (
        nextError: any
      ) {
        setError(
          nextError?.message ??
            t(
              "Care data is not currently available.",
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

  const activeSos =
    sosRows.filter(
      (row) =>
        ![
          "closed",
          "resolved",
        ].includes(
          String(
            row.status || "",
          ).toLowerCase(),
        ),
    );

  const localStatus =
    (value: unknown) =>
      t(
        niceStatus(
          value,
        ),
      );

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
          <HeartPulse
            size={22}
            color={colors.white}
          />
        </View>

        <Text style={styles.title}>
          {t("Care")}
        </Text>

        <Text style={styles.subtitle}>
          {t(
            "Review accessible care requests and emergency activity.",
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
            {t("Care data unavailable")}
          </Text>

          <Text style={styles.stateText}>
            {error}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.sosSummary}>
            <View style={styles.sosIcon}>
              <Siren
                size={20}
                color={colors.white}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.sosTitle}>
                {t("Active SOS")}
              </Text>

              <Text style={styles.sosCount}>
                {activeSos.length}
              </Text>
            </View>

            <BellRing
              size={18}
              color={colors.error}
            />
          </View>

          <Text style={styles.sectionTitle}>
            {t("Care requests")}
          </Text>

          {careRows.length === 0 ? (
            <View style={styles.stateCard}>
              <Text style={styles.stateTitle}>
                {t("No care requests")}
              </Text>

              <Text style={styles.stateText}>
                {t(
                  "No accessible unassigned or nurse-assigned care requests are available.",
                )}
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {careRows.map(
                (row) => (
                  <View
                    key={row.$id}
                    style={styles.card}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>
                        {row.description ||
                          row.requestType ||
                          t("Care request")}
                      </Text>

                      <Text style={styles.cardMeta}>
                        {[
                          localStatus(
                            row.priority ||
                              row.urgency,
                          ),
                          localStatus(
                            row.status,
                          ),
                        ].join(" • ")}
                      </Text>
                    </View>

                    <View style={styles.status}>
                      <Text style={styles.statusText}>
                        {localStatus(
                          row.status,
                        )}
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
    sosSummary: {
      marginTop: 14,
      minHeight: 78,
      padding: 13,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.card,
      backgroundColor: colors.white,
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
    },
    sosIcon: {
      width: 44,
      height: 44,
      borderRadius: 13,
      backgroundColor: colors.error,
      alignItems: "center",
      justifyContent: "center",
    },
    sosTitle: {
      fontFamily: fonts.regular,
      fontSize: 9,
      color: colors.muted,
    },
    sosCount: {
      marginTop: 2,
      fontFamily: fonts.bold,
      fontSize: 22,
      color: colors.text,
    },
    sectionTitle: {
      marginTop: 22,
      marginBottom: 10,
      fontFamily: fonts.bold,
      fontSize: 14,
      color: colors.text,
    },
    list: {
      gap: 9,
    },
    card: {
      minHeight: 76,
      padding: 13,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.card,
      backgroundColor: colors.white,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    cardTitle: {
      fontFamily: fonts.bold,
      fontSize: 10,
      color: colors.text,
    },
    cardMeta: {
      marginTop: 4,
      fontFamily: fonts.regular,
      fontSize: 8,
      color: colors.muted,
    },
    status: {
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 9,
      backgroundColor: colors.surfaceSoft,
    },
    statusText: {
      fontFamily: fonts.bold,
      fontSize: 7,
      color: colors.charcoal,
    },
  });
