import * as Location from "expo-location";

import {
  AlertTriangle,
  Baby,
  CarFront,
  CheckCircle2,
  Crosshair,
  HeartPulse,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Siren,
} from "lucide-react-native";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import VoiceDescriptionRecorder, {
  type CareVoiceNote,
} from "../components/care/VoiceDescriptionRecorder";

import {
  listMySosAlerts,
  sendSosAlert,
  type SosEmergencyType,
} from "../services/sosAlertService";

import {
  useCitizenApp,
} from "../context/CitizenAppContext";

import {
  colors,
  fonts,
  radius,
} from "../theme";

type SosLocation = {
  latitude: number;
  longitude: number;
  accuracy:
    | number
    | null;
};

const SHONA:
  Record<string, string> = {
    "SOS Emergency":
      "SOS Chimbichimbi",

    "Send your emergency location and details quickly.":
      "Tumira nzvimbo yako nemashoko echimbichimbi nekukurumidza.",

    "Current emergency":
      "Chimbichimbi chiripo",

    "No active SOS":
      "Hapana SOS iri kushanda",

    "Your latest emergency alert will appear here.":
      "SOS yako yazvino ichaonekwa pano.",

    "What is happening?":
      "Chii chiri kuitika?",

    "Accident":
      "Tsaona",

    "Severe illness":
      "Kurwara zvakanyanya",

    "Pregnancy emergency":
      "Dambudziko repamuviri",

    "Child emergency":
      "Dambudziko remwana",

    "Violence / unsafe":
      "Mhirizhonga / kusachengeteka",

    "Other":
      "Zvimwe",

    "Current GPS location":
      "Nzvimbo yeGPS yazvino",

    "Getting your location...":
      "Kutsvaga nzvimbo yako...",

    "Location ready":
      "Nzvimbo yagadzirira",

    "Location is required before SOS can be sent.":
      "Nzvimbo inodiwa SOS isati yatumirwa.",

    "Try GPS again":
      "Edza GPS zvakare",

    "Description":
      "Tsananguro",

    "Optional. Type what is happening, record a voice note, or do both.":
      "Hazvimanikidzwi. Nyora zviri kuitika, rekodha izwi, kana kuita zvose.",

    "Example: I cannot breathe well, I was in an accident...":
      "Muenzaniso: Handisi kufema zvakanaka, ndaita tsaona...",

    "Voice message":
      "Meseji yezwi",

    "Record a short emergency voice note. The original recording is sent exactly as recorded.":
      "Rekodha meseji pfupi yezwi. Rekodhi yepakutanga inotumirwa sezvayakarekodhwa.",

    "Record voice":
      "Rekodha izwi",

    "Stop":
      "Misa",

    "Play recording":
      "Ridza rekodhi",

    "Pause playback":
      "Misa kuridza",

    "Record again":
      "Rekodha zvakare",

    "Remove recording":
      "Bvisa rekodhi",

    "Microphone permission required":
      "Mvumo yemakrofoni inodiwa",

    "Allow MediReach to use your microphone for the SOS voice message.":
      "Bvumira MediReach kushandisa maikorofoni kumeseji yeSOS.",

    "Recording failed":
      "Kurekodha kwatadza",

    "MediReach could not save the voice recording.":
      "MediReach haina kukwanisa kuchengetedza rekodhi yezwi.",

    "SEND SOS NOW":
      "TUMIRA SOS IZVOZVI",

    "Sending SOS...":
      "Kutumira SOS...",

    "Choose emergency type":
      "Sarudza rudzi rwechimbichimbi",

    "Select what kind of emergency is happening.":
      "Sarudza rudzi rwechimbichimbi chiri kuitika.",

    "GPS required":
      "GPS inodiwa",

    "MediReach needs your current GPS location before sending this SOS.":
      "MediReach inoda nzvimbo yako yeGPS yazvino isati yatumira SOS.",

    "SOS sent":
      "SOS yatumirwa",

    "Your emergency alert was saved in MediReach.":
      "SOS yako yachengetedzwa muMediReach.",

    "SOS failed":
      "SOS yatadza kutumirwa",

    "MediReach could not send your emergency alert.":
      "MediReach haina kukwanisa kutumira SOS yako.",

    "Location permission required":
      "Mvumo yenzvimbo inodiwa",

    "Allow MediReach to access your location while using the app.":
      "Bvumira MediReach kuona nzvimbo yako paunenge uchishandisa app.",

    "Location unavailable":
      "Nzvimbo haisi kuwanikwa",

    "MediReach could not get your current location.":
      "MediReach haina kukwanisa kuwana nzvimbo yako yazvino.",

    "Critical":
      "Chakanyanya",

    "New":
      "Chitsva",
  };

const NDEBELE:
  Record<string, string> = {
    "SOS Emergency":
      "SOS Isimo esiphuthumayo",

    "Send your emergency location and details quickly.":
      "Thumela indawo yakho lemininingwane yesimo esiphuthumayo ngokuphangisa.",

    "Current emergency":
      "Isimo esiphuthumayo esikhona",

    "No active SOS":
      "Akula SOS esebenzayo",

    "Your latest emergency alert will appear here.":
      "I-SOS yakho yakamuva izabonakala lapha.",

    "What is happening?":
      "Kwenzakalani?",

    "Accident":
      "Ingozi",

    "Severe illness":
      "Ukugula kakhulu",

    "Pregnancy emergency":
      "Isimo esiphuthumayo sokukhulelwa",

    "Child emergency":
      "Isimo esiphuthumayo somntwana",

    "Violence / unsafe":
      "Udlame / indawo engaphephanga",

    "Other":
      "Okunye",

    "Current GPS location":
      "Indawo yeGPS yamanje",

    "Getting your location...":
      "Kuthathwa indawo yakho...",

    "Location ready":
      "Indawo isilungile",

    "Location is required before SOS can be sent.":
      "Indawo iyadingeka i-SOS ingakathunyelwa.",

    "Try GPS again":
      "Zama i-GPS futhi",

    "Description":
      "Incazelo",

    "Optional. Type what is happening, record a voice note, or do both.":
      "Akuphoqelekile. Bhala okwenzakalayo, rekhoda ilizwi, kumbe wenze kokubili.",

    "Example: I cannot breathe well, I was in an accident...":
      "Isibonelo: Angiphefumuli kuhle, ngibe sengozini...",

    "Voice message":
      "Umlayezo welizwi",

    "Record a short emergency voice note. The original recording is sent exactly as recorded.":
      "Rekhoda umlayezo welizwi omfitshane. Irekhodi yakuqala ithunyelwa injengoba iqotshiwe.",

    "Record voice":
      "Rekhoda ilizwi",

    "Stop":
      "Misa",

    "Play recording":
      "Dlala irekhodi",

    "Pause playback":
      "Misa ukudlala",

    "Record again":
      "Rekhoda futhi",

    "Remove recording":
      "Susa irekhodi",

    "Microphone permission required":
      "Imvumo yemakrofoni iyadingeka",

    "Allow MediReach to use your microphone for the SOS voice message.":
      "Vumela iMediReach isebenzise imakrofoni kumlayezo weSOS.",

    "Recording failed":
      "Ukurekhoda kwehlulekile",

    "MediReach could not save the voice recording.":
      "IMediReach yehlulekile ukugcina irekhodi yelizwi.",

    "SEND SOS NOW":
      "THUMELA I-SOS KHATHESI",

    "Sending SOS...":
      "Kuthunyelwa i-SOS...",

    "Choose emergency type":
      "Khetha uhlobo lwesimo esiphuthumayo",

    "Select what kind of emergency is happening.":
      "Khetha uhlobo lwesimo esiphuthumayo esenzakalayo.",

    "GPS required":
      "I-GPS iyadingeka",

    "MediReach needs your current GPS location before sending this SOS.":
      "IMediReach idinga indawo yakho yeGPS yamanje ingakathumeli i-SOS.",

    "SOS sent":
      "I-SOS ithunyelwe",

    "Your emergency alert was saved in MediReach.":
      "I-SOS yakho igcinwe kuMediReach.",

    "SOS failed":
      "Ukuthumela i-SOS kwehlulekile",

    "MediReach could not send your emergency alert.":
      "IMediReach yehlulekile ukuthumela i-SOS yakho.",

    "Location permission required":
      "Imvumo yendawo iyadingeka",

    "Allow MediReach to access your location while using the app.":
      "Vumela iMediReach ithole indawo yakho ngesikhathi usebenzisa i-app.",

    "Location unavailable":
      "Indawo ayitholakali",

    "MediReach could not get your current location.":
      "IMediReach yehlulekile ukuthola indawo yakho yamanje.",

    "Critical":
      "Kubi kakhulu",

    "New":
      "Kusha",
  };

function sosT(
  text: string,
  language: string,
) {
  if (language === "Shona") {
    return SHONA[text] ??
      text;
  }

  if (
    language ===
    "isiNdebele"
  ) {
    return NDEBELE[text] ??
      text;
  }

  return text;
}

const OPTIONS: Array<{
  value:
    SosEmergencyType;
  label: string;
  icon: any;
}> = [
  {
    value: "accident",
    label: "Accident",
    icon: CarFront,
  },
  {
    value:
      "severe_illness",
    label: "Severe illness",
    icon: HeartPulse,
  },
  {
    value:
      "pregnancy_emergency",
    label:
      "Pregnancy emergency",
    icon: AlertTriangle,
  },
  {
    value:
      "child_emergency",
    label: "Child emergency",
    icon: Baby,
  },
  {
    value: "violence",
    label:
      "Violence / unsafe",
    icon: ShieldAlert,
  },
  {
    value: "other",
    label: "Other",
    icon: Siren,
  },
];

function emergencyLabel(
  value: string,
) {
  return (
    OPTIONS.find(
      (item) =>
        item.value === value,
    )?.label ??
    value
  );
}

export default function CitizenSosScreen() {
  const {
    language,
  } =
    useCitizenApp();

  const tr =
    (
      text: string,
    ) =>
      sosT(
        text,
        language,
      );

  const [
    emergencyType,
    setEmergencyType,
  ] =
    useState<
      SosEmergencyType | null
    >(null);

  const [
    description,
    setDescription,
  ] =
    useState("");

  const [
    voiceNote,
    setVoiceNote,
  ] =
    useState<
      CareVoiceNote | null
    >(null);

  const [
    location,
    setLocation,
  ] =
    useState<
      SosLocation | null
    >(null);

  const [
    locating,
    setLocating,
  ] =
    useState(false);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    loadingAlerts,
    setLoadingAlerts,
  ] =
    useState(true);

  const [
    alerts,
    setAlerts,
  ] =
    useState<any[]>([]);

  const refreshAlerts =
    async () => {
      setLoadingAlerts(true);

      try {
        const rows =
          await listMySosAlerts();

        setAlerts(
          rows as any[],
        );
      }
      catch {
        // The SOS form stays
        // available even if the
        // status history cannot
        // refresh.
      }
      finally {
        setLoadingAlerts(
          false,
        );
      }
    };

  const captureLocation =
    async () => {
      setLocating(true);

      try {
        const permission =
          await Location
            .requestForegroundPermissionsAsync();

        if (
          !permission.granted
        ) {
          Alert.alert(
            tr(
              "Location permission required",
            ),
            tr(
              "Allow MediReach to access your location while using the app.",
            ),
          );

          return;
        }

        const position =
          await Location
            .getCurrentPositionAsync({
              accuracy:
                Location
                  .Accuracy
                  .High,
            });

        setLocation({
          latitude:
            position.coords
              .latitude,

          longitude:
            position.coords
              .longitude,

          accuracy:
            position.coords
              .accuracy ??
            null,
        });
      }
      catch (
        error: any
      ) {
        Alert.alert(
          tr(
            "Location unavailable",
          ),
          error?.message ??
            tr(
              "MediReach could not get your current location.",
            ),
        );
      }
      finally {
        setLocating(false);
      }
    };

  useEffect(() => {
    refreshAlerts();
    captureLocation();
  }, []);

  const activeAlert =
    useMemo(
      () =>
        alerts.find(
          (item) =>
            ![
              "closed",
              "cancelled",
            ].includes(
              String(
                item.status ??
                  "",
              ).toLowerCase(),
            ),
        ) ??
        null,
      [alerts],
    );

  const send =
    async () => {
      if (!emergencyType) {
        Alert.alert(
          tr(
            "Choose emergency type",
          ),
          tr(
            "Select what kind of emergency is happening.",
          ),
        );

        return;
      }

      if (!location) {
        Alert.alert(
          tr(
            "GPS required",
          ),
          tr(
            "MediReach needs your current GPS location before sending this SOS.",
          ),
        );

        return;
      }

      setSubmitting(true);

      try {
        await sendSosAlert({
          emergencyType,
          description,
          latitude:
            location.latitude,
          longitude:
            location.longitude,
          voiceNote,
        });

        Alert.alert(
          tr("SOS sent"),
          tr(
            "Your emergency alert was saved in MediReach.",
          ),
        );

        setEmergencyType(
          null,
        );
        setDescription("");
        setVoiceNote(null);

        await refreshAlerts();
      }
      catch (
        error: any
      ) {
        Alert.alert(
          tr("SOS failed"),
          error?.message ??
            tr(
              "MediReach could not send your emergency alert.",
            ),
        );
      }
      finally {
        setSubmitting(false);
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
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={
          styles.hero
        }
      >
        <View
          style={
            styles.heroIcon
          }
        >
          <Siren
            size={27}
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
              styles.title
            }
          >
            {tr(
              "SOS Emergency",
            )}
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            {tr(
              "Send your emergency location and details quickly.",
            )}
          </Text>
        </View>
      </View>

      <Text
        style={
          styles.sectionTitle
        }
      >
        {tr(
          "Current emergency",
        )}
      </Text>

      <View
        style={
          styles.statusCard
        }
      >
        <View
          style={
            styles.statusIcon
          }
        >
          {loadingAlerts ? (
            <ActivityIndicator
              size="small"
              color={
                colors.charcoal
              }
            />
          ) : activeAlert ? (
            <Siren
              size={20}
              color={
                colors.error
              }
            />
          ) : (
            <CheckCircle2
              size={20}
              color={
                colors.charcoal
              }
            />
          )}
        </View>

        <View
          style={{
            flex: 1,
          }}
        >
          <Text
            style={
              styles.statusTitle
            }
          >
            {activeAlert
              ? tr(
                  emergencyLabel(
                    String(
                      activeAlert
                        .emergencyType ??
                        "other",
                    ),
                  ),
                )
              : tr(
                  "No active SOS",
                )}
          </Text>

          <Text
            style={
              styles.statusSubtitle
            }
          >
            {activeAlert
              ? `${tr(
                  "Critical",
                )} · ${String(
                  activeAlert
                    .status ??
                    tr("New"),
                )}`
              : tr(
                  "Your latest emergency alert will appear here.",
                )}
          </Text>
        </View>
      </View>

      <Text
        style={
          styles.sectionTitle
        }
      >
        {tr(
          "What is happening?",
        )}
      </Text>

      <View
        style={
          styles.optionsGrid
        }
      >
        {OPTIONS.map(
          (item) => {
            const Icon =
              item.icon;

            const selected =
              emergencyType ===
              item.value;

            return (
              <Pressable
                key={
                  item.value
                }
                onPress={() =>
                  setEmergencyType(
                    item.value,
                  )
                }
                style={[
                  styles.optionCard,
                  selected &&
                    styles
                      .optionCardSelected,
                ]}
              >
                <View
                  style={[
                    styles.optionIcon,
                    selected &&
                      styles
                        .optionIconSelected,
                  ]}
                >
                  <Icon
                    size={20}
                    color={
                      selected
                        ? colors.white
                        : colors
                            .charcoal
                    }
                  />
                </View>

                <Text
                  style={[
                    styles.optionLabel,
                    selected &&
                      styles
                        .optionLabelSelected,
                  ]}
                >
                  {tr(
                    item.label,
                  )}
                </Text>
              </Pressable>
            );
          },
        )}
      </View>

      <Text
        style={
          styles.sectionTitle
        }
      >
        {tr(
          "Current GPS location",
        )}
      </Text>

      <View
        style={[
          styles.locationCard,
          location &&
            styles
              .locationCardReady,
        ]}
      >
        <View
          style={
            styles.locationIcon
          }
        >
          {locating ? (
            <ActivityIndicator
              size="small"
              color={
                colors.charcoal
              }
            />
          ) : location ? (
            <MapPin
              size={20}
              color={
                colors.charcoal
              }
            />
          ) : (
            <Crosshair
              size={20}
              color={
                colors.error
              }
            />
          )}
        </View>

        <View
          style={{
            flex: 1,
          }}
        >
          <Text
            style={
              styles.locationTitle
            }
          >
            {locating
              ? tr(
                  "Getting your location...",
                )
              : location
                ? tr(
                    "Location ready",
                  )
                : tr(
                    "Location is required before SOS can be sent.",
                  )}
          </Text>

          {location ? (
            <Text
              style={
                styles.coordinates
              }
            >
              {location.latitude.toFixed(
                6,
              )}
              {", "}
              {location.longitude.toFixed(
                6,
              )}
            </Text>
          ) : null}
        </View>

        {!locating ? (
          <Pressable
            onPress={
              captureLocation
            }
            style={
              styles.retryButton
            }
          >
            <RefreshCw
              size={15}
              color={
                colors.charcoal
              }
            />

            <Text
              style={
                styles.retryText
              }
            >
              {tr(
                "Try GPS again",
              )}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <Text
        style={
          styles.sectionTitle
        }
      >
        {tr(
          "Description",
        )}
      </Text>

      <Text
        style={
          styles.help
        }
      >
        {tr(
          "Optional. Type what is happening, record a voice note, or do both.",
        )}
      </Text>

      <TextInput
        value={
          description
        }
        onChangeText={
          setDescription
        }
        placeholder={tr(
          "Example: I cannot breathe well, I was in an accident...",
        )}
        placeholderTextColor={
          colors.softMuted
        }
        multiline
        textAlignVertical="top"
        style={
          styles.textArea
        }
      />

      <VoiceDescriptionRecorder
        value={
          voiceNote
        }
        onChange={
          setVoiceNote
        }
        labels={{
          title:
            tr(
              "Voice message",
            ),

          helper:
            tr(
              "Record a short emergency voice note. The original recording is sent exactly as recorded.",
            ),

          record:
            tr(
              "Record voice",
            ),

          stop:
            tr("Stop"),

          play:
            tr(
              "Play recording",
            ),

          pause:
            tr(
              "Pause playback",
            ),

          recordAgain:
            tr(
              "Record again",
            ),

          remove:
            tr(
              "Remove recording",
            ),

          permissionTitle:
            tr(
              "Microphone permission required",
            ),

          permissionBody:
            tr(
              "Allow MediReach to use your microphone for the SOS voice message.",
            ),

          recordingFailedTitle:
            tr(
              "Recording failed",
            ),

          recordingFailedBody:
            tr(
              "MediReach could not save the voice recording.",
            ),
        }}
      />

      <View
        style={
          styles.sendInfo
        }
      >
        <MapPin
          size={17}
          color={
            colors.charcoal
          }
        />

        <Text
          style={
            styles.sendInfoText
          }
        >
          {location
            ? tr(
                "Location ready",
              )
            : tr(
                "Location is required before SOS can be sent.",
              )}
        </Text>
      </View>

      <Pressable
        onPress={send}
        disabled={
          submitting ||
          !emergencyType ||
          !location
        }
        style={[
          styles.sendButton,
          (
            submitting ||
            !emergencyType ||
            !location
          ) &&
            styles
              .sendButtonDisabled,
        ]}
      >
        {submitting ? (
          <ActivityIndicator
            size="small"
            color={
              colors.white
            }
          />
        ) : (
          <Siren
            size={22}
            color={
              colors.white
            }
          />
        )}

        <Text
          style={
            styles.sendButtonText
          }
        >
          {tr(
            submitting
              ? "Sending SOS..."
              : "SEND SOS NOW",
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
      paddingHorizontal: 18,
      paddingTop: 20,
      paddingBottom: 42,
    },

    hero: {
      minHeight: 82,
      padding: 14,
      borderRadius:
        radius.large,
      backgroundColor:
        colors.error,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 12,
    },

    heroIcon: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor:
        "rgba(255,255,255,0.16)",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    title: {
      fontFamily:
        fonts.bold,
      color:
        colors.white,
      fontSize: 24,
    },

    subtitle: {
      marginTop: 4,
      maxWidth: 260,
      fontFamily:
        fonts.regular,
      color:
        colors.white,
      fontSize: 9,
      lineHeight: 14,
    },

    sectionTitle: {
      marginTop: 23,
      marginBottom: 9,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 13,
    },

    statusCard: {
      minHeight: 82,
      padding: 13,
      borderRadius:
        radius.large,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.white,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 11,
    },

    statusIcon: {
      width: 44,
      height: 44,
      borderRadius: 13,
      backgroundColor:
        colors.surface,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    statusTitle: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 11,
    },

    statusSubtitle: {
      marginTop: 4,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
    },

    optionsGrid: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 9,
    },

    optionCard: {
      width: "48.5%",
      minHeight: 92,
      padding: 12,
      borderRadius:
        radius.card,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.white,
    },

    optionCardSelected: {
      backgroundColor:
        colors.charcoal,
      borderColor:
        colors.charcoal,
    },

    optionIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor:
        colors.surface,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    optionIconSelected: {
      backgroundColor:
        colors.error,
    },

    optionLabel: {
      marginTop: 9,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 9,
      lineHeight: 13,
    },

    optionLabelSelected: {
      color:
        colors.white,
    },

    locationCard: {
      minHeight: 78,
      padding: 12,
      borderRadius:
        radius.large,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.surfaceSoft,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 9,
    },

    locationCardReady: {
      backgroundColor:
        colors.white,
    },

    locationIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor:
        colors.surface,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    locationTitle: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 9,
      lineHeight: 13,
    },

    coordinates: {
      marginTop: 3,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
    },

    retryButton: {
      minHeight: 35,
      paddingHorizontal: 8,
      borderRadius: 9,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.white,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 5,
    },

    retryText: {
      fontFamily:
        fonts.bold,
      color:
        colors.charcoal,
      fontSize: 7,
    },

    help: {
      marginTop: -4,
      marginBottom: 8,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
      lineHeight: 13,
    },

    textArea: {
      minHeight: 110,
      padding: 13,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.white,
      fontFamily:
        fonts.regular,
      color:
        colors.text,
      fontSize: 11,
      lineHeight: 17,
    },

    sendInfo: {
      minHeight: 46,
      marginTop: 16,
      paddingHorizontal: 12,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.surfaceSoft,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 8,
    },

    sendInfoText: {
      flex: 1,
      fontFamily:
        fonts.semiBold,
      color:
        colors.charcoal,
      fontSize: 8,
    },

    sendButton: {
      minHeight: 60,
      marginTop: 10,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.error,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 10,
    },

    sendButtonDisabled: {
      opacity: 0.45,
    },

    sendButtonText: {
      fontFamily:
        fonts.bold,
      color:
        colors.white,
      fontSize: 12,
      letterSpacing: 0.3,
    },
  });
