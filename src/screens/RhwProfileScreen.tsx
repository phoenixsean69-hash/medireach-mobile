import {
  Building2,
  LogOut,
  MapPinned,
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
  account,
} from "../config/appwrite";

import {
  useRhwApp,
} from "../context/RhwAppContext";

import {
  colors,
  fonts,
  radius,
} from "../theme";

export default function RhwProfileScreen() {
  const {
    profile,
    user,
    t,
  } =
    useRhwApp();

  const logout =
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
          t(
            "Sign out failed",
          ),
          error?.message ??
            t(
              "Unable to sign out.",
            ),
        );
      }
    };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={
        styles.content
      }
    >
      <Text
        style={
          styles.title
        }
      >
        {t(
          "RHW profile",
        )}
      </Text>

      <View
        style={
          styles.card
        }
      >
        <View
          style={
            styles.avatar
          }
        >
          <UserRound
            size={25}
            color={
              colors.white
            }
          />
        </View>

        <Text
          style={
            styles.name
          }
        >
          {[
            profile
              ?.firstName,
            profile
              ?.lastName,
          ]
            .filter(Boolean)
            .join(" ") ||
            user?.name ||
            user?.email}
        </Text>

        <Text
          style={
            styles.role
          }
        >
          {t(
            "Rural Health Worker",
          )}
        </Text>

        <View
          style={
            styles.row
          }
        >
          <Building2
            size={18}
            color={
              colors.muted
            }
          />

          <Text
            style={
              styles.rowText
            }
          >
            {profile
              ?.facilityName ||
              profile
                ?.facilityId ||
              t(
                "Not set",
              )}
          </Text>
        </View>

        <View
          style={
            styles.row
          }
        >
          <MapPinned
            size={18}
            color={
              colors.muted
            }
          />

          <Text
            style={
              styles.rowText
            }
          >
            {profile
              ?.catchmentArea ||
              t(
                "Not set",
              )}
          </Text>
        </View>

        <View
          style={
            styles.row
          }
        >
          <ShieldCheck
            size={18}
            color={
              colors.muted
            }
          />

          <Text
            style={
              styles.rowText
            }
          >
            {profile
              ?.accountStatus ||
              t("Active")}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={logout}
        style={
          styles.logout
        }
      >
        <LogOut
          size={18}
          color={
            colors.charcoal
          }
        />

        <Text
          style={
            styles.logoutText
          }
        >
          {t(
            "Sign out",
          )}
        </Text>
      </Pressable>
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
      paddingTop: 28,
      paddingBottom: 40,
    },

    title: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 26,
    },

    card: {
      marginTop: 18,
      padding: 18,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.large,
      backgroundColor:
        colors.white,
    },

    avatar: {
      width: 54,
      height: 54,
      borderRadius: 17,
      backgroundColor:
        colors.charcoal,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    name: {
      marginTop: 13,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 17,
    },

    role: {
      marginTop: 4,
      marginBottom: 14,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 9,
    },

    row: {
      minHeight: 51,
      borderTopWidth: 1,
      borderTopColor:
        colors.border,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 9,
    },

    rowText: {
      flex: 1,
      fontFamily:
        fonts.semiBold,
      color:
        colors.text,
      fontSize: 9,
    },

    logout: {
      minHeight: 50,
      marginTop: 13,
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

    logoutText: {
      fontFamily:
        fonts.bold,
      color:
        colors.charcoal,
      fontSize: 10,
    },
  });
