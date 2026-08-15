import type {
  LucideIcon,
} from "lucide-react-native";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useCitizenApp,
} from "../../context/CitizenAppContext";

import {
  colors,
  fonts,
  radius,
} from "../../theme";

export default function CitizenPlaceholderScreen({
  title,
  description,
  note,
  icon: Icon,
}: {
  title: string;
  description: string;
  note: string;
  icon: LucideIcon;
}) {
  const {
    t,
  } =
    useCitizenApp();

  return (
    <View style={styles.root}>
      <View style={styles.icon}>
        <Icon
          size={27}
          color={
            colors.charcoal
          }
        />
      </View>

      <Text style={styles.title}>
        {t(title)}
      </Text>

      <Text
        style={
          styles.description
        }
      >
        {t(description)}
      </Text>

      <View style={styles.note}>
        <Text
          style={
            styles.noteText
          }
        >
          {t(note)}
        </Text>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    root: {
      flex: 1,
      paddingHorizontal:
        22,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        colors.canvas,
    },

    icon: {
      width: 66,
      height: 66,
      borderRadius: 20,
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

    title: {
      marginTop: 18,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 25,
      textAlign:
        "center",
    },

    description: {
      maxWidth: 320,
      marginTop: 7,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 12,
      lineHeight: 18,
      textAlign:
        "center",
    },

    note: {
      width: "100%",
      maxWidth: 350,
      marginTop: 20,
      padding: 15,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.white,
    },

    noteText: {
      fontFamily:
        fonts.regular,
      color:
        colors.charcoalSoft,
      fontSize: 10,
      lineHeight: 16,
      textAlign:
        "center",
    },
  });
