import {
  BadgeCheck,
  Building2,
  CalendarDays,
  LogOut,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react-native";

import {
  router,
} from "expo-router";

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  account,
} from "../config/appwrite";

import {
  useNurseApp,
} from "../context/NurseAppContext";

import {
  colors,
  fonts,
  radius,
} from "../theme";

function Detail({
  label,
  value,
  fallback,
}: {
  label: string;
  value: unknown;
  fallback: string;
}) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>
        {label}
      </Text>

      <Text style={styles.detailValue}>
        {String(
          value || fallback,
        )}
      </Text>
    </View>
  );
}

export default function NurseProfileScreen() {
  const {
    profile,
    t,
  } =
    useNurseApp();

  const signOut =
    async () => {
      try {
        await account
          .deleteSession({
            sessionId:
              "current",
          });

        router.replace(
          "/login",
        );
      }
      catch (
        error: any
      ) {
        Alert.alert(
          t("Sign out failed"),
          error?.message ??
            t(
              "Unable to sign out.",
            ),
        );
      }
    };

  const fallback =
    t("Not set");

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
    >
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <UserRound
            size={28}
            color={colors.white}
          />
        </View>

        <Text style={styles.name}>
          {[
            profile?.firstName,
            profile?.lastName,
          ]
            .filter(Boolean)
            .join(" ") ||
            t("Nurse")}
        </Text>

        <View style={styles.role}>
          <Stethoscope
            size={15}
            color={colors.charcoal}
          />

          <Text style={styles.roleText}>
            {t("Nurse")}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        {t("Professional details")}
      </Text>

      <View style={styles.card}>
        <Detail
          label={t("Nursing cadre")}
          value={profile?.nursingCadre}
          fallback={fallback}
        />

        <Detail
          label={t("Registration number")}
          value={
            profile
              ?.professionalRegistrationNumber
          }
          fallback={fallback}
        />

        <Detail
          label={t("Department / ward")}
          value={
            profile?.departmentWard
          }
          fallback={fallback}
        />

        <Detail
          label={t("Years experience")}
          value={
            profile?.yearsExperience
          }
          fallback={fallback}
        />

        <Detail
          label={t("Licence expiry")}
          value={
            profile?.licenseExpiry
          }
          fallback={fallback}
        />
      </View>

      <Text style={styles.sectionTitle}>
        {t("Workplace")}
      </Text>

      <View style={styles.card}>
        <View style={styles.rowHeading}>
          <Building2
            size={18}
            color={colors.charcoal}
          />

          <Text style={styles.rowHeadingText}>
            {profile?.facilityName ||
              t("Facility not linked")}
          </Text>
        </View>

        <Detail
          label={t("Facility ID")}
          value={profile?.facilityId}
          fallback={fallback}
        />

        <Detail
          label={t("Province")}
          value={profile?.province}
          fallback={fallback}
        />

        <Detail
          label={t("District")}
          value={profile?.district}
          fallback={fallback}
        />
      </View>

      <Text style={styles.sectionTitle}>
        {t("Account")}
      </Text>

      <View style={styles.card}>
        <View style={styles.rowHeading}>
          <ShieldCheck
            size={18}
            color={colors.charcoal}
          />

          <Text style={styles.rowHeadingText}>
            {t(
              String(
                profile?.accountStatus ||
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

        <View style={styles.badges}>
          <View style={styles.badge}>
            <BadgeCheck
              size={14}
              color={colors.charcoal}
            />

            <Text style={styles.badgeText}>
              {t(
                "Professional account",
              )}
            </Text>
          </View>

          <View style={styles.badge}>
            <CalendarDays
              size={14}
              color={colors.charcoal}
            />

            <Text style={styles.badgeText}>
              {profile
                ?.preferredLanguage ||
                "English"}
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        onPress={signOut}
        style={styles.signOut}
      >
        <LogOut
          size={18}
          color={colors.charcoal}
        />

        <Text style={styles.signOutText}>
          {t("Sign out")}
        </Text>
      </Pressable>
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
      alignItems: "center",
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.12)",
      alignItems: "center",
      justifyContent: "center",
    },
    name: {
      marginTop: 13,
      fontFamily: fonts.bold,
      fontSize: 22,
      color: colors.white,
    },
    role: {
      marginTop: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 9,
      backgroundColor: colors.white,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    roleText: {
      fontFamily: fonts.bold,
      fontSize: 8,
      color: colors.charcoal,
    },
    sectionTitle: {
      marginTop: 22,
      marginBottom: 10,
      fontFamily: fonts.bold,
      fontSize: 14,
      color: colors.text,
    },
    card: {
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.card,
      backgroundColor: colors.white,
      gap: 10,
    },
    detail: {
      paddingBottom: 9,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    detailLabel: {
      fontFamily: fonts.regular,
      fontSize: 8,
      color: colors.muted,
    },
    detailValue: {
      marginTop: 3,
      fontFamily: fonts.bold,
      fontSize: 10,
      color: colors.text,
    },
    rowHeading: {
      minHeight: 38,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    rowHeadingText: {
      flex: 1,
      fontFamily: fonts.bold,
      fontSize: 11,
      color: colors.text,
    },
    badges: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 7,
    },
    badge: {
      paddingHorizontal: 9,
      paddingVertical: 7,
      borderRadius: 9,
      backgroundColor: colors.surfaceSoft,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    badgeText: {
      fontFamily: fonts.bold,
      fontSize: 7,
      color: colors.charcoal,
    },
    signOut: {
      minHeight: 50,
      marginTop: 22,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.card,
      backgroundColor: colors.white,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    signOutText: {
      fontFamily: fonts.bold,
      fontSize: 10,
      color: colors.text,
    },
  });
