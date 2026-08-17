import {
  ArrowLeft,
  CircleHelp,
  PhoneCall,
  Send,
  ShieldCheck,
  WifiOff,
  X,
} from "lucide-react-native";

import {
  router,
} from "expo-router";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  CITIZEN_USSD_ACCESS_CODES,
  CITIZEN_USSD_DEMO,
  citizenUssdLanguageFromApp,
  getCitizenUssdAccessLabel,
  handleCitizenStaticUssd,
  type CitizenUssdDemoLanguage,
  type CitizenUssdDemoNetwork,
} from "../data/citizenUssdDemoData";

import {
  useCitizenApp,
} from "../context/CitizenAppContext";

import {
  colors,
  fonts,
  radius,
} from "../theme";

const NETWORKS:
  CitizenUssdDemoNetwork[] = [
    "ECONET",
    "NETONE",
    "TELECEL",
  ];

const USSD_LANGUAGES:
  {
    id:
      CitizenUssdDemoLanguage;
    label:
      string;
  }[] = [
    {
      id:
        "en",
      label:
        "English",
    },
    {
      id:
        "sn",
      label:
        "Shona",
    },
    {
      id:
        "nd",
      label:
        "isiNdebele",
    },
  ];

function responseBody(
  response: string,
) {
  if (
    response.startsWith(
      "CON ",
    ) ||
    response.startsWith(
      "END ",
    )
  ) {
    return response.slice(
      4,
    );
  }

  return response;
}

function responseContinues(
  response: string,
) {
  return response.startsWith(
    "CON ",
  );
}

export default function CitizenHelpScreen() {
  const insets =
    useSafeAreaInsets();

  const {
    language:
      appLanguage,
  } =
    useCitizenApp();

  const initialLanguage =
    citizenUssdLanguageFromApp(
      appLanguage,
    );

  const [
    ussdLanguage,
    setUssdLanguage,
  ] =
    useState<
      CitizenUssdDemoLanguage
    >(
      initialLanguage,
    );

  const [
    network,
    setNetwork,
  ] =
    useState<
      CitizenUssdDemoNetwork
    >(
      "ECONET",
    );

  const [
    dialCode,
    setDialCode,
  ] =
    useState<string>(
      CITIZEN_USSD_DEMO
        .serviceCode,
    );

  const [
    sessionText,
    setSessionText,
  ] =
    useState(
      "",
    );

  const [
    response,
    setResponse,
  ] =
    useState(
      "",
    );

  const [
    reply,
    setReply,
  ] =
    useState(
      "",
    );

  const [
    active,
    setActive,
  ] =
    useState(
      false,
    );

  useEffect(
    () => {
      setUssdLanguage(
        citizenUssdLanguageFromApp(
          appLanguage,
        ),
      );
    },
    [
      appLanguage,
    ],
  );

  const copy =
    useMemo(
      () =>
        appLanguage ===
        "Shona"
          ? {
              title:
                "Rubatsiro",
              subtitle:
                "Static USSD demo yekushandisa pasina internet.",
              offlineTitle:
                "USSD yekushandisa pasina internet",
              offlineBody:
                "Demo iyi inoshanda mukati meapp uye haidi internet kana Appwrite.",
              simulator:
                "MediReach USSD Demo",
              simulation:
                "DEMO CHETE",
              network:
                "Network yekuedza",
              language:
                "Mutauro",
              code:
                "USSD code",
              dial:
                "Dial",
              cancel:
                "Kanzura",
              send:
                "Tumira",
              reply:
                "Nyora mhinduro",
              ready:
                "Dial code kuti utange.",
              ended:
                "USSD session yapera. Dial zvakare kuti utange patsva.",
              access:
                "Demo codes",
              pin:
                "Demo PIN",
              note:
                "Aya macode ndeekuedza chete; haasi macode akapiwa neEconet, NetOne, Telecel kana POTRAZ.",
            }
          : appLanguage ===
            "isiNdebele"
          ? {
              title:
                "Usizo",
              subtitle:
                "I-static USSD demo yokusebenzisa ungela-inthanethi.",
              offlineTitle:
                "USSD yokusebenzisa ungela-inthanethi",
              offlineBody:
                "IDemo le isebenza ngaphakathi kwe-app njalo ayidingi i-inthanethi kumbe i-Appwrite.",
              simulator:
                "MediReach USSD Demo",
              simulation:
                "IDEMO KUPHELA",
              network:
                "Inethiwekhi yokuhlola",
              language:
                "Ulimi",
              code:
                "USSD code",
              dial:
                "Dial",
              cancel:
                "Khansela",
              send:
                "Thumela",
              reply:
                "Faka impendulo",
              ready:
                "Dial code ukuze uqale.",
              ended:
                "I-USSD session isiphelile. Dial futhi ukuze uqale kutsha.",
              access:
                "Ama-demo codes",
              pin:
                "Demo PIN",
              note:
                "Ama-code la ngawokulingisa kuphela; kawaphiwanga yiEconet, NetOne, Telecel kumbe iPOTRAZ.",
            }
          : {
              title:
                "Help",
              subtitle:
                "Static USSD access for the offline demo.",
              offlineTitle:
                "Offline USSD access",
              offlineBody:
                "This demo runs entirely inside the app and does not need internet or Appwrite.",
              simulator:
                "MediReach USSD Demo",
              simulation:
                "DEMO ONLY",
              network:
                "Simulated network",
              language:
                "Language",
              code:
                "USSD code",
              dial:
                "Dial",
              cancel:
                "Cancel",
              send:
                "Send",
              reply:
                "Enter reply",
              ready:
                "Dial a code to begin.",
              ended:
                "USSD session ended. Dial again to start a new session.",
              access:
                "Demo access codes",
              pin:
                "Demo PIN",
              note:
                "These codes are simulation-only and are not allocated by Econet, NetOne, Telecel or POTRAZ.",
            },
      [
        appLanguage,
      ],
    );

  const shownResponse =
    response
      ? responseBody(
          response,
        )
      : copy.ready;

  const dial =
    (
      nextCode?:
        string,
    ) => {
      const code =
        (
          nextCode ??
          dialCode
        ).trim();

      if (
        !code
      ) {
        return;
      }

      setDialCode(
        code,
      );

      setSessionText(
        "",
      );

      setReply(
        "",
      );

      const nextResponse =
        handleCitizenStaticUssd({
          serviceCode:
            code,

          text:
            "",

          language:
            ussdLanguage,
        });

      setResponse(
        nextResponse,
      );

      setActive(
        responseContinues(
          nextResponse,
        ),
      );
    };

  const sendReply =
    () => {
      const value =
        reply.trim();

      if (
        !active ||
        !value
      ) {
        return;
      }

      const nextText =
        sessionText
          ? `${sessionText}*${value}`
          : value;

      const nextResponse =
        handleCitizenStaticUssd({
          serviceCode:
            dialCode,

          text:
            nextText,

          language:
            ussdLanguage,
        });

      setSessionText(
        nextText,
      );

      setResponse(
        nextResponse,
      );

      setReply(
        "",
      );

      setActive(
        responseContinues(
          nextResponse,
        ),
      );
    };

  const cancel =
    () => {
      setSessionText(
        "",
      );

      setResponse(
        "",
      );

      setReply(
        "",
      );

      setActive(
        false,
      );
    };

  return (
    <KeyboardAvoidingView
      style={
        styles.root
      }
      behavior={
        Platform.OS ===
        "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop:
              Math.max(
                insets.top + 10,
                24,
              ),

            paddingBottom:
              Math.max(
                insets.bottom + 32,
                44,
              ),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        <View
          style={
            styles.header
          }
        >
          <Pressable
            onPress={() =>
              router.back()
            }
            style={
              styles.back
            }
          >
            <ArrowLeft
              size={20}
              color={
                colors.charcoal
              }
            />
          </Pressable>

          <View
            style={{
              flex: 1,
            }}
          >
            <Text
              style={
                styles.title
              }
            >
              {
                copy.title
              }
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              {
                copy.subtitle
              }
            </Text>
          </View>

          <CircleHelp
            size={23}
            color={
              colors.charcoal
            }
          />
        </View>

        <View
          style={
            styles.offlineCard
          }
        >
          <View
            style={
              styles.offlineIcon
            }
          >
            <WifiOff
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
                styles.offlineTitle
              }
            >
              {
                copy.offlineTitle
              }
            </Text>

            <Text
              style={
                styles.offlineBody
              }
            >
              {
                copy.offlineBody
              }
            </Text>
          </View>
        </View>

        <View
          style={
            styles.demoHeader
          }
        >
          <View>
            <Text
              style={
                styles.sectionTitle
              }
            >
              {
                copy.simulator
              }
            </Text>

            <Text
              style={
                styles.demoSub
              }
            >
              Static patient data
            </Text>
          </View>

          <View
            style={
              styles.demoBadge
            }
          >
            <Text
              style={
                styles.demoBadgeText
              }
            >
              {
                copy.simulation
              }
            </Text>
          </View>
        </View>

        <View
          style={
            styles.controlsCard
          }
        >
          <Text
            style={
              styles.controlLabel
            }
          >
            {
              copy.network
            }
          </Text>

          <View
            style={
              styles.segmentRow
            }
          >
            {NETWORKS.map(
              (
                item,
              ) => (
                <Pressable
                  key={
                    item
                  }
                  onPress={() =>
                    setNetwork(
                      item,
                    )
                  }
                  style={[
                    styles.segment,
                    network ===
                      item &&
                      styles.segmentActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      network ===
                        item &&
                        styles.segmentTextActive,
                    ]}
                  >
                    {
                      item ===
                      "NETONE"
                        ? "NetOne"
                        : item ===
                          "TELECEL"
                        ? "Telecel"
                        : "Econet"
                    }
                  </Text>
                </Pressable>
              ),
            )}
          </View>

          <Text
            style={[
              styles.controlLabel,
              {
                marginTop:
                  14,
              },
            ]}
          >
            {
              copy.language
            }
          </Text>

          <View
            style={
              styles.segmentRow
            }
          >
            {USSD_LANGUAGES.map(
              (
                item,
              ) => (
                <Pressable
                  key={
                    item.id
                  }
                  onPress={() =>
                    setUssdLanguage(
                      item.id,
                    )
                  }
                  style={[
                    styles.segment,
                    ussdLanguage ===
                      item.id &&
                      styles.segmentActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      ussdLanguage ===
                        item.id &&
                        styles.segmentTextActive,
                    ]}
                  >
                    {
                      item.label
                    }
                  </Text>
                </Pressable>
              ),
            )}
          </View>

          <Text
            style={[
              styles.controlLabel,
              {
                marginTop:
                  14,
              },
            ]}
          >
            {
              copy.code
            }
          </Text>

          <View
            style={
              styles.dialRow
            }
          >
            <TextInput
              value={
                dialCode
              }
              onChangeText={
                setDialCode
              }
              style={
                styles.dialInput
              }
              autoCapitalize="none"
              autoCorrect={
                false
              }
              placeholder={
                CITIZEN_USSD_DEMO
                  .serviceCode
              }
              placeholderTextColor={
                colors.softMuted
              }
            />

            <Pressable
              onPress={() =>
                dial()
              }
              style={
                styles.dialButton
              }
            >
              <PhoneCall
                size={17}
                color={
                  colors.white
                }
              />

              <Text
                style={
                  styles.dialButtonText
                }
              >
                {
                  copy.dial
                }
              </Text>
            </Pressable>
          </View>
        </View>

        <View
          style={
            styles.phone
          }
        >
          <View
            style={
              styles.speaker
            }
          />

          <View
            style={
              styles.phoneScreen
            }
          >
            <View
              style={
                styles.phoneTop
              }
            >
              <Text
                style={
                  styles.phoneTopText
                }
              >
                USSD
              </Text>

              <Text
                style={
                  styles.phoneTopText
                }
              >
                {
                  network ===
                  "NETONE"
                    ? "NetOne"
                    : network ===
                      "TELECEL"
                    ? "Telecel"
                    : "Econet"
                }
              </Text>
            </View>

            <View
              style={
                styles.messageBox
              }
            >
              <Text
                style={
                  styles.messageText
                }
              >
                {
                  shownResponse
                }
              </Text>
            </View>

            {active ? (
              <TextInput
                value={
                  reply
                }
                onChangeText={
                  setReply
                }
                onSubmitEditing={
                  sendReply
                }
                style={
                  styles.replyInput
                }
                placeholder={
                  copy.reply
                }
                placeholderTextColor="#777263"
                returnKeyType="send"
              />
            ) : null}

            <View
              style={
                styles.softKeyRow
              }
            >
              <Pressable
                onPress={
                  cancel
                }
                style={[
                  styles.softKey,
                  styles.softKeyLight,
                ]}
              >
                <X
                  size={16}
                  color={
                    colors.charcoal
                  }
                />

                <Text
                  style={
                    styles.softKeyLightText
                  }
                >
                  {
                    copy.cancel
                  }
                </Text>
              </Pressable>

              <Pressable
                onPress={
                  sendReply
                }
                disabled={
                  !active
                }
                style={[
                  styles.softKey,
                  styles.softKeyDark,
                  !active &&
                    styles.softKeyDisabled,
                ]}
              >
                <Send
                  size={15}
                  color={
                    colors.white
                  }
                />

                <Text
                  style={
                    styles.softKeyDarkText
                  }
                >
                  {
                    copy.send
                  }
                </Text>
              </Pressable>
            </View>

            {
              response &&
              !active
                ? (
                  <Text
                    style={
                      styles.sessionEnded
                    }
                  >
                    {
                      copy.ended
                    }
                  </Text>
                )
                : null
            }
          </View>
        </View>

        <Text
          style={
            styles.sectionTitle
          }
        >
          {
            copy.access
          }
        </Text>

        <View
          style={
            styles.codesCard
          }
        >
          {CITIZEN_USSD_ACCESS_CODES.map(
            (
              item,
              index,
            ) => (
              <View
                key={
                  item.code
                }
              >
                <Pressable
                  onPress={() =>
                    dial(
                      item.code,
                    )
                  }
                  style={
                    styles.codeRow
                  }
                >
                  <Text
                    style={
                      styles.codeText
                    }
                  >
                    {
                      item.code
                    }
                  </Text>

                  <Text
                    style={
                      styles.codeLabel
                    }
                  >
                    {
                      getCitizenUssdAccessLabel(
                        item,
                        ussdLanguage,
                      )
                    }
                  </Text>
                </Pressable>

                {index <
                CITIZEN_USSD_ACCESS_CODES
                  .length -
                  1 ? (
                  <View
                    style={
                      styles.divider
                    }
                  />
                ) : null}
              </View>
            ),
          )}
        </View>

        <View
          style={
            styles.pinCard
          }
        >
          <ShieldCheck
            size={20}
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
                styles.pinLabel
              }
            >
              {
                copy.pin
              }
            </Text>

            <Text
              style={
                styles.pinValue
              }
            >
              {
                CITIZEN_USSD_DEMO
                  .pin
              }
            </Text>
          </View>
        </View>

        <Text
          style={
            styles.notice
          }
        >
          {
            copy.note
          }
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
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
      paddingHorizontal: 18,
    },

    header: {
      minHeight: 60,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 12,
    },

    back: {
      width: 40,
      height: 40,
      borderRadius:
        radius.card,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.white,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    title: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 18,
    },

    subtitle: {
      marginTop: 2,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 9,
      lineHeight: 13,
    },

    offlineCard: {
      marginTop: 16,
      padding: 14,
      borderRadius:
        radius.large,
      backgroundColor:
        colors.charcoal,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 11,
    },

    offlineIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor:
        colors.charcoalSoft,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    offlineTitle: {
      fontFamily:
        fonts.bold,
      color:
        colors.white,
      fontSize: 11,
    },

    offlineBody: {
      marginTop: 3,
      fontFamily:
        fonts.regular,
      color:
        colors.border,
      fontSize: 8,
      lineHeight: 12,
    },

    demoHeader: {
      marginTop: 22,
      marginBottom: 10,
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      gap: 12,
    },

    sectionTitle: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 13,
    },

    demoSub: {
      marginTop: 2,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
    },

    demoBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius:
        radius.pill,
      backgroundColor:
        colors.surface,
      borderWidth: 1,
      borderColor:
        colors.border,
    },

    demoBadgeText: {
      fontFamily:
        fonts.bold,
      color:
        colors.muted,
      fontSize: 7,
      letterSpacing: 0.5,
    },

    controlsCard: {
      padding: 14,
      borderRadius:
        radius.large,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.white,
    },

    controlLabel: {
      marginBottom: 7,
      fontFamily:
        fonts.bold,
      color:
        colors.muted,
      fontSize: 8,
    },

    segmentRow: {
      flexDirection:
        "row",
      gap: 6,
    },

    segment: {
      flex: 1,
      minHeight: 38,
      paddingHorizontal: 6,
      borderRadius:
        radius.small,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.white,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    segmentActive: {
      backgroundColor:
        colors.charcoal,
      borderColor:
        colors.charcoal,
    },

    segmentText: {
      fontFamily:
        fonts.semiBold,
      color:
        colors.text,
      fontSize: 8,
      textAlign:
        "center",
    },

    segmentTextActive: {
      color:
        colors.white,
    },

    dialRow: {
      flexDirection:
        "row",
      gap: 8,
    },

    dialInput: {
      flex: 1,
      minHeight: 45,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.surfaceSoft,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 12,
    },

    dialButton: {
      minHeight: 45,
      paddingHorizontal: 14,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.charcoal,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 7,
    },

    dialButtonText: {
      fontFamily:
        fonts.bold,
      color:
        colors.white,
      fontSize: 9,
    },

    phone: {
      marginTop: 18,
      padding: 14,
      borderRadius: 28,
      backgroundColor:
        "#222522",
    },

    speaker: {
      width: 52,
      height: 5,
      marginBottom: 12,
      borderRadius:
        radius.pill,
      backgroundColor:
        "#4B504B",
      alignSelf:
        "center",
    },

    phoneScreen: {
      minHeight: 380,
      padding: 12,
      borderRadius: 16,
      backgroundColor:
        "#F4F0DA",
    },

    phoneTop: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      marginBottom: 8,
    },

    phoneTopText: {
      fontFamily:
        fonts.bold,
      color:
        "#39392F",
      fontSize: 8,
    },

    messageBox: {
      minHeight: 240,
      padding: 13,
      borderRadius: 10,
      borderWidth: 1,
      borderColor:
        "#CCC5A7",
      backgroundColor:
        "#FFFDF0",
    },

    messageText: {
      fontFamily:
        Platform.OS ===
        "ios"
          ? "Courier"
          : "monospace",
      color:
        "#29291F",
      fontSize: 12,
      lineHeight: 17,
    },

    replyInput: {
      minHeight: 43,
      marginTop: 9,
      paddingHorizontal: 11,
      borderRadius: 8,
      borderWidth: 1,
      borderColor:
        "#A9A58D",
      backgroundColor:
        colors.white,
      fontFamily:
        fonts.regular,
      color:
        colors.text,
      fontSize: 12,
    },

    softKeyRow: {
      marginTop: 9,
      flexDirection:
        "row",
      gap: 8,
    },

    softKey: {
      flex: 1,
      minHeight: 42,
      borderRadius: 8,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 6,
    },

    softKeyLight: {
      borderWidth: 1,
      borderColor:
        "#A8A48D",
      backgroundColor:
        "#F9F7E9",
    },

    softKeyDark: {
      backgroundColor:
        colors.charcoal,
    },

    softKeyDisabled: {
      opacity: 0.35,
    },

    softKeyLightText: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 9,
    },

    softKeyDarkText: {
      fontFamily:
        fonts.bold,
      color:
        colors.white,
      fontSize: 9,
    },

    sessionEnded: {
      marginTop: 8,
      fontFamily:
        fonts.regular,
      color:
        "#656052",
      fontSize: 8,
      lineHeight: 12,
      textAlign:
        "center",
    },

    codesCard: {
      marginTop: 10,
      paddingHorizontal: 13,
      borderRadius:
        radius.large,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.white,
    },

    codeRow: {
      minHeight: 52,
      paddingVertical: 10,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      gap: 12,
    },

    codeText: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 10,
    },

    codeLabel: {
      flex: 1,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
      lineHeight: 12,
      textAlign:
        "right",
    },

    divider: {
      height: 1,
      backgroundColor:
        colors.border,
    },

    pinCard: {
      marginTop: 14,
      padding: 14,
      borderRadius:
        radius.large,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.surface,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 11,
    },

    pinLabel: {
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
    },

    pinValue: {
      marginTop: 2,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 14,
      letterSpacing: 2,
    },

    notice: {
      marginTop: 12,
      fontFamily:
        fonts.regular,
      color:
        colors.softMuted,
      fontSize: 8,
      lineHeight: 13,
      textAlign:
        "center",
    },
  });
