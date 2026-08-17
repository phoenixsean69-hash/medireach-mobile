import {
  CloudCheck,
  RefreshCw,
  WifiOff,
} from "lucide-react-native";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useCitizenApp,
} from "../../context/CitizenAppContext";

import {
  useCitizenOffline,
} from "../../context/CitizenOfflineContext";

import {
  colors,
  fonts,
  radius,
} from "../../theme";

const COPY:
  Record<
    string,
    Record<
      string,
      string
    >
  > = {
    Shona: {
      Offline:
        "Hapana internet",
      "You can keep using MediReach. Saved changes will sync when internet returns.":
        "Unogona kuramba uchishandisa MediReach. Zvawakachengeta zvichatumirwa kana internet yadzoka.",
      "Waiting to sync":
        "Zvakamirira kutumirwa",
      "Back online":
        "Internet yadzoka",
      "Saved changes are ready to sync.":
        "Zvawakachengeta zvagadzirira kutumirwa.",
      "Sync now":
        "Tumira zvino",
      "Syncing...":
        "Kuri kutumirwa...",
    },

    isiNdebele: {
      Offline:
        "Akula internet",
      "You can keep using MediReach. Saved changes will sync when internet returns.":
        "Ungaqhubeka usebenzisa iMediReach. Okugciniweyo kuzathunyelwa nxa internet isibuya.",
      "Waiting to sync":
        "Kulindele ukuthunyelwa",
      "Back online":
        "Internet isibuyile",
      "Saved changes are ready to sync.":
        "Okugciniweyo sekulungele ukuthunyelwa.",
      "Sync now":
        "Thumela khathesi",
      "Syncing...":
        "Kuyathunyelwa...",
    },
  };

function translate(
  text: string,
  language: string,
) {
  return (
    COPY[
      language
    ]?.[
      text
    ] ??
    text
  );
}

export default function CitizenOfflineBanner() {
  const {
    language,
  } =
    useCitizenApp();

  const {
    connectivity,
    pendingSyncCount,
    syncing,
    syncNow,
  } =
    useCitizenOffline();

  if (
    connectivity !==
      "offline" &&
    pendingSyncCount ===
      0
  ) {
    return null;
  }

  const offline =
    connectivity ===
    "offline";

  const title =
    offline
      ? translate(
          "Offline",
          language,
        )
      : translate(
          "Back online",
          language,
        );

  const detail =
    offline
      ? translate(
          "You can keep using MediReach. Saved changes will sync when internet returns.",
          language,
        )
      : translate(
          "Saved changes are ready to sync.",
          language,
        );

  return (
    <View
      style={[
        styles.card,
        offline &&
          styles.cardOffline,
      ]}
    >
      <View
        style={
          styles.icon
        }
      >
        {offline ? (
          <WifiOff
            size={18}
            color={
              colors.error
            }
          />
        ) : (
          <CloudCheck
            size={18}
            color={
              colors.charcoal
            }
          />
        )}
      </View>

      <View
        style={
          styles.body
        }
      >
        <Text
          style={
            styles.title
          }
        >
          {title}
        </Text>

        <Text
          style={
            styles.detail
          }
        >
          {detail}
        </Text>

        {pendingSyncCount >
        0 ? (
          <Text
            style={
              styles.pending
            }
          >
            {pendingSyncCount}{" "}
            {translate(
              "Waiting to sync",
              language,
            )}
          </Text>
        ) : null}
      </View>

      {pendingSyncCount >
      0 ? (
        <Pressable
          onPress={() => {
            syncNow(true)
              .catch(
                () => {},
              );
          }}
          disabled={
            syncing
          }
          style={[
            styles.sync,
            syncing &&
              styles.syncDisabled,
          ]}
        >
          <RefreshCw
            size={14}
            color={
              colors.white
            }
          />

          <Text
            style={
              styles.syncText
            }
          >
            {translate(
              syncing
                ? "Syncing..."
                : "Sync now",
              language,
            )}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      marginBottom: 16,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.white,
      padding: 13,
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      gap: 10,
    },

    cardOffline: {
      borderColor:
        colors.error,
    },

    icon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      borderWidth: 1,
      borderColor:
        colors.border,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        colors.white,
    },

    body: {
      flex: 1,
    },

    title: {
      fontFamily:
        fonts.bold,
      color:
        colors.charcoal,
      fontSize: 12,
    },

    detail: {
      marginTop: 3,
      fontFamily:
        fonts.regular,
      color:
        colors.charcoalSoft,
      fontSize: 10,
      lineHeight: 15,
    },

    pending: {
      marginTop: 6,
      fontFamily:
        fonts.bold,
      color:
        colors.charcoal,
      fontSize: 9,
    },

    sync: {
      minHeight: 34,
      paddingHorizontal: 10,
      borderRadius: 10,
      backgroundColor:
        colors.charcoal,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 5,
    },

    syncDisabled: {
      opacity: 0.6,
    },

    syncText: {
      fontFamily:
        fonts.bold,
      color:
        colors.white,
      fontSize: 8,
    },
  });
