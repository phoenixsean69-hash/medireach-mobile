import {
  Search,
  UserRound,
  UsersRound,
} from "lucide-react-native";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  useDoctorApp,
} from "../context/DoctorAppContext";

import {
  listDoctorPatients,
  type DoctorGenericRow,
} from "../services/doctorDataService";

import {
  colors,
  fonts,
  radius,
} from "../theme";

function displayName(
  row:
    DoctorGenericRow,
) {
  const name =
    [
      row.firstName,
      row.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

  return (
    name ||
    row.patientNumber ||
    row.$id
  );
}

export default function DoctorPatientsScreen() {
  const { t } =
    useDoctorApp();

  const [
    rows,
    setRows,
  ] =
    useState<
      DoctorGenericRow[]
    >([]);

  const [
    query,
    setQuery,
  ] =
    useState("");

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
        ? setRefreshing(
            true,
          )
        : setLoading(
            true,
          );

      setError("");

      try {
        setRows(
          await listDoctorPatients(),
        );
      }
      catch (
        nextError: any
      ) {
        setError(
          nextError?.message ??
            t(
              "Patient records are not currently available.",
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

  const visible =
    useMemo(
      () => {
        const needle =
          query
            .trim()
            .toLowerCase();

        if (!needle) {
          return rows;
        }

        return rows.filter(
          (row) =>
            [
              row.firstName,
              row.lastName,
              row.patientNumber,
              row.phone,
              row.bloodGroup,
              row.conditions,
            ].some(
              (value) =>
                String(
                  value || "",
                )
                  .toLowerCase()
                  .includes(
                    needle,
                  ),
            ),
        );
      },
      [
        query,
        rows,
      ],
    );

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
          <UsersRound
            size={22}
            color={colors.white}
          />
        </View>

        <Text style={styles.title}>
          {t("Patients")}
        </Text>

        <Text style={styles.subtitle}>
          {t(
            "Patient records that your current MediReach permissions allow you to access.",
          )}
        </Text>
      </View>

      <View style={styles.search}>
        <Search
          size={17}
          color={colors.muted}
        />

        <TextInput
          value={query}
          onChangeText={
            setQuery
          }
          placeholder={
            t("Search patients")
          }
          placeholderTextColor={
            colors.muted
          }
          style={styles.input}
        />
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
              "Patient data unavailable",
            )}
          </Text>

          <Text style={styles.stateText}>
            {error}
          </Text>
        </View>
      ) : visible.length === 0 ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>
            {t(
              "No patient records",
            )}
          </Text>

          <Text style={styles.stateText}>
            {t(
              "No accessible patient records matched this view.",
            )}
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {visible.map(
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
                  <Text style={styles.name}>
                    {displayName(row)}
                  </Text>

                  <Text style={styles.meta}>
                    {[
                      row.patientNumber,
                      row.gender,
                      row.bloodGroup
                        ? `${t("Blood")} ${row.bloodGroup}`
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" • ") ||
                      t("Patient record")}
                  </Text>
                </View>
              </View>
            ),
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

    search: {
      marginTop: 14,
      minHeight: 48,
      paddingHorizontal: 13,
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
      gap: 8,
    },

    input: {
      flex: 1,
      minHeight: 46,
      fontFamily:
        fonts.regular,
      fontSize: 11,
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
      marginTop: 14,
      gap: 9,
    },

    card: {
      minHeight: 70,
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
        "center",
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

    name: {
      fontFamily:
        fonts.bold,
      fontSize: 11,
      color:
        colors.text,
    },

    meta: {
      marginTop: 3,
      fontFamily:
        fonts.regular,
      fontSize: 8,
      color:
        colors.muted,
    },
  });
