import * as ImagePicker from "expo-image-picker";
import {
  Check,
  ImagePlus,
  Trash2,
} from "lucide-react-native";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useSignupLanguage,
} from "../../localization/signupLocalization";
import {
  colors,
  fonts,
  radius,
} from "../../theme";

type Props = {
  uri: string;
  fileName: string;
  onChange:
    (
      uri: string,
      fileName: string,
    ) => void;
};

export default function IdentityGalleryField({
  uri,
  fileName,
  onChange,
}: Props) {
  const {
    t,
  } =
    useSignupLanguage();

  const pick =
    async () => {
      const permission =
        await ImagePicker
          .requestMediaLibraryPermissionsAsync();

      if (
        !permission.granted
      ) {
        Alert.alert(
          t(
            "Gallery permission required",
          ),
          t(
            "Allow MediReach to access your photos so you can select your National ID or passport image.",
          ),
        );

        return;
      }

      const result =
        await ImagePicker
          .launchImageLibraryAsync({
            mediaTypes:
              [
                "images",
              ] as any,

            allowsEditing:
              false,

            quality: 0.9,
          });

      if (
        result.canceled
      ) {
        return;
      }

      const asset =
        result.assets[0];

      onChange(
        asset.uri,
        asset.fileName ||
          t(
            "Identity document image",
          ),
      );
    };

  return (
    <View style={styles.field}>
      <Text
        style={styles.label}
      >
        {t(
          "National ID / Passport",
        )}
      </Text>

      {!uri ? (
        <Pressable
          style={styles.pick}
          onPress={pick}
        >
          <ImagePlus
            size={20}
            color={
              colors.charcoal
            }
          />

          <View
            style={
              styles.textWrap
            }
          >
            <Text
              style={styles.title}
            >
              {t(
                "Choose from gallery",
              )}
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              {t(
                "Select a clear photo of your National ID or passport.",
              )}
            </Text>
          </View>
        </Pressable>
      ) : (
        <View
          style={
            styles.selected
          }
        >
          <Image
            source={{ uri }}
            style={
              styles.preview
            }
          />

          <View
            style={
              styles.textWrap
            }
          >
            <View
              style={
                styles.selectedTitle
              }
            >
              <Check
                size={16}
                color={
                  colors.charcoal
                }
              />

              <Text
                style={
                  styles.title
                }
              >
                {t(
                  "Document selected",
                )}
              </Text>
            </View>

            <Text
              numberOfLines={1}
              style={
                styles.fileName
              }
            >
              {fileName}
            </Text>

            <Pressable
              onPress={pick}
            >
              <Text
                style={
                  styles.change
                }
              >
                {t(
                  "Choose another",
                )}
              </Text>
            </Pressable>
          </View>

          <Pressable
            hitSlop={10}
            onPress={() =>
              onChange("", "")
            }
          >
            <Trash2
              size={18}
              color={
                colors.muted
              }
            />
          </Pressable>
        </View>
      )}

      <Text
        style={styles.note}
      >
        {t(
          "Secure server upload will be connected during the MediReach attachment-storage step.",
        )}
      </Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    field: {
      marginBottom: 15,
    },
    label: {
      marginBottom: 7,
      fontFamily: fonts.bold,
      color: colors.text,
      fontSize: 11,
    },
    pick: {
      minHeight: 76,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.surfaceSoft,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    textWrap: {
      flex: 1,
    },
    title: {
      fontFamily: fonts.bold,
      color: colors.text,
      fontSize: 11,
    },
    subtitle: {
      marginTop: 3,
      fontFamily:
        fonts.regular,
      color: colors.muted,
      fontSize: 9,
      lineHeight: 14,
    },
    selected: {
      minHeight: 86,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.surfaceSoft,
      padding: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    preview: {
      width: 64,
      height: 64,
      borderRadius: 10,
      backgroundColor:
        colors.surface,
    },
    selectedTitle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    fileName: {
      marginTop: 3,
      fontFamily:
        fonts.regular,
      color: colors.muted,
      fontSize: 9,
    },
    change: {
      marginTop: 7,
      fontFamily: fonts.bold,
      color:
        colors.charcoal,
      fontSize: 9,
      textDecorationLine:
        "underline",
    },
    note: {
      marginTop: 6,
      fontFamily:
        fonts.regular,
      color:
        colors.softMuted,
      fontSize: 8,
      lineHeight: 12,
    },
  });
