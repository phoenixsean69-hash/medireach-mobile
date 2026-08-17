import {
  RadioTower,
} from "lucide-react-native";

import {
  router,
} from "expo-router";

import {
  useEffect,
  useState,
} from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  loadUssdDemoFeed,
} from "../../services/ussdDemoBridge";

import {
  colors,
  fonts,
  radius,
} from "../../theme";

export default function UssdDemoLauncherCard() {
  const [
    count,
    setCount,
  ] =
    useState<
      number | null
    >(null);

  const [
    online,
    setOnline,
  ] =
    useState(false);

  useEffect(() => {
    let active = true;

    const load =
      async () => {
        try {
          const feed =
            await loadUssdDemoFeed();

          if (active) {
            setCount(
              feed.requests
                .filter(
                  (row) =>
                    ![
                      "completed",
                      "closed",
                      "resolved",
                    ].includes(
                      String(
                        row.status ||
                          "",
                      ).toLowerCase(),
                    ),
                )
                .length,
            );

            setOnline(
              true,
            );
          }
        }
        catch {
          if (active) {
            setCount(
              null,
            );

            setOnline(
              false,
            );
          }
        }
      };

    load();

    const timer =
      setInterval(
        load,
        3000,
      );

    return () => {
      active = false;

      clearInterval(
        timer,
      );
    };
  }, []);

  return (
    <Pressable
      onPress={() =>
        router.push(
          "/ussd-demo-inbox" as any,
        )
      }
      style={styles.card}
    >
      <View style={styles.icon}>
        <RadioTower
          size={20}
          color={colors.white}
        />
      </View>

      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>
            USSD Demo Inbox
          </Text>

          <View
            style={[
              styles.dot,
              online
                ? styles.dotOnline
                : styles.dotOffline,
            ]}
          />
        </View>

        <Text style={styles.subtitle}>
          Simulated basic-phone Care and SOS traffic
        </Text>
      </View>

      <View style={styles.count}>
        <Text style={styles.countText}>
          {count === null
            ? "—"
            : count}
        </Text>
      </View>
    </Pressable>
  );
}

const styles =
  StyleSheet.create({
    card: {
      marginTop: 14,
      minHeight: 72,
      padding: 12,
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

    icon: {
      width: 43,
      height: 43,
      borderRadius: 13,
      backgroundColor:
        colors.charcoal,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    copy: {
      flex: 1,
    },

    titleRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 6,
    },

    title: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 11,
    },

    subtitle: {
      marginTop: 3,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
      lineHeight: 12,
    },

    dot: {
      width: 7,
      height: 7,
      borderRadius: 999,
    },

    dotOnline: {
      backgroundColor:
        "#3F8C52",
    },

    dotOffline: {
      backgroundColor:
        colors.muted,
    },

    count: {
      minWidth: 39,
      height: 39,
      paddingHorizontal: 8,
      borderRadius: 12,
      backgroundColor:
        colors.surfaceSoft,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    countText: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 16,
    },
  });
