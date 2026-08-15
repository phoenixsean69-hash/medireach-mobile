import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Check,
  Languages,
  LogOut,
  UserRound,
} from "lucide-react-native";

import {
  router,
} from "expo-router";

import {
  account,
} from "../../config/appwrite";

import {
  type AppLanguage,
  useCitizenApp,
} from "../../context/CitizenAppContext";

import {
  colors,
  fonts,
  radius,
} from "../../theme";

const LANGUAGES:
  AppLanguage[] = [
    "English",
    "Shona",
    "isiNdebele",
  ];

export default function ProfileScreen() {
  const {
    profile,
    patient,
    language,
    t,
    changeLanguage,
  } =
    useCitizenApp();

  const fullName = [
    profile?.firstName ||
      patient?.firstName,
    profile?.lastName ||
      patient?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const phone =
    profile?.phone ||
    patient?.phone ||
    "";

  const change =
    async (
      nextLanguage:
        AppLanguage,
    ) => {
      if (
        nextLanguage ===
        language
      ) {
        return;
      }

      try {
        await changeLanguage(
          nextLanguage,
        );

        Alert.alert(
          t(
            "Language updated",
          ),
          t(
            "Your MediReach language has been updated.",
          ),
        );
      }
      catch (
        error: any
      ) {
        Alert.alert(
          t(
            "Language update failed",
          ),
          error?.message ??
            t(
              "Could not update your language.",
            ),
        );
      }
    };

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
      showsVerticalScrollIndicator={
        false
      }
    >
      <View
        style={
          styles.avatar
        }
      >
        <UserRound
          size={30}
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
        {fullName ||
          t(
            "Citizen / Patient",
          )}
      </Text>

      {phone ? (
        <Text
          style={
            styles.phone
          }
        >
          {phone}
        </Text>
      ) : null}

      <Text
        style={
          styles.sectionTitle
        }
      >
        {t(
          "Language",
        )}
      </Text>

      <View
        style={
          styles.languageCard
        }
      >
        <View
          style={
            styles.languageHeader
          }
        >
          <Languages
            size={20}
            color={
              colors.charcoal
            }
          />

          <Text
            style={
              styles.languageHeaderText
            }
          >
            {t(
              "Language",
            )}
          </Text>
        </View>

        <View
          style={
            styles.languageOptions
          }
        >
          {LANGUAGES.map(
            (
              item,
            ) => {
              const active =
                language ===
                item;

              return (
                <Pressable
                  key={item}
                  onPress={() =>
                    change(
                      item,
                    )
                  }
                  style={[
                    styles.languageButton,
                    active &&
                      styles.languageButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.languageText,
                      active &&
                        styles.languageTextActive,
                    ]}
                  >
                    {item ===
                    "Shona"
                      ? t(
                          "Shona",
                        )
                      : t(
                          item,
                        )}
                  </Text>

                  {active ? (
                    <Check
                      size={16}
                      color={
                        colors.white
                      }
                    />
                  ) : null}
                </Pressable>
              );
            },
          )}
        </View>
      </View>

      <Pressable
        style={
          styles.logout
        }
        onPress={
          logout
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
      padding: 20,
      paddingTop: 38,
      paddingBottom: 40,
      alignItems:
        "center",
    },

    avatar: {
      width: 72,
      height: 72,
      borderRadius: 22,
      backgroundColor:
        colors.charcoal,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    name: {
      marginTop: 14,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 22,
      textAlign:
        "center",
    },

    phone: {
      marginTop: 4,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 11,
    },

    sectionTitle: {
      width: "100%",
      marginTop: 30,
      marginBottom: 10,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 14,
    },

    languageCard: {
      width: "100%",
      padding: 15,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.large,
      backgroundColor:
        colors.white,
    },

    languageHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 8,
    },

    languageHeaderText: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 12,
    },

    languageOptions: {
      marginTop: 13,
      gap: 8,
    },

    languageButton: {
      minHeight: 48,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    languageButtonActive: {
      backgroundColor:
        colors.charcoal,
      borderColor:
        colors.charcoal,
    },

    languageText: {
      fontFamily:
        fonts.semiBold,
      color:
        colors.text,
      fontSize: 11,
    },

    languageTextActive: {
      color:
        colors.white,
    },

    logout: {
      width: "100%",
      minHeight: 52,
      marginTop: 20,
      paddingHorizontal: 15,
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
        colors.text,
      fontSize: 11,
    },
  });
