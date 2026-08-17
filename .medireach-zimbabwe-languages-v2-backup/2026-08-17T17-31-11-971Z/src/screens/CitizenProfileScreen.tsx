import {
  Check,
  ChevronRight,
  CircleHelp,
  HeartPulse,
  Languages,
  LogOut,
  MapPinned,
  Phone,
  ShieldPlus,
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
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  account,
} from "../config/appwrite";

import {
  type AppLanguage,
  useCitizenApp,
} from "../context/CitizenAppContext";

import CitizenOfflineBanner from "../components/citizen/CitizenOfflineBanner";

import {
  signupOptionLabel,
} from "../localization/signupLocalization";

import {
  colors,
  fonts,
  radius,
} from "../theme";

const LANGUAGES:
  AppLanguage[] = [
    "English",
    "Shona",
    "isiNdebele",
  ];

function localizeClinicalValue(
  value: unknown,
  language: string,
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  const values =
    Array.isArray(value)
      ? value.map(String)
      : String(value)
          .split(";")
          .map(
            (item) =>
              item.trim(),
          )
          .filter(Boolean);

  return values
    .map((item) =>
      signupOptionLabel(
        item,
        language,
      ),
    )
    .join("; ");
}

function Detail({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  const {
    t,
  } =
    useCitizenApp();

  return (
    <View
      style={
        styles.detail
      }
    >
      <Text
        style={
          styles.detailLabel
        }
      >
        {t(label)}
      </Text>

      <Text
        style={
          styles.detailValue
        }
      >
        {value?.trim()
          ? value
          : t(
              "Not added",
            )}
      </Text>
    </View>
  );
}

export default function CitizenProfileScreen() {
  const insets =
    useSafeAreaInsets();

  const {
    profile,
    patient,
    language,
    t,
    changeLanguage,
  } =
    useCitizenApp();

  const helpCopy =
    language ===
    "Shona"
      ? {
          section:
            "Rubatsiro",
          title:
            "Rubatsiro & kushandisa pasina internet",
          subtitle:
            "Vhura static USSD demo yeMediReach.",
        }
      : language ===
        "isiNdebele"
      ? {
          section:
            "Usizo",
          title:
            "Usizo & ukusebenzisa ungela-inthanethi",
          subtitle:
            "Vula i-static USSD demo yeMediReach.",
        }
      : {
          section:
            "Help",
          title:
            "Help & offline access",
          subtitle:
            "Open the static MediReach USSD demo.",
        };

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

  const email =
    profile?.contactEmail ||
    patient?.contactEmail ||
    "";

  const address = [
    profile?.address ||
      patient?.address,
    profile?.city ||
      patient?.city,
    profile?.district ||
      patient?.district,
    profile?.province ||
      patient?.province,
  ]
    .filter(Boolean)
    .join(", ");

  const emergencyContact =
    [
      profile
        ?.emergencyContactName,
      profile
        ?.emergencyContactPhone,
      profile
        ?.emergencyContactRelationship,
    ]
      .filter(Boolean)
      .join(" · ");

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
      style={
        styles.root
      }
      contentContainerStyle={[
        styles.content,
        {
          paddingTop:
            Math.max(
              insets.top + 12,
              26,
            ),
        },
      ]}
      showsVerticalScrollIndicator={
        false
      }
    >
      <CitizenOfflineBanner />
      <View
        style={
          styles.identity
        }
      >
        <View
          style={
            styles.avatar
          }
        >
          <UserRound
            size={28}
            color={
              colors.white
            }
          />
        </View>

        <View
          style={{
            flex: 1,
          }}
        >
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

          <Text
            style={
              styles.role
            }
          >
            {t(
              "Citizen / Patient",
            )}
          </Text>
        </View>

        <View
          style={
            styles.healthBadge
          }
        >
          <HeartPulse
            size={18}
            color={
              colors.charcoal
            }
          />
        </View>
      </View>

      <Text
        style={
          styles.sectionTitle
        }
      >
        Account
      </Text>

      <View
        style={
          styles.card
        }
      >
        <View
          style={
            styles.contactRow
          }
        >
          <Phone
            size={17}
            color={
              colors.charcoal
            }
          />

          <View
            style={{
              flex: 1,
            }}
          >
            <Text
              style={
                styles.contactLabel
              }
            >
              Phone
            </Text>

            <Text
              style={
                styles.contactValue
              }
            >
              {phone ||
                t(
                  "Not added",
                )}
            </Text>
          </View>
        </View>

        <View
          style={
            styles.divider
          }
        />

        <Detail
          label="Email"
          value={email}
        />

        <View
          style={
            styles.divider
          }
        />

        <View
          style={
            styles.contactRow
          }
        >
          <MapPinned
            size={17}
            color={
              colors.charcoal
            }
          />

          <View
            style={{
              flex: 1,
            }}
          >
            <Text
              style={
                styles.contactLabel
              }
            >
              Current area
            </Text>

            <Text
              style={
                styles.contactValue
              }
            >
              {address ||
                t(
                  "Not added",
                )}
            </Text>
          </View>
        </View>
      </View>

      <Text
        style={
          styles.sectionTitle
        }
      >
        {t(
          "Health summary",
        )}
      </Text>

      <View
        style={
          styles.card
        }
      >
        <Detail
          label="Blood group"
          value={
            patient?.bloodGroup
          }
        />

        <View
          style={
            styles.divider
          }
        />

        <Detail
          label="Allergies"
          value={
            localizeClinicalValue(
              patient?.allergies,
              language,
            )
          }
        />

        <View
          style={
            styles.divider
          }
        />

        <Detail
          label="Conditions"
          value={
            localizeClinicalValue(
              patient?.conditions,
              language,
            )
          }
        />

        <View
          style={
            styles.divider
          }
        />

        <Detail
          label="Disability / access needs"
          value={
            String(
              patient
                ?.disabilitiesAccessNeeds ??
                "",
            )
          }
        />

        <View
          style={
            styles.divider
          }
        />

        <Detail
          label="Medical aid"
          value={[
            patient
              ?.medicalAidProvider,
            patient
              ?.medicalAidNumber,
          ]
            .filter(Boolean)
            .join(" · ")}
        />
      </View>

      <Text
        style={
          styles.sectionTitle
        }
      >
        Emergency contact
      </Text>

      <View
        style={
          styles.card
        }
      >
        <View
          style={
            styles.emergencyRow
          }
        >
          <ShieldPlus
            size={20}
            color={
              colors.charcoal
            }
          />

          <Text
            style={
              styles.emergencyValue
            }
          >
            {emergencyContact ||
              t(
                "Not added",
              )}
          </Text>
        </View>
      </View>

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
            (item) => {
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

      <Text
        style={
          styles.sectionTitle
        }
      >
        {
          helpCopy.section
        }
      </Text>

      <Pressable
        style={
          styles.helpCard
        }
        onPress={() =>
          router.push(
            "/help",
          )
        }
      >
        <View
          style={
            styles.helpIcon
          }
        >
          <CircleHelp
            size={20}
            color={
              colors.white
            }
          />
        </View>

        <View
          style={{
            flex: 1,
          }}
        >
          <Text
            style={
              styles.helpTitle
            }
          >
            {
              helpCopy.title
            }
          </Text>

          <Text
            style={
              styles.helpSubtitle
            }
          >
            {
              helpCopy.subtitle
            }
          </Text>
        </View>

        <ChevronRight
          size={18}
          color={
            colors.softMuted
          }
        />
      </Pressable>

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
    root:{
      flex:1,
      backgroundColor:
        colors.canvas,
    },
    content:{
      paddingHorizontal:18,
      paddingBottom:40,
    },
    identity:{
      minHeight:88,
      padding:14,
      borderRadius:
        radius.large,
      backgroundColor:
        colors.charcoal,
      flexDirection:"row",
      alignItems:"center",
      gap:11,
    },
    avatar:{
      width:52,
      height:52,
      borderRadius:16,
      backgroundColor:
        colors.charcoalSoft,
      alignItems:"center",
      justifyContent:"center",
    },
    name:{
      fontFamily:fonts.bold,
      color:colors.white,
      fontSize:16,
    },
    role:{
      marginTop:3,
      fontFamily:fonts.regular,
      color:colors.border,
      fontSize:9,
    },
    healthBadge:{
      width:36,
      height:36,
      borderRadius:11,
      backgroundColor:
        colors.white,
      alignItems:"center",
      justifyContent:"center",
    },
    sectionTitle:{
      marginTop:22,
      marginBottom:9,
      fontFamily:fonts.bold,
      color:colors.text,
      fontSize:13,
    },
    card:{
      paddingHorizontal:13,
      borderRadius:
        radius.large,
      borderWidth:1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.white,
    },
    contactRow:{
      minHeight:64,
      flexDirection:"row",
      alignItems:"center",
      gap:9,
    },
    contactLabel:{
      fontFamily:fonts.regular,
      color:colors.muted,
      fontSize:8,
    },
    contactValue:{
      marginTop:2,
      fontFamily:fonts.bold,
      color:colors.text,
      fontSize:10,
      lineHeight:14,
    },
    detail:{
      minHeight:62,
      paddingVertical:11,
    },
    detailLabel:{
      fontFamily:fonts.regular,
      color:colors.muted,
      fontSize:8,
    },
    detailValue:{
      marginTop:3,
      fontFamily:fonts.bold,
      color:colors.text,
      fontSize:10,
      lineHeight:14,
    },
    divider:{
      height:1,
      backgroundColor:
        colors.border,
    },
    emergencyRow:{
      minHeight:64,
      flexDirection:"row",
      alignItems:"center",
      gap:10,
    },
    emergencyValue:{
      flex:1,
      fontFamily:fonts.semiBold,
      color:colors.text,
      fontSize:10,
      lineHeight:15,
    },
    languageCard:{
      padding:14,
      borderWidth:1,
      borderColor:
        colors.border,
      borderRadius:
        radius.large,
      backgroundColor:
        colors.white,
    },
    languageHeader:{
      flexDirection:"row",
      alignItems:"center",
      gap:8,
    },
    languageHeaderText:{
      fontFamily:fonts.bold,
      color:colors.text,
      fontSize:11,
    },
    languageOptions:{
      marginTop:12,
      gap:7,
    },
    languageButton:{
      minHeight:46,
      paddingHorizontal:13,
      borderWidth:1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      flexDirection:"row",
      alignItems:"center",
      justifyContent:
        "space-between",
    },
    languageButtonActive:{
      backgroundColor:
        colors.charcoal,
      borderColor:
        colors.charcoal,
    },
    languageText:{
      fontFamily:fonts.semiBold,
      color:colors.text,
      fontSize:10,
    },
    languageTextActive:{
      color:colors.white,
    },
    helpCard:{
      minHeight:72,
      paddingHorizontal:13,
      borderWidth:1,
      borderColor:
        colors.border,
      borderRadius:
        radius.large,
      backgroundColor:
        colors.white,
      flexDirection:"row",
      alignItems:"center",
      gap:11,
    },
    helpIcon:{
      width:40,
      height:40,
      borderRadius:12,
      backgroundColor:
        colors.charcoal,
      alignItems:"center",
      justifyContent:"center",
    },
    helpTitle:{
      fontFamily:fonts.bold,
      color:colors.text,
      fontSize:10,
    },
    helpSubtitle:{
      marginTop:3,
      fontFamily:fonts.regular,
      color:colors.muted,
      fontSize:8,
      lineHeight:12,
    },
    logout:{
      minHeight:50,
      marginTop:20,
      borderWidth:1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.white,
      flexDirection:"row",
      alignItems:"center",
      justifyContent:"center",
      gap:8,
    },
    logoutText:{
      fontFamily:fonts.bold,
      color:colors.text,
      fontSize:10,
    },
  });
