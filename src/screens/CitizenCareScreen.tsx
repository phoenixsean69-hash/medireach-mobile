import * as Location from "expo-location";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Crosshair,
  HeartPulse,
  MapPin,
  Plus,
  ShieldPlus,
  Siren,
  Stethoscope,
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
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  useCitizenApp,
} from "../context/CitizenAppContext";

import VoiceDescriptionRecorder, {
  type CareVoiceNote,
} from "../components/care/VoiceDescriptionRecorder";

import {
  createCareRequest,
  listMyCareRequests,
} from "../services/careRequestService";

import {
  colors,
  fonts,
  radius,
} from "../theme";

type CareUrgency =
  | "Routine"
  | "Moderate"
  | "Urgent"
  | "Emergency";

type CareDuration =
  | "Today"
  | "1–3 days"
  | "4–7 days"
  | "More than a week";

type DraftLocation = {
  latitude: number;
  longitude: number;
  source:
    | "saved"
    | "current";
};

const SHONA:
  Record<string, string> = {
    "Care":
      "Rubatsiro",

    "Get help without travelling first.":
      "Wana rubatsiro usati watanga kufamba.",

    "Request care":
      "Kumbira rubatsiro",

    "Tell MediReach what is happening and prepare a care request.":
      "Udza MediReach zviri kuitika kuti ugadzirire chikumbiro cherubatsiro.",

    "Start request":
      "Tanga chikumbiro",

    "Emergency":
      "Chimbichimbi",

    "Need urgent help right now?":
      "Unoda rubatsiro rwechimbichimbi izvozvi?",

    "Use SOS for severe or immediate emergencies.":
      "Shandisa SOS kana dambudziko rakanyanya kana richida rubatsiro pakarepo.",

    "Open SOS":
      "Vhura SOS",

    "Active care request":
      "Chikumbiro cherubatsiro chasendwa",

    "No active care request":
      "Hapana chikumbiro cherubatsiro chasendwa",

    "Your care request progress will appear here after it is sent.":
      "Mafambiro echikumbiro chako achaonekwa pano kana chatumirwa.",

    "Recent care":
      "Rubatsiro rwazvino",

    "No recent care activity yet.":
      "Hapana rubatsiro rwazvino rwuchiri pano.",

    "Requests, referrals and follow-up will appear here.":
      "Zvikumbiro, kutumirwa kune imwe nzvimbo uye follow-up zvichaonekwa pano.",

    "New care request":
      "Chikumbiro chitsva cherubatsiro",

    "Describe what is happening":
      "Tsanangura zviri kuitika",

    "What symptoms or health concern do you have?":
      "Ndezvipi zviratidzo kana dambudziko rehutano raunaro?",

    "Example: headache, fever, chest pain, pregnancy concern...":
      "Muenzaniso: musoro, fivha, kurwadza muchipfuva, dambudziko repamuviri...",

    "How long has this been happening?":
      "Izvi zvava nenguva yakadii?",

    "Today":
      "Nhasi",

    "1–3 days":
      "Mazuva 1–3",

    "4–7 days":
      "Mazuva 4–7",

    "More than a week":
      "Kupfuura vhiki",

    "How urgent does it feel?":
      "Unonzwa sekuti zvinoda rubatsiro nekukurumidza zvakadii?",

    "Routine":
      "Hazvina kunyanya",

    "Moderate":
      "Zviri pakati-nepakati",

    "Urgent":
      "kurumidzai",

    "Emergency symptoms should use SOS.":
      "Zviratidzo zvechimbichimbi zvinofanira kushandisa SOS.",

    "Location to share":
      "Pandiri",

    "Saved home location":
      "Nzvimbo yekumba ",

    "Use current GPS":
      "Shandisa GPS ",

    "Current GPS selected":
      "GPS yazvino yasarudzwa",

    "No location selected":
      "Hapana nzvimbo yasarudzwa",

    "Getting location...":
      "Kutsvaga nzvimbo...",

    "Additional notes":
      "Mamwe mashoko",

    "Optional details that may help the care team.":
      "Mamwe mashoko anogona kubatsira chikwata chehutano.",

    "Review request":
      "Ongorora chikumbiro",

    "Review your care request":
      "Ongorora chikumbiro chako cherubatsiro",

    "Symptoms / concern":
      "Zviratidzo / dambudziko",

    "Duration":
      "Nguva",

    "Urgency":
      "Kukurumidza",

    "Location":
      "Nzvimbo",

    "Notes":
      "Mashoko",

    "Not provided":
      "Hazvina kupihwa",

    "Edit request":
      "Gadzirisa chikumbiro",

    "Ready for database connection":
      "Chikumbiro chagadzirira kutumirwa",

    "The request has been validated. Database submission will be connected in the next step.":
      "Chikumbiro chaongororwa. Kutumira kudatabase kuchabatanidzwa padanho rinotevera.",

    "Your care request will be stored securely in MediReach when you send it.":
      "Chikumbiro chako chichachengetedzwa zvakachengeteka muMediReach paunochitumira.",

    "Close":
      "Vhara",

    "Symptoms are required":
      "Zviratidzo zvinodiwa",

    "Describe the symptoms or health concern before continuing.":
      "Tsanangura zviratidzo kana dambudziko rehutano usati waenderera.",

    "Choose duration":
      "Sarudza nguva",

    "Choose how long the problem has been happening.":
      "Sarudza kuti dambudziko rava nenguva yakadii.",

    "Choose urgency":
      "Sarudza kukurumidza",

    "Choose how urgent the problem feels.":
      "Sarudza kuti dambudziko rinonzwa richida rubatsiro nekukurumidza zvakadii.",

    "Location permission required":
      "Mvumo yenzvimbo inodiwa",

    "Allow MediReach to access your location while you use the app.":
      "Bvumira MediReach kuona nzvimbo yako paunenge uchishandisa app.",

    "Location unavailable":
      "Nzvimbo haisi kuwanikwa",

    "MediReach could not get your current location.":
      "MediReach haina kukwanisa kuwana nzvimbo yako yazvino.",

    "Voice description":
      "Tsanangura nezwi",

    "Record a voice note if speaking is easier. The original recording is sent exactly as recorded.":
      "Rekodha izwi kana kutaura kuri nyore. Rekodhi yepakutanga inotumirwa sezvayakarekodhwa.",

    "Record voice":
      "Rekodha izwi",

    "Stop":
      "Mira",

    "Play recording":
      "Ridza odhiyo",

    "Pause playback":
      "Mira kuridza",

    "Record again":
      "Rekodha zvakare",

    "Remove recording":
      "Dzima rekodhi",

    "Microphone permission required":
      "Mvumo yemakrofoni inodiwa",

    "Allow MediReach to use the microphone to record your voice note.":
      "Bvumira MediReach kushandisa maikorofoni kurekodha izwi rako.",

    "Recording failed":
      "Kurekodha kwatadza",

    "MediReach could not save the voice recording.":
      "MediReach haina kukwanisa kuchengetedza rekodhi yezwi.",

    "Voice note":
      "Rekodhi yezwi",

    "Voice recording attached":
      "Rekodhi yezwi yabatanidzwa",

    "Send care request":
      "Tumira chikumbiro cherubatsiro",

    "Sending request...":
      "Kutumira chikumbiro...",

    "Care request sent":
      "Chikumbiro chatumirwa",

    "Your care request was saved securely.":
      "Chikumbiro chako cherubatsiro chachengetedzwa zvakachengeteka.",

    "Request failed":
      "Kutumira chikumbiro kwatadza",

    "MediReach could not save your care request.":
      "MediReach haina kukwanisa kuchengetedza chikumbiro chako.",

    "Open":
      "Chichangosendwa",

    "Step 1 of 2":
      "Danho 1 pa2",

    "Step 2 of 2":
      "Danho 2 pa2",
  };

const NDEBELE:
  Record<string, string> = {
    "Care":
      "Ukunakekelwa",

    "Get help without travelling first.":
      "Thola usizo ungakaqali ukuhamba.",

    "Request care":
      "Cela ukunakekelwa",

    "Tell MediReach what is happening and prepare a care request.":
      "Tshela iMediReach okwenzakalayo ukuze ulungise isicelo sokunakekelwa.",

    "Start request":
      "Qalisa isicelo",

    "Emergency":
      "Isimo esiphuthumayo",

    "Need urgent help right now?":
      "Udinga usizo oluphuthumayo khathesi?",

    "Use SOS for severe or immediate emergencies.":
      "Sebenzisa i-SOS nxa isimo sibi kakhulu kumbe sidinga usizo masinyane.",

    "Open SOS":
      "Vula i-SOS",

    "Active care request":
      "Isicelo sokunakekelwa esisebenzayo",

    "No active care request":
      "Akulasicelo sokunakekelwa esisebenzayo",

    "Your care request progress will appear here after it is sent.":
      "Ukuqhubeka kwesicelo sakho kuzabonakala lapha ngemva kokuthunyelwa.",

    "Recent care":
      "Ukunakekelwa kwakamuva",

    "No recent care activity yet.":
      "Akulalutho lokunakekelwa kwakamuva okwamanje.",

    "Requests, referrals and follow-up will appear here.":
      "Izicelo, ukudluliselwa lokulandelelwa kuzabonakala lapha.",

    "New care request":
      "Isicelo esitsha sokunakekelwa",

    "Describe what is happening":
      "Chaza okwenzakalayo",

    "What symptoms or health concern do you have?":
      "Yiziphi izimpawu kumbe inkinga yezempilo olayo?",

    "Example: headache, fever, chest pain, pregnancy concern...":
      "Isibonelo: ikhanda, umkhuhlane, ubuhlungu besifuba, inkinga yokukhulelwa...",

    "How long has this been happening?":
      "Lokhu sekulesikhathi esingakanani kusenzeka?",

    "Today":
      "Lamuhla",

    "1–3 days":
      "Insuku 1–3",

    "4–7 days":
      "Insuku 4–7",

    "More than a week":
      "Ngaphezu kweviki",

    "How urgent does it feel?":
      "Kubonakala kudinga usizo ngokuphangisa kangakanani?",

    "Routine":
      "Akuphuthumi",

    "Moderate":
      "Kuphakathi",

    "Urgent":
      "Kuyaphuthuma",

    "Emergency symptoms should use SOS.":
      "Izimpawu zesimo esiphuthumayo kumele zisebenzise i-SOS.",

    "Location to share":
      "Indawo yokwabelana",

    "Saved home location":
      "Indawo yekhaya egciniweyo",

    "Use current GPS":
      "Sebenzisa i-GPS yamanje",

    "Current GPS selected":
      "I-GPS yamanje ikhethiwe",

    "No location selected":
      "Akulandawo ekhethiweyo",

    "Getting location...":
      "Kuthathwa indawo...",

    "Additional notes":
      "Eminye imininingwane",

    "Optional details that may help the care team.":
      "Eminye imininingwane enganceda ithimba lezempilo.",

    "Review request":
      "Hlola isicelo",

    "Review your care request":
      "Hlola isicelo sakho sokunakekelwa",

    "Symptoms / concern":
      "Izimpawu / inkinga",

    "Duration":
      "Isikhathi",

    "Urgency":
      "Ukuphuthuma",

    "Location":
      "Indawo",

    "Notes":
      "Amanothi",

    "Not provided":
      "Akufakwanga",

    "Edit request":
      "Lungisa isicelo",

    "Ready for database connection":
      "Isicelo sesilungele ukuthunyelwa",

    "The request has been validated. Database submission will be connected in the next step.":
      "Isicelo sesihloliwe. Ukusithumela kudatabase kuzaxhunywa esinyathelweni esilandelayo.",

    "Your care request will be stored securely in MediReach when you send it.":
      "Isicelo sakho sizagcinwa ngokuphepha kuMediReach nxa usithumela.",

    "Close":
      "Vala",

    "Symptoms are required":
      "Izimpawu ziyadingeka",

    "Describe the symptoms or health concern before continuing.":
      "Chaza izimpawu kumbe inkinga yezempilo ungakaqhubeki.",

    "Choose duration":
      "Khetha isikhathi",

    "Choose how long the problem has been happening.":
      "Khetha ukuthi inkinga isilesikhathi esingakanani.",

    "Choose urgency":
      "Khetha ukuphuthuma",

    "Choose how urgent the problem feels.":
      "Khetha ukuthi inkinga ibonakala iphuthuma kangakanani.",

    "Location permission required":
      "Imvumo yendawo iyadingeka",

    "Allow MediReach to access your location while you use the app.":
      "Vumela iMediReach ithole indawo yakho ngesikhathi usebenzisa i-app.",

    "Location unavailable":
      "Indawo ayitholakali",

    "MediReach could not get your current location.":
      "IMediReach yehlulekile ukuthola indawo yakho yamanje.",

    "Voice description":
      "Chaza ngelizwi",

    "Record a voice note if speaking is easier. The original recording is sent exactly as recorded.":
      "Rekhoda ilizwi nxa ukukhuluma kulula. Irekhodi yakuqala ithunyelwa injengoba iqotshiwe.",

    "Record voice":
      "Rekhoda ilizwi",

    "Stop":
      "Mira",

    "Play recording":
      "Dlala irekhodi",

    "Pause playback":
      "Mana ukudlala",

    "Record again":
      "Rekhoda futhi",

    "Remove recording":
      "Susa irekhodi",

    "Microphone permission required":
      "Imvumo yemakrofoni iyadingeka",

    "Allow MediReach to use the microphone to record your voice note.":
      "Vumela iMediReach isebenzise imakrofoni ukurekhoda ilizwi lakho.",

    "Recording failed":
      "Ukurekhoda kwehlulekile",

    "MediReach could not save the voice recording.":
      "IMediReach yehlulekile ukugcina irekhodi yelizwi.",

    "Voice note":
      "Irekhodi yelizwi",

    "Voice recording attached":
      "Irekhodi yelizwi ifakiwe",

    "Send care request":
      "Thumela isicelo sokunakekelwa",

    "Sending request...":
      "Kuthunyelwa isicelo...",

    "Care request sent":
      "Isicelo sithunyelwe",

    "Your care request was saved securely.":
      "Isicelo sakho sokunakekelwa sigcinwe ngokuphepha.",

    "Request failed":
      "Ukuthumela isicelo kwehlulekile",

    "MediReach could not save your care request.":
      "IMediReach yehlulekile ukugcina isicelo sakho.",

    "Open":
      "Sivuliwe",

    "Step 1 of 2":
      "Isinyathelo 1 kwezingu-2",

    "Step 2 of 2":
      "Isinyathelo 2 kwezingu-2",
  };

function careT(
  text: string,
  language: string,
) {
  if (
    language === "Shona"
  ) {
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

function ChoiceChip({
  label,
  active,
  onPress,
  danger = false,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.choiceChip,
        active &&
          styles.choiceChipActive,
        active &&
          danger &&
          styles.choiceChipDanger,
      ]}
    >
      {active ? (
        <Check
          size={14}
          color={
            colors.white
          }
        />
      ) : null}

      <Text
        style={[
          styles.choiceChipText,
          active &&
            styles.choiceChipTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ReviewRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View
      style={
        styles.reviewRow
      }
    >
      <View
        style={
          styles.reviewIcon
        }
      >
        <Icon
          size={17}
          color={
            colors.charcoal
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
            styles.reviewLabel
          }
        >
          {label}
        </Text>

        <Text
          style={
            styles.reviewValue
          }
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function CitizenCareScreen() {
  const {
    language,
    patient,
    profile,
  } =
    useCitizenApp();

  const tr =
    (
      text: string,
    ) =>
      careT(
        text,
        language,
      );

  const [open, setOpen] =
    useState(false);

  const [reviewing, setReviewing] =
    useState(false);

  const [symptoms, setSymptoms] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [
    duration,
    setDuration,
  ] =
    useState<
      CareDuration | null
    >(null);

  const [
    urgency,
    setUrgency,
  ] =
    useState<
      CareUrgency | null
    >(null);

  const [
    draftLocation,
    setDraftLocation,
  ] =
    useState<
      DraftLocation | null
    >(null);

  const [
    loadingLocation,
    setLoadingLocation,
  ] =
    useState(false);

  const [
    voiceNote,
    setVoiceNote,
  ] =
    useState<
      CareVoiceNote | null
    >(null);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    careRows,
    setCareRows,
  ] =
    useState<any[]>([]);

  const [
    loadingRequests,
    setLoadingRequests,
  ] =
    useState(true);

  const refreshRequests =
    async () => {
      setLoadingRequests(
        true,
      );

      try {
        const rows =
          await listMyCareRequests();

        setCareRows(
          rows as any[],
        );
      }
      catch {
        // The screen remains usable
        // even if the status list
        // cannot be refreshed.
      }
      finally {
        setLoadingRequests(
          false,
        );
      }
    };

  useEffect(() => {
    refreshRequests();
  }, []);

  const activeRequest =
    careRows.find(
      (row) =>
        ![
          "completed",
          "cancelled",
          "inactive",
        ].includes(
          String(
            row.status ??
              "",
          ).toLowerCase(),
        ),
    ) ?? null;

  const recentRequests =
    careRows.filter(
      (row) =>
        row.$id !==
        activeRequest?.$id,
    );

  const savedLatitude =
    Number(
      patient?.homeLatitude ??
      profile?.signupLatitude,
    );

  const savedLongitude =
    Number(
      patient?.homeLongitude ??
      profile?.signupLongitude,
    );

  const hasSavedLocation =
    Number.isFinite(
      savedLatitude,
    ) &&
    Number.isFinite(
      savedLongitude,
    );

  const durationOptions:
    CareDuration[] = [
      "Today",
      "1–3 days",
      "4–7 days",
      "More than a week",
    ];

  const urgencyOptions:
    CareUrgency[] = [
      "Routine",
      "Moderate",
      "Urgent",
      "Emergency",
    ];

  const resetForm = () => {
    setSymptoms("");
    setNotes("");
    setDuration(null);
    setUrgency(null);
    setDraftLocation(
      null,
    );
    setVoiceNote(null);
    setReviewing(false);
  };

  const openRequest = () => {
    resetForm();
    setOpen(true);
  };

  const closeRequest = () => {
    setOpen(false);
    resetForm();
  };

  const useSavedLocation =
    () => {
      if (
        !hasSavedLocation
      ) {
        return;
      }

      setDraftLocation({
        latitude:
          savedLatitude,

        longitude:
          savedLongitude,

        source:
          "saved",
      });
    };

  const useCurrentLocation =
    async () => {
      setLoadingLocation(true);

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
              "Allow MediReach to access your location while you use the app.",
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

        setDraftLocation({
          latitude:
            position.coords
              .latitude,

          longitude:
            position.coords
              .longitude,

          source:
            "current",
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
        setLoadingLocation(
          false,
        );
      }
    };

  const reviewRequest =
    () => {
      if (
        !symptoms.trim()
      ) {
        Alert.alert(
          tr(
            "Symptoms are required",
          ),
          tr(
            "Describe the symptoms or health concern before continuing.",
          ),
        );

        return;
      }

      if (!duration) {
        Alert.alert(
          tr(
            "Choose duration",
          ),
          tr(
            "Choose how long the problem has been happening.",
          ),
        );

        return;
      }

      if (!urgency) {
        Alert.alert(
          tr(
            "Choose urgency",
          ),
          tr(
            "Choose how urgent the problem feels.",
          ),
        );

        return;
      }

      if (
        urgency ===
        "Emergency"
      ) {
        Alert.alert(
          tr(
            "Emergency",
          ),
          tr(
            "Emergency symptoms should use SOS.",
          ),
          [
            {
              text:
                tr(
                  "Close",
                ),
              style:
                "cancel",
            },
            {
              text:
                tr(
                  "Open SOS",
                ),
              onPress: () => {
                setOpen(false);

                router.push(
                  "/(citizen-tabs)/sos" as any,
                );
              },
            },
          ],
        );

        return;
      }

      setReviewing(true);
    };

  const submitRequest =
    async () => {
      if (
        !duration ||
        !urgency ||
        !symptoms.trim()
      ) {
        setReviewing(false);
        return;
      }

      setSubmitting(true);

      try {
        await createCareRequest({
          description:
            symptoms,

          duration,

          urgency,

          latitude:
            draftLocation
              ?.latitude ??
            null,

          longitude:
            draftLocation
              ?.longitude ??
            null,

          locationSource:
            draftLocation
              ?.source ??
            null,

          notes,

          language,

          voiceNote,
        });

        await refreshRequests();

        Alert.alert(
          tr(
            "Care request sent",
          ),
          tr(
            "Your care request was saved securely.",
          ),
        );

        closeRequest();
      }
      catch (
        error: any
      ) {
        Alert.alert(
          tr(
            "Request failed",
          ),
          error?.message ??
            tr(
              "MediReach could not save your care request.",
            ),
        );
      }
      finally {
        setSubmitting(false);
      }
    };

  const locationText =
    useMemo(
      () => {
        if (
          !draftLocation
        ) {
          return tr(
            "No location selected",
          );
        }

        const source =
          draftLocation.source ===
          "saved"
            ? tr(
                "Saved home location",
              )
            : tr(
                "Current GPS selected",
              );

        return `${source}\n${draftLocation.latitude.toFixed(6)}, ${draftLocation.longitude.toFixed(6)}`;
      },
      [
        draftLocation,
        language,
      ],
    );

  return (
    <>
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
            styles.header
          }
        >
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
              {tr("Care")}
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              {tr(
                "Get help without travelling first.",
              )}
            </Text>
          </View>

          <View
            style={
              styles.headerIcon
            }
          >
            <Stethoscope
              size={24}
              color={
                colors.white
              }
            />
          </View>
        </View>

        <View
          style={
            styles.requestCard
          }
        >
          <View
            style={
              styles.requestIcon
            }
          >
            <ShieldPlus
              size={24}
              color={
                colors.charcoal
              }
            />
          </View>

          <Text
            style={
              styles.requestTitle
            }
          >
            {tr(
              "Request care",
            )}
          </Text>

          <Text
            style={
              styles.requestSubtitle
            }
          >
            {tr(
              "Tell MediReach what is happening and prepare a care request.",
            )}
          </Text>

          <Pressable
            onPress={
              openRequest
            }
            style={
              styles.primaryButton
            }
          >
            <Plus
              size={18}
              color={
                colors.white
              }
            />

            <Text
              style={
                styles.primaryButtonText
              }
            >
              {tr(
                "Start request",
              )}
            </Text>

            <ArrowRight
              size={18}
              color={
                colors.white
              }
            />
          </Pressable>
        </View>

        <Pressable
          onPress={() =>
            router.push(
              "/(citizen-tabs)/sos" as any,
            )
          }
          style={
            styles.emergencyCard
          }
        >
          <View
            style={
              styles.emergencyIcon
            }
          >
            <Siren
              size={22}
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
                styles.emergencyEyebrow
              }
            >
              {tr(
                "Emergency",
              )}
            </Text>

            <Text
              style={
                styles.emergencyTitle
              }
            >
              {tr(
                "Need urgent help right now?",
              )}
            </Text>

            <Text
              style={
                styles.emergencySubtitle
              }
            >
              {tr(
                "Use SOS for severe or immediate emergencies.",
              )}
            </Text>
          </View>

          <ArrowRight
            size={18}
            color={
              colors.charcoal
            }
          />
        </Pressable>

        <Text
          style={
            styles.sectionTitle
          }
        >
          {tr(
            "Active care request",
          )}
        </Text>

        <View
          style={
            styles.emptyCard
          }
        >
          <View
            style={
              styles.emptyIcon
            }
          >
            {loadingRequests ? (
              <ActivityIndicator
                size="small"
                color={
                  colors.charcoal
                }
              />
            ) : (
              <HeartPulse
                size={21}
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
                styles.emptyTitle
              }
            >
              {activeRequest
                ? String(
                    activeRequest
                      .description ||
                      tr(
                        "Active care request",
                      ),
                  )
                : tr(
                    "No active care request",
                  )}
            </Text>

            <Text
              style={
                styles.emptySubtitle
              }
            >
              {activeRequest
                ? `${tr(
                    "Urgency",
                  )}: ${String(
                    activeRequest
                      .urgency ||
                      "",
                  )} · ${tr(
                    "Open",
                  )}`
                : tr(
                    "Your care request progress will appear here after it is sent.",
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
            "Recent care",
          )}
        </Text>

        <View
          style={
            styles.recentCard
          }
        >
          <Clock3
            size={21}
            color={
              colors.muted
            }
          />

          <View
            style={{
              flex: 1,
            }}
          >
            <Text
              style={
                styles.recentTitle
              }
            >
              {recentRequests.length
                ? String(
                    recentRequests[0]
                      ?.description ||
                      tr(
                        "Recent care",
                      ),
                  )
                : tr(
                    "No recent care activity yet.",
                  )}
            </Text>

            <Text
              style={
                styles.recentSubtitle
              }
            >
              {tr(
                "Requests, referrals and follow-up will appear here.",
              )}
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={
          closeRequest
        }
      >
        <SafeAreaView
          style={
            styles.modalRoot
          }
        >
          <View
            style={
              styles.modalHeader
            }
          >
            <Pressable
              onPress={() => {
                if (reviewing) {
                  setReviewing(
                    false,
                  );
                }
                else {
                  closeRequest();
                }
              }}
              style={
                styles.modalIconButton
              }
            >
              {reviewing ? (
                <ArrowLeft
                  size={20}
                  color={
                    colors.charcoal
                  }
                />
              ) : (
                <X
                  size={20}
                  color={
                    colors.charcoal
                  }
                />
              )}
            </Pressable>

            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={
                  styles.modalStep
                }
              >
                {tr(
                  reviewing
                    ? "Step 2 of 2"
                    : "Step 1 of 2",
                )}
              </Text>

              <Text
                style={
                  styles.modalTitle
                }
              >
                {tr(
                  reviewing
                    ? "Review your care request"
                    : "New care request",
                )}
              </Text>
            </View>
          </View>

          {!reviewing ? (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              style={
                styles.modalScroll
              }
              contentContainerStyle={
                styles.modalContent
              }
              showsVerticalScrollIndicator={
                false
              }
            >
              <Text
                style={
                  styles.fieldLabel
                }
              >
                {tr(
                  "Describe what is happening",
                )}
                {" *"}
              </Text>

              <Text
                style={
                  styles.fieldHelp
                }
              >
                {tr(
                  "What symptoms or health concern do you have?",
                )}
              </Text>

              <TextInput
                value={symptoms}
                onChangeText={
                  setSymptoms
                }
                placeholder={tr(
                  "Example: headache, fever, chest pain, pregnancy concern...",
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
                      "Voice description",
                    ),

                  helper:
                    tr(
                      "Record a voice note if speaking is easier. The original recording is sent exactly as recorded.",
                    ),

                  record:
                    tr(
                      "Record voice",
                    ),

                  stop:
                    tr(
                      "Stop",
                    ),

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
                      "Allow MediReach to use the microphone to record your voice note.",
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

              <Text
                style={
                  styles.fieldLabel
                }
              >
                {tr(
                  "How long has this been happening?",
                )}
                {" *"}
              </Text>

              <View
                style={
                  styles.chipWrap
                }
              >
                {durationOptions.map(
                  (
                    item,
                  ) => (
                    <ChoiceChip
                      key={item}
                      label={
                        tr(item)
                      }
                      active={
                        duration ===
                        item
                      }
                      onPress={() =>
                        setDuration(
                          item,
                        )
                      }
                    />
                  ),
                )}
              </View>

              <Text
                style={
                  styles.fieldLabel
                }
              >
                {tr(
                  "How urgent does it feel?",
                )}
                {" *"}
              </Text>

              <View
                style={
                  styles.chipWrap
                }
              >
                {urgencyOptions.map(
                  (
                    item,
                  ) => (
                    <ChoiceChip
                      key={item}
                      label={
                        tr(item)
                      }
                      active={
                        urgency ===
                        item
                      }
                      danger={
                        item ===
                        "Emergency"
                      }
                      onPress={() =>
                        setUrgency(
                          item,
                        )
                      }
                    />
                  ),
                )}
              </View>

              {urgency ===
              "Emergency" ? (
                <Pressable
                  onPress={() => {
                    setOpen(false);

                    router.push(
                      "/(citizen-tabs)/sos" as any,
                    );
                  }}
                  style={
                    styles.emergencyFormNotice
                  }
                >
                  <AlertCircle
                    size={19}
                    color={
                      colors.error
                    }
                  />

                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text
                      style={
                        styles.emergencyFormTitle
                      }
                    >
                      {tr(
                        "Emergency symptoms should use SOS.",
                      )}
                    </Text>

                    <Text
                      style={
                        styles.emergencyFormLink
                      }
                    >
                      {tr(
                        "Open SOS",
                      )}
                    </Text>
                  </View>
                </Pressable>
              ) : null}

              <Text
                style={
                  styles.fieldLabel
                }
              >
                {tr(
                  "Location to share",
                )}
              </Text>

              <View
                style={
                  styles.locationOptions
                }
              >
                {hasSavedLocation ? (
                  <Pressable
                    onPress={
                      useSavedLocation
                    }
                    style={[
                      styles.locationOption,
                      draftLocation
                          ?.source ===
                        "saved" &&
                        styles.locationOptionActive,
                    ]}
                  >
                    <MapPin
                      size={18}
                      color={
                        draftLocation
                            ?.source ===
                          "saved"
                          ? colors.white
                          : colors.charcoal
                      }
                    />

                    <Text
                      style={[
                        styles.locationOptionText,
                        draftLocation
                            ?.source ===
                          "saved" &&
                          styles.locationOptionTextActive,
                      ]}
                    >
                      {tr(
                        "Saved home location",
                      )}
                    </Text>
                  </Pressable>
                ) : null}

                <Pressable
                  onPress={
                    useCurrentLocation
                  }
                  disabled={
                    loadingLocation
                  }
                  style={[
                    styles.locationOption,
                    draftLocation
                        ?.source ===
                      "current" &&
                      styles.locationOptionActive,
                  ]}
                >
                  {loadingLocation ? (
                    <ActivityIndicator
                      size="small"
                      color={
                        draftLocation
                            ?.source ===
                          "current"
                          ? colors.white
                          : colors.charcoal
                      }
                    />
                  ) : (
                    <Crosshair
                      size={18}
                      color={
                        draftLocation
                            ?.source ===
                          "current"
                          ? colors.white
                          : colors.charcoal
                      }
                    />
                  )}

                  <Text
                    style={[
                      styles.locationOptionText,
                      draftLocation
                          ?.source ===
                        "current" &&
                        styles.locationOptionTextActive,
                    ]}
                  >
                    {tr(
                      loadingLocation
                        ? "Getting location..."
                        : "Use current GPS",
                    )}
                  </Text>
                </Pressable>
              </View>

              <View
                style={
                  styles.locationStatus
                }
              >
                <MapPin
                  size={16}
                  color={
                    colors.muted
                  }
                />

                <Text
                  style={
                    styles.locationStatusText
                  }
                >
                  {locationText}
                </Text>
              </View>

              <Text
                style={
                  styles.fieldLabel
                }
              >
                {tr(
                  "Additional notes",
                )}
              </Text>

              <Text
                style={
                  styles.fieldHelp
                }
              >
                {tr(
                  "Optional details that may help the care team.",
                )}
              </Text>

              <TextInput
                value={notes}
                onChangeText={
                  setNotes
                }
                multiline
                textAlignVertical="top"
                style={
                  styles.notesArea
                }
              />

              <Pressable
                onPress={
                  reviewRequest
                }
                style={
                  styles.reviewButton
                }
              >
                <Text
                  style={
                    styles.reviewButtonText
                  }
                >
                  {tr(
                    "Review request",
                  )}
                </Text>

                <ArrowRight
                  size={18}
                  color={
                    colors.white
                  }
                />
              </Pressable>
            </ScrollView>
          ) : (
            <ScrollView
              style={
                styles.modalScroll
              }
              contentContainerStyle={
                styles.modalContent
              }
              showsVerticalScrollIndicator={
                false
              }
            >
              <View
                style={
                  styles.reviewCard
                }
              >
                <ReviewRow
                  icon={
                    Stethoscope
                  }
                  label={tr(
                    "Symptoms / concern",
                  )}
                  value={
                    symptoms.trim()
                  }
                />

                <View
                  style={
                    styles.reviewDivider
                  }
                />

                <ReviewRow
                  icon={Clock3}
                  label={tr(
                    "Duration",
                  )}
                  value={
                    duration
                      ? tr(
                          duration,
                        )
                      : tr(
                          "Not provided",
                        )
                  }
                />

                <View
                  style={
                    styles.reviewDivider
                  }
                />

                <ReviewRow
                  icon={
                    AlertCircle
                  }
                  label={tr(
                    "Urgency",
                  )}
                  value={
                    urgency
                      ? tr(
                          urgency,
                        )
                      : tr(
                          "Not provided",
                        )
                  }
                />

                <View
                  style={
                    styles.reviewDivider
                  }
                />

                <ReviewRow
                  icon={MapPin}
                  label={tr(
                    "Location",
                  )}
                  value={
                    locationText
                  }
                />

                <View
                  style={
                    styles.reviewDivider
                  }
                />

                <ReviewRow
                  icon={
                    HeartPulse
                  }
                  label={tr(
                    "Voice note",
                  )}
                  value={
                    voiceNote
                      ? `${tr(
                          "Voice recording attached",
                        )} · ${Math.max(
                          1,
                          Math.round(
                            voiceNote
                              .durationMs /
                              1000,
                          ),
                        )}s`
                      : tr(
                          "Not provided",
                        )
                  }
                />

                <View
                  style={
                    styles.reviewDivider
                  }
                />

                <ReviewRow
                  icon={
                    HeartPulse
                  }
                  label={tr(
                    "Notes",
                  )}
                  value={
                    notes.trim() ||
                    tr(
                      "Not provided",
                    )
                  }
                />
              </View>

              <View
                style={
                  styles.readyCard
                }
              >
                <View
                  style={
                    styles.readyIcon
                  }
                >
                  <Check
                    size={21}
                    color={
                      colors.charcoal
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
                      styles.readyTitle
                    }
                  >
                    {tr(
                      "Review your care request",
                    )}
                  </Text>

                  <Text
                    style={
                      styles.readySubtitle
                    }
                  >
                    {tr(
                      "Your care request will be stored securely in MediReach when you send it.",
                    )}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() =>
                  setReviewing(
                    false,
                  )
                }
                style={
                  styles.editButton
                }
              >
                <ArrowLeft
                  size={17}
                  color={
                    colors.charcoal
                  }
                />

                <Text
                  style={
                    styles.editButtonText
                  }
                >
                  {tr(
                    "Edit request",
                  )}
                </Text>
              </Pressable>

              <Pressable
                onPress={
                  submitRequest
                }
                disabled={
                  submitting
                }
                style={[
                  styles.closeButton,
                  submitting && {
                    opacity: 0.55,
                  },
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
                  <Text
                    style={
                      styles.closeButtonText
                    }
                  >
                    {tr(
                      "Send care request",
                    )}
                  </Text>
                )}
              </Pressable>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </>
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
      paddingBottom: 36,
    },

    header: {
      minHeight: 66,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 12,
    },

    title: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 28,
    },

    subtitle: {
      marginTop: 4,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 11,
    },

    headerIcon: {
      width: 48,
      height: 48,
      borderRadius: 15,
      backgroundColor:
        colors.charcoal,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    requestCard: {
      marginTop: 18,
      padding: 18,
      borderRadius:
        radius.large,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.surfaceSoft,
    },

    requestIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor:
        colors.white,
      borderWidth: 1,
      borderColor:
        colors.border,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    requestTitle: {
      marginTop: 16,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 18,
    },

    requestSubtitle: {
      marginTop: 6,
      maxWidth: 310,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 10,
      lineHeight: 16,
    },

    primaryButton: {
      minHeight: 50,
      marginTop: 17,
      paddingHorizontal: 15,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.charcoal,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    primaryButtonText: {
      flex: 1,
      marginLeft: 9,
      fontFamily:
        fonts.bold,
      color:
        colors.white,
      fontSize: 11,
    },

    emergencyCard: {
      marginTop: 12,
      minHeight: 96,
      padding: 14,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.large,
      backgroundColor:
        colors.white,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 11,
    },

    emergencyIcon: {
      width: 48,
      height: 48,
      borderRadius: 15,
      backgroundColor:
        colors.error,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    emergencyEyebrow: {
      fontFamily:
        fonts.bold,
      color:
        colors.error,
      fontSize: 8,
      textTransform:
        "uppercase",
    },

    emergencyTitle: {
      marginTop: 3,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 12,
    },

    emergencySubtitle: {
      marginTop: 3,
      maxWidth: 230,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
      lineHeight: 12,
    },

    sectionTitle: {
      marginTop: 24,
      marginBottom: 10,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 14,
    },

    emptyCard: {
      minHeight: 92,
      padding: 14,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.large,
      backgroundColor:
        colors.white,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 11,
    },

    emptyIcon: {
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

    emptyTitle: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 11,
    },

    emptySubtitle: {
      marginTop: 4,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
      lineHeight: 12,
    },

    recentCard: {
      minHeight: 80,
      padding: 14,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.large,
      backgroundColor:
        colors.surfaceSoft,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 11,
    },

    recentTitle: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 10,
    },

    recentSubtitle: {
      marginTop: 3,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
      lineHeight: 12,
    },

    modalRoot: {
      flex: 1,
      backgroundColor:
        colors.canvas,
    },

    modalHeader: {
      minHeight: 82,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor:
        colors.border,
      backgroundColor:
        colors.white,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 12,
    },

    modalIconButton: {
      width: 42,
      height: 42,
      borderRadius: 12,
      borderWidth: 1,
      borderColor:
        colors.border,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    modalStep: {
      fontFamily:
        fonts.bold,
      color:
        colors.muted,
      fontSize: 8,
      textTransform:
        "uppercase",
    },

    modalTitle: {
      marginTop: 2,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 19,
    },

    modalScroll: {
      flex: 1,
    },

    modalContent: {
      padding: 18,
      paddingBottom: 40,
    },

    fieldLabel: {
      marginTop: 18,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 11,
    },

    fieldHelp: {
      marginTop: 4,
      marginBottom: 8,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
      lineHeight: 12,
    },

    textArea: {
      minHeight: 126,
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

    notesArea: {
      minHeight: 94,
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

    chipWrap: {
      marginTop: 10,
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 8,
    },

    choiceChip: {
      minHeight: 42,
      paddingHorizontal: 13,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 12,
      backgroundColor:
        colors.white,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 6,
    },

    choiceChipActive: {
      backgroundColor:
        colors.charcoal,
      borderColor:
        colors.charcoal,
    },

    choiceChipDanger: {
      backgroundColor:
        colors.error,
      borderColor:
        colors.error,
    },

    choiceChipText: {
      fontFamily:
        fonts.semiBold,
      color:
        colors.charcoal,
      fontSize: 9,
    },

    choiceChipTextActive: {
      color:
        colors.white,
    },

    emergencyFormNotice: {
      marginTop: 10,
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
      gap: 9,
    },

    emergencyFormTitle: {
      fontFamily:
        fonts.bold,
      color:
        colors.error,
      fontSize: 9,
    },

    emergencyFormLink: {
      marginTop: 3,
      fontFamily:
        fonts.bold,
      color:
        colors.charcoal,
      fontSize: 9,
    },

    locationOptions: {
      marginTop: 10,
      gap: 8,
    },

    locationOption: {
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

    locationOptionActive: {
      backgroundColor:
        colors.charcoal,
      borderColor:
        colors.charcoal,
    },

    locationOptionText: {
      flex: 1,
      fontFamily:
        fonts.semiBold,
      color:
        colors.text,
      fontSize: 9,
    },

    locationOptionTextActive: {
      color:
        colors.white,
    },

    locationStatus: {
      marginTop: 8,
      padding: 11,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.surfaceSoft,
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      gap: 8,
    },

    locationStatusText: {
      flex: 1,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
      lineHeight: 13,
    },

    reviewButton: {
      minHeight: 52,
      marginTop: 22,
      paddingHorizontal: 16,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.charcoal,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    reviewButtonText: {
      fontFamily:
        fonts.bold,
      color:
        colors.white,
      fontSize: 11,
    },

    reviewCard: {
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.large,
      backgroundColor:
        colors.white,
    },

    reviewRow: {
      minHeight: 74,
      paddingVertical: 12,
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      gap: 11,
    },

    reviewIcon: {
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

    reviewLabel: {
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
    },

    reviewValue: {
      marginTop: 3,
      fontFamily:
        fonts.semiBold,
      color:
        colors.text,
      fontSize: 10,
      lineHeight: 15,
    },

    reviewDivider: {
      height: 1,
      backgroundColor:
        colors.border,
    },

    readyCard: {
      marginTop: 14,
      padding: 14,
      borderRadius:
        radius.large,
      backgroundColor:
        colors.surfaceSoft,
      borderWidth: 1,
      borderColor:
        colors.border,
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      gap: 10,
    },

    readyIcon: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor:
        colors.white,
      borderWidth: 1,
      borderColor:
        colors.border,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    readyTitle: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 10,
    },

    readySubtitle: {
      marginTop: 4,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
      lineHeight: 13,
    },

    editButton: {
      minHeight: 50,
      marginTop: 14,
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

    editButtonText: {
      fontFamily:
        fonts.bold,
      color:
        colors.charcoal,
      fontSize: 10,
    },

    closeButton: {
      minHeight: 50,
      marginTop: 9,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.charcoal,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    closeButtonText: {
      fontFamily:
        fonts.bold,
      color:
        colors.white,
      fontSize: 10,
    },
  });
