import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import {
  colors,
} from "../../theme";

export default function DoctorLoading() {
  return (
    <View style={styles.root}>
      <ActivityIndicator
        size="large"
        color={colors.charcoal}
      />
    </View>
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
