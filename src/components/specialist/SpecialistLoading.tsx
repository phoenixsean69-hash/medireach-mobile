import {
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  colors,
} from "../../theme";

export default function SpecialistLoading() {
  return (
    <SafeAreaView
      style={
        styles.root
      }
    >
      <ActivityIndicator
        size="large"
        color={
          colors.charcoal
        }
      />
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor:
        colors.canvas,
      alignItems:
        "center",
      justifyContent:
        "center",
    },
  });
