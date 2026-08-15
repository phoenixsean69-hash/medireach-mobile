import {
  ArrowRight,
  Building2,
  HeartPulse,
  IdCard,
  MapPinned,
  MessageCircle,
  ShieldCheck,
  Siren,
  Stethoscope,
  UserRound,
} from "lucide-react-native";

import {
  router,
} from "expo-router";

import {
  Pressable,
  ScrollView,
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

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View
      style={
        styles.infoRow
      }
    >
      <View
        style={
          styles.infoIcon
        }
      >
        <Icon
          size={17}
          color={
            colors.charcoal
          }
        />
      </View>

      <View
        style={{
          flex: 1,
        }}
      >
        <Text
          style={
            styles.infoLabel
          }
        >
          {label}
        </Text>

        <Text
          style={
            styles.infoValue
          }
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function Action({
  icon: Icon,
  title,
  onPress,
  danger = false,
}: {
  icon: any;
  title: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={
        styles.action
      }
    >
      <View
        style={[
          styles.actionIcon,
          danger &&
            styles
              .actionIconDanger,
        ]}
      >
        <Icon
          size={20}
          color={
            colors.white
          }
        />
      </View>

      <Text
        style={
          styles.actionText
        }
      >
        {title}
      </Text>

      <ArrowRight
        size={16}
        color={
          colors.muted
        }
      />
    </Pressable>
  );
}

export default function RhwHomeScreen() {
  const {
    profile,
    user,
    t,
  } =
    useRhwApp();

  const firstName =
    String(
      profile?.firstName ??
      user?.name
        ?.split(" ")
        ?.[0] ??
      "",
    ).trim();

  const value =
    (
      input: unknown,
    ) =>
      String(
        input ?? "",
      ).trim() ||
      t("Not set");

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={
        false
      }
    >
      <View
        style={
          styles.header
        }
      >
        <View
          style={{
            flex: 1,
          }}
        >
          <Text
            style={
              styles.eyebrow
            }
          >
            {t(
              "Rural Health Worker",
            )}
          </Text>

          <Text
            style={
              styles.title
            }
          >
            {firstName
              ? `Hello, ${firstName}`
              : "MediReach"}
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            {t(
              "Frontline care, closer to the community.",
            )}
          </Text>
        </View>

        <View
          style={
            styles.headerIcon
          }
        >
          <Stethoscope
            size={25}
            color={
              colors.white
            }
          />
        </View>
      </View>

      <View
        style={
          styles.accountCard
        }
      >
        <View
          style={
            styles.accountIcon
          }
        >
          <ShieldCheck
            size={22}
            color={
              colors.charcoal
            }
          />
        </View>

        <View
          style={{
            flex: 1,
          }}
        >
          <Text
            style={
              styles.accountLabel
            }
          >
            {t(
              "Professional account",
            )}
          </Text>

          <Text
            style={
              styles.accountValue
            }
          >
            {t("Active")}
          </Text>
        </View>
      </View>

      <Text
        style={
          styles.sectionTitle
        }
      >
        {t(
          "Your work area",
        )}
      </Text>

      <View
        style={
          styles.infoCard
        }
      >
        <InfoRow
          icon={Building2}
          label={t(
            "Facility",
          )}
          value={value(
            profile
              ?.facilityName ??
              profile
                ?.facilityId,
          )}
        />

        <View
          style={
            styles.divider
          }
        />

        <InfoRow
          icon={MapPinned}
          label={t(
            "Catchment area",
          )}
          value={value(
            profile
              ?.catchmentArea,
          )}
        />

        <View
          style={
            styles.divider
          }
        />

        <InfoRow
          icon={IdCard}
          label={t(
            "Worker number",
          )}
          value={value(
            profile
              ?.workerNumber,
          )}
        />

        <View
          style={
            styles.divider
          }
        />

        <InfoRow
          icon={HeartPulse}
          label={t(
            "Training level",
          )}
          value={value(
            profile
              ?.trainingLevel,
          )}
        />
      </View>

      <Text
        style={
          styles.sectionTitle
        }
      >
        {t(
          "Quick actions",
        )}
      </Text>

      <View
        style={
          styles.actionCard
        }
      >
        <Action
          icon={
            Stethoscope
          }
          title={t(
            "Open care queue",
          )}
          onPress={() =>
            router.push(
              "/(rhw-tabs)/requests" as any,
            )
          }
        />

        <View
          style={
            styles.divider
          }
        />

        <Action
          icon={Siren}
          title={t(
            "Emergency alerts",
          )}
          danger
          onPress={() =>
            router.push(
              "/(rhw-tabs)/sos" as any,
            )
          }
        />

        <View
          style={
            styles.divider
          }
        />

        <Action
          icon={
            MessageCircle
          }
          title={t(
            "Talk to care team",
          )}
          onPress={() =>
            router.push(
              "/(rhw-tabs)/messages" as any,
            )
          }
        />

        <View
          style={
            styles.divider
          }
        />

        <Action
          icon={UserRound}
          title={t(
            "My profile",
          )}
          onPress={() =>
            router.push(
              "/(rhw-tabs)/profile" as any,
            )
          }
        />
      </View>

      <View
        style={
          styles.notice
        }
      >
        <ShieldCheck
          size={20}
          color={
            colors.charcoal
          }
        />

        <View
          style={{
            flex: 1,
          }}
        >
          <Text
            style={
              styles.noticeTitle
            }
          >
            {t(
              "Responder access",
            )}
          </Text>

          <Text
            style={
              styles.noticeText
            }
          >
            {t(
              "Care and SOS responder access will be connected next without weakening patient privacy.",
            )}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles =
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor:
        colors.canvas,
    },

    content: {
      paddingHorizontal: 18,
      paddingTop: 20,
      paddingBottom: 36,
    },

    header: {
      minHeight: 82,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 12,
    },

    eyebrow: {
      fontFamily:
        fonts.bold,
      color:
        colors.muted,
      fontSize: 9,
      textTransform:
        "uppercase",
    },

    title: {
      marginTop: 4,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 26,
    },

    subtitle: {
      marginTop: 4,
      maxWidth: 280,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 9,
      lineHeight: 14,
    },

    headerIcon: {
      width: 50,
      height: 50,
      borderRadius: 15,
      backgroundColor:
        colors.charcoal,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    accountCard: {
      marginTop: 15,
      minHeight: 75,
      padding: 13,
      borderRadius:
        radius.large,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.surfaceSoft,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 11,
    },

    accountIcon: {
      width: 43,
      height: 43,
      borderRadius: 13,
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

    accountLabel: {
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
    },

    accountValue: {
      marginTop: 3,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 11,
    },

    sectionTitle: {
      marginTop: 23,
      marginBottom: 9,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 13,
    },

    infoCard: {
      paddingHorizontal: 13,
      borderRadius:
        radius.large,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.white,
    },

    infoRow: {
      minHeight: 70,
      paddingVertical: 11,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 10,
    },

    infoIcon: {
      width: 37,
      height: 37,
      borderRadius: 11,
      backgroundColor:
        colors.surface,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    infoLabel: {
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
    },

    infoValue: {
      marginTop: 3,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 10,
    },

    divider: {
      height: 1,
      backgroundColor:
        colors.border,
    },

    actionCard: {
      paddingHorizontal: 13,
      borderRadius:
        radius.large,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.white,
    },

    action: {
      minHeight: 67,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 10,
    },

    actionIcon: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor:
        colors.charcoal,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    actionIconDanger: {
      backgroundColor:
        colors.error,
    },

    actionText: {
      flex: 1,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 10,
    },

    notice: {
      marginTop: 18,
      padding: 14,
      borderRadius:
        radius.large,
      backgroundColor:
        colors.surfaceSoft,
      borderWidth: 1,
      borderColor:
        colors.border,
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      gap: 10,
    },

    noticeTitle: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 10,
    },

    noticeText: {
      marginTop: 4,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
      lineHeight: 13,
    },
  });
