import {
  ShieldCheck,
  Siren,
} from "lucide-react-native";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useRhwApp,
} from "../context/RhwAppContext";

import {
  colors,
  fonts,
  radius,
} from "../theme";

export default function RhwSosScreen() {
  const { t } =
    useRhwApp();

  return (
    <View
      style={
        styles.root
      }
    >
      <Text
        style={
          styles.title
        }
      >
        {t(
          "Emergency response",
        )}
      </Text>

      <View
        style={
          styles.card
        }
      >
        <View
          style={
            styles.icon
          }
        >
          <Siren
            size={25}
            color={
              colors.white
            }
          />
        </View>

        <Text
          style={
            styles.cardTitle
          }
        >
          {t("SOS")}
        </Text>

        <Text
          style={
            styles.text
          }
        >
          {t(
            "The RHW SOS queue will appear here after responder permissions are connected.",
          )}
        </Text>

        <View
          style={
            styles.security
          }
        >
          <ShieldCheck
            size={17}
            color={
              colors.charcoal
            }
          />

          <Text
            style={
              styles.securityText
            }
          >
            {t(
              "Care and SOS responder access will be connected next without weakening patient privacy.",
            )}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    root: {
      flex: 1,
      padding: 18,
      paddingTop: 28,
      backgroundColor:
        colors.canvas,
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

    icon: {
      width: 49,
      height: 49,
      borderRadius: 14,
      backgroundColor:
        colors.error,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    cardTitle: {
      marginTop: 15,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 16,
    },

    text: {
      marginTop: 6,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 10,
      lineHeight: 16,
    },

    security: {
      marginTop: 15,
      padding: 12,
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

    securityText: {
      flex: 1,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
      lineHeight: 13,
    },
  });
