import {
  BriefcaseMedical,
  MapPin,
  UserRound,
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
  listSpecialistReferrals,
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
      (letter) =>
        letter.toUpperCase(),
    );
}

export default function SpecialistReferralsScreen() {
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
          await listSpecialistReferrals(),
        );
      }
      catch (
        nextError: any
      ) {
        setError(
          nextError?.message ??
            "Referral data is not currently available.",
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
            <BriefcaseMedical
              size={22}
              color={colors.white}
            />
          </View>

          <Text style={styles.title}>
            Referrals
          </Text>

          <Text style={styles.subtitle}>
            Incoming specialist referrals currently accessible to your account.
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
              Referrals unavailable
            </Text>

            <Text style={styles.stateText}>
              {error}
            </Text>
          </View>
        ) : rows.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>
              No referrals
            </Text>

            <Text style={styles.stateText}>
              No specialist referrals are currently available to this account.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {rows.map(
              (row) => (
                <View
                  key={row.$id}
                  style={styles.card}
                >
                  <View style={styles.avatar}>
                    <UserRound
                      size={18}
                      color={
                        colors.charcoal
                      }
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>
                      {row.reason ||
                        row.summary ||
                        row.notes ||
                        "Specialist referral"}
                    </Text>

                    <Text style={styles.cardMeta}>
                      {[
                        row.priority
                          ? nice(
                              row.priority,
                            )
                          : "",
                        row.status
                          ? nice(
                              row.status,
                            )
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" • ") ||
                        "Referral"}
                    </Text>

                    {row.destinationFacilityId ||
                    row.facilityId ? (
                      <View style={styles.facilityRow}>
                        <MapPin
                          size={13}
                          color={
                            colors.muted
                          }
                        />

                        <Text style={styles.facilityText}>
                          {String(
                            row.destinationFacilityId ||
                              row.facilityId,
                          )}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ),
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
      minHeight: 82,
      padding: 12,
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
        "flex-start",
      gap: 11,
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor:
        colors.surfaceSoft,
      alignItems:
        "center",
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
      marginTop: 4,
      fontFamily:
        fonts.regular,
      fontSize: 8,
      color:
        colors.muted,
    },
    facilityRow: {
      marginTop: 6,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 4,
    },
    facilityText: {
      fontFamily:
        fonts.regular,
      fontSize: 7,
      color:
        colors.muted,
    },
  });
