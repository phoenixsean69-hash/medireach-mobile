import {
  BadgeCheck,
  Building2,
  CalendarDays,
  LogOut,
  Microscope,
  ShieldCheck,
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
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  account,
} from "../config/appwrite";

import {
  useSpecialistApp,
} from "../context/SpecialistAppContext";

import {
  colors,
  fonts,
  radius,
} from "../theme";

function Detail({
  label,
  value,
}: {
  label: string;
  value: unknown;
}) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>
        {label}
      </Text>

      <Text style={styles.detailValue}>
        {Array.isArray(value)
          ? value.join(", ") ||
            "Not set"
          : String(
              value ||
                "Not set",
            )}
      </Text>
    </View>
  );
}

export default function SpecialistProfileScreen() {
  const {
    profile,
  } =
    useSpecialistApp();

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
          "Sign out failed",
          error?.message ??
            "Unable to sign out.",
        );
      }
    };

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
              "Specialist"}
          </Text>

          <View style={styles.role}>
            <Microscope
              size={15}
              color={colors.charcoal}
            />

            <Text style={styles.roleText}>
              Specialist
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Professional details
        </Text>

        <View style={styles.card}>
          <Detail
            label="Medical council number"
            value={
              profile
                ?.medicalCouncilNumber
            }
          />

          <Detail
            label="Practitioner type"
            value={
              profile
                ?.practitionerType
            }
          />

          <Detail
            label="Clinical specialties"
            value={
              profile
                ?.clinicalSpecialties
            }
          />

          <Detail
            label="Specialty"
            value={
              profile?.specialty
            }
          />

          <Detail
            label="Subspecialty"
            value={
              profile
                ?.subspecialty
            }
          />

          <Detail
            label="Years experience"
            value={
              profile
                ?.yearsExperience
            }
          />

          <Detail
            label="Licence expiry"
            value={
              profile
                ?.licenseExpiry
            }
          />
        </View>

        <Text style={styles.sectionTitle}>
          Workplace
        </Text>

        <View style={styles.card}>
          <View style={styles.rowHeading}>
            <Building2
              size={18}
              color={colors.charcoal}
            />

            <Text style={styles.rowHeadingText}>
              {profile
                ?.facilityName ||
                "Facility not linked"}
            </Text>
          </View>

          <Detail
            label="Facility ID"
            value={
              profile?.facilityId
            }
          />

          <Detail
            label="Province"
            value={
              profile?.province
            }
          />

          <Detail
            label="District"
            value={
              profile?.district
            }
          />
        </View>

        <Text style={styles.sectionTitle}>
          Account
        </Text>

        <View style={styles.card}>
          <View style={styles.rowHeading}>
            <ShieldCheck
              size={18}
              color={colors.charcoal}
            />

            <Text style={styles.rowHeadingText}>
              {String(
                profile
                  ?.accountStatus ||
                  "active",
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
                Professional account
              </Text>
            </View>

            <View style={styles.badge}>
              <CalendarDays
                size={14}
                color={colors.charcoal}
              />

              <Text style={styles.badgeText}>
                English
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
            Sign out
          </Text>
        </Pressable>
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
      alignItems:
        "center",
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor:
        "rgba(255,255,255,0.12)",
      alignItems:
        "center",
      justifyContent:
        "center",
    },
    name: {
      marginTop: 13,
      fontFamily:
        fonts.bold,
      fontSize: 22,
      color:
        colors.white,
    },
    role: {
      marginTop: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 9,
      backgroundColor:
        colors.white,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 5,
    },
    roleText: {
      fontFamily:
        fonts.bold,
      fontSize: 8,
      color:
        colors.charcoal,
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
    card: {
      padding: 14,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.white,
      gap: 10,
    },
    detail: {
      paddingBottom: 9,
      borderBottomWidth: 1,
      borderBottomColor:
        colors.border,
    },
    detailLabel: {
      fontFamily:
        fonts.regular,
      fontSize: 8,
      color:
        colors.muted,
    },
    detailValue: {
      marginTop: 3,
      fontFamily:
        fonts.bold,
      fontSize: 10,
      color:
        colors.text,
    },
    rowHeading: {
      minHeight: 38,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 8,
    },
    rowHeadingText: {
      flex: 1,
      fontFamily:
        fonts.bold,
      fontSize: 11,
      color:
        colors.text,
    },
    badges: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 7,
    },
    badge: {
      paddingHorizontal: 9,
      paddingVertical: 7,
      borderRadius: 9,
      backgroundColor:
        colors.surfaceSoft,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 5,
    },
    badgeText: {
      fontFamily:
        fonts.bold,
      fontSize: 7,
      color:
        colors.charcoal,
    },
    signOut: {
      minHeight: 50,
      marginTop: 22,
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
      justifyContent:
        "center",
      gap: 8,
    },
    signOutText: {
      fontFamily:
        fonts.bold,
      fontSize: 10,
      color:
        colors.text,
    },
  });
