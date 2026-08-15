import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  HeartPulse,
} from "lucide-react-native";

import {
  colors,
  fonts,
} from "../../theme";

export default function RhwLoading() {
  return (
    <View
      style={
        styles.root
      }
    >
      <View
        style={
          styles.icon
        }
      >
        <HeartPulse
          size={25}
          color={
            colors.white
          }
        />
      </View>

      <ActivityIndicator
        size="small"
        color={
          colors.charcoal
        }
      />

      <Text
        style={
          styles.text
        }
      >
        MediReach
      </Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    root: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 12,
      backgroundColor:
        colors.canvas,
    },

    icon: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor:
        colors.charcoal,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    text: {
      fontFamily:
        fonts.bold,
      color:
        colors.charcoal,
      fontSize: 12,
    },
  });
