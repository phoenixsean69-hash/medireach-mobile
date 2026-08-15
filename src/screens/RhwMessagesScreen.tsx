import {
  MessageCircle,
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

export default function RhwMessagesScreen() {
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
          "Professional messages",
        )}
      </Text>

      <View
        style={
          styles.card
        }
      >
        <MessageCircle
          size={25}
          color={
            colors.charcoal
          }
        />

        <Text
          style={
            styles.text
          }
        >
          {t(
            "Secure care-team messaging will be connected here.",
          )}
        </Text>
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
      gap: 12,
    },

    text: {
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 10,
      lineHeight: 16,
    },
  });
