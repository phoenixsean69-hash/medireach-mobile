import {
  Languages,
} from "lucide-react-native";

import {
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  ZIMBABWE_TEXT_LANGUAGE_OPTIONS,
  translateZimbabweText,
  type ZimbabweTextLanguage,
} from "../i18n/zimbabweLanguages";

import {
  updateProfessionalPreferredLanguage,
} from "../services/preferredLanguageService";

import {
  colors,
  fonts,
  radius,
} from "../theme";

export default function PreferredLanguageSection({
  language,
  onSaved,
  title,
}: {
  language:
    ZimbabweTextLanguage;
  onSaved:
    () => Promise<void>;
  title:
    string;
}) {
  const [
    saving,
    setSaving,
  ] =
    useState<
      ZimbabweTextLanguage |
      null
    >(null);

  const choose =
    async (
      next:
        ZimbabweTextLanguage,
    ) => {
      if (
        next ===
          language ||
        saving
      ) {
        return;
      }

      setSaving(
        next,
      );

      try {
        await updateProfessionalPreferredLanguage(
          next,
        );

        await onSaved();

        Alert.alert(
          translateZimbabweText(
            "Preferred language",
            next,
          ),
          translateZimbabweText(
            "Language updated.",
            next,
          ),
        );
      }
      catch (
        error: any
      ) {
        Alert.alert(
          translateZimbabweText(
            "Could not update profile.",
            language,
          ),
          error?.message ??
            translateZimbabweText(
              "Could not update profile.",
              language,
            ),
        );
      }
      finally {
        setSaving(
          null,
        );
      }
    };

  return (
    <View
      style={
        styles.wrap
      }
    >
      <View
        style={
          styles.heading
        }
      >
        <Languages
          size={18}
          color={
            colors.charcoal
          }
        />

        <Text
          style={
            styles.title
          }
        >
          {title}
        </Text>
      </View>

      <View
        style={
          styles.options
        }
      >
        {ZIMBABWE_TEXT_LANGUAGE_OPTIONS.map(
          option => {
            const active =
              language ===
              option.value;

            const pending =
              saving ===
              option.value;

            return (
              <Pressable
                key={
                  option.value
                }
                disabled={
                  Boolean(
                    saving,
                  )
                }
                onPress={() =>
                  choose(
                    option.value,
                  )
                }
                style={[
                  styles.option,
                  active &&
                    styles.active,
                ]}
              >
                {pending ? (
                  <ActivityIndicator
                    size="small"
                    color={
                      active
                        ? colors.white
                        : colors.charcoal
                    }
                  />
                ) : (
                  <Text
                    style={[
                      styles.optionText,
                      active &&
                        styles.activeText,
                    ]}
                  >
                    {
                      option.label
                    }
                  </Text>
                )}
              </Pressable>
            );
          },
        )}
      </View>

      <Text
        style={
          styles.note
        }
      >
        UI labels change with your preferred language. Patient names,
        clinician names and clinical messages remain exactly as written.
      </Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    wrap: {
      marginTop: 22,
    },
    heading: {
      marginBottom: 10,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 7,
    },
    title: {
      fontFamily:
        fonts.bold,
      fontSize: 14,
      color:
        colors.text,
    },
    options: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 7,
    },
    option: {
      minHeight: 40,
      paddingHorizontal: 11,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.white,
      alignItems:
        "center",
      justifyContent:
        "center",
    },
    active: {
      backgroundColor:
        colors.charcoal,
      borderColor:
        colors.charcoal,
    },
    optionText: {
      fontFamily:
        fonts.bold,
      fontSize: 8,
      color:
        colors.charcoal,
    },
    activeText: {
      color:
        colors.white,
    },
    note: {
      marginTop: 8,
      fontFamily:
        fonts.regular,
      fontSize: 8,
      lineHeight: 13,
      color:
        colors.muted,
    },
  });
