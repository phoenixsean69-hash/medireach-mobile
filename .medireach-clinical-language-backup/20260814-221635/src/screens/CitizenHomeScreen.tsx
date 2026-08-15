import {
  AlertCircle,
  ArrowRight,
  HeartPulse,
  MapPin,
  MessageCircle,
  ShieldPlus,
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
  useCitizenApp,
} from "../context/CitizenAppContext";

import {
  colors,
  fonts,
  radius,
} from "../theme";

function greetingKey() {
  const hour =
    new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  const {
    t,
  } =
    useCitizenApp();

  return (
    <View
      style={
        styles.summaryItem
      }
    >
      <Text
        style={
          styles.summaryLabel
        }
      >
        {t(label)}
      </Text>

      <Text
        numberOfLines={2}
        style={
          styles.summaryValue
        }
      >
        {value?.trim()
          ? value
          : t(
              "Not added",
            )}
      </Text>
    </View>
  );
}

function QuickAction({
  icon: Icon,
  title,
  subtitle,
  onPress,
  tone,
}: {
  icon: any;
  title: string;
  subtitle: string;
  onPress: () => void;
  tone:
    | "peach"
    | "cyan"
    | "green"
    | "blush";
}) {
  const {
    t,
  } =
    useCitizenApp();

  const background =
    tone === "peach"
      ? colors.surfaceSoft
      : tone === "cyan"
        ? colors.surface
        : tone === "green"
          ? colors.surfaceSoft
          : colors.surface;

  return (
    <Pressable
      style={[
        styles.actionCard,
        {
          backgroundColor:
            background,
        },
      ]}
      onPress={onPress}
    >
      <View
        style={
          styles.actionIcon
        }
      >
        <Icon
          size={20}
          color={
            colors.charcoal
          }
        />
      </View>

      <Text
        style={
          styles.actionTitle
        }
      >
        {t(title)}
      </Text>

      <Text
        style={
          styles.actionSubtitle
        }
      >
        {t(subtitle)}
      </Text>

      <ArrowRight
        size={16}
        color={
          colors.charcoal
        }
        style={
          styles.actionArrow
        }
      />
    </Pressable>
  );
}

export default function CitizenHomeScreen() {
  const {
    profile,
    patient,
    t,
  } =
    useCitizenApp();

  const firstName =
    String(
      profile?.firstName ||
      patient?.firstName ||
      "",
    ).trim();

  const area = [
    profile?.city,
    profile?.district,
    profile?.province,
  ]
    .filter(Boolean)
    .join(", ");

  const greeting =
    t(
      greetingKey(),
    );

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
        <View>
          <Text
            style={
              styles.greeting
            }
          >
            {greeting}
            {firstName
              ? `, ${firstName}`
              : ""}
          </Text>

          <Text
            style={
              styles.tagline
            }
          >
            {t(
              "Healthcare that reaches you.",
            )}
          </Text>
        </View>

        <View
          style={
            styles.brandIcon
          }
        >
          <HeartPulse
            size={23}
            color={
              colors.white
            }
          />
        </View>
      </View>

      <View
        style={
          styles.networkCard
        }
      >
        <View
          style={
            styles.networkTop
          }
        >
          <View
            style={
              styles.networkIcon
            }
          >
            <ShieldPlus
              size={23}
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
                styles.networkTitle
              }
            >
              {t(
                "Your care network is ready",
              )}
            </Text>

            <Text
              style={
                styles.networkSubtitle
              }
            >
              {t(
                "MediReach connects you to care wherever you are.",
              )}
            </Text>
          </View>
        </View>

        {area ? (
          <View
            style={
              styles.locationRow
            }
          >
            <MapPin
              size={15}
              color={
                colors.charcoalSoft
              }
            />

            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={
                  styles.locationLabel
                }
              >
                {t(
                  "Current area",
                )}
              </Text>

              <Text
                style={
                  styles.locationValue
                }
              >
                {area}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      <Pressable
        style={
          styles.sosCard
        }
        onPress={() =>
          router.push(
            "/(citizen-tabs)/sos",
          )
        }
      >
        <View
          style={
            styles.sosIcon
          }
        >
          <AlertCircle
            size={25}
            color={
              colors.white
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
              styles.sosEyebrow
            }
          >
            {t(
              "Emergency",
            )}
          </Text>

          <Text
            style={
              styles.sosTitle
            }
          >
            {t(
              "Emergency SOS",
            )}
          </Text>

          <Text
            style={
              styles.sosSubtitle
            }
          >
            {t(
              "Get urgent help and share your location.",
            )}
          </Text>
        </View>

        <ArrowRight
          size={21}
          color={
            colors.charcoal
          }
        />
      </Pressable>

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
          styles.actionGrid
        }
      >
        <QuickAction
          icon={
            Stethoscope
          }
          title="Request care"
          subtitle="Describe symptoms and request help."
          tone="peach"
          onPress={() =>
            router.push(
              "/(citizen-tabs)/care",
            )
          }
        />

        <QuickAction
          icon={
            HeartPulse
          }
          title="My health"
          subtitle="View your saved health details."
          tone="green"
          onPress={() =>
            router.push(
              "/(citizen-tabs)/profile",
            )
          }
        />

        <QuickAction
          icon={
            MessageCircle
          }
          title="Talk to care team"
          subtitle="Open your MediReach messages."
          tone="cyan"
          onPress={() =>
            router.push(
              "/(citizen-tabs)/messages",
            )
          }
        />

        <QuickAction
          icon={
            UserRound
          }
          title="My profile"
          subtitle="Manage your details and language."
          tone="blush"
          onPress={() =>
            router.push(
              "/(citizen-tabs)/profile",
            )
          }
        />
      </View>

      <Text
        style={
          styles.sectionTitle
        }
      >
        {t(
          "Health summary",
        )}
      </Text>

      <View
        style={
          styles.summaryCard
        }
      >
        <SummaryItem
          label="Blood group"
          value={
            patient?.bloodGroup
          }
        />

        <View
          style={
            styles.summaryDivider
          }
        />

        <SummaryItem
          label="Allergies"
          value={
            patient?.allergies
          }
        />

        <View
          style={
            styles.summaryDivider
          }
        />

        <SummaryItem
          label="Conditions"
          value={
            patient?.conditions
          }
        />
      </View>

      <Text
        style={
          styles.sectionTitle
        }
      >
        {t(
          "Care status",
        )}
      </Text>

      <View
        style={
          styles.careStatus
        }
      >
        <View
          style={
            styles.careStatusIcon
          }
        >
          <Stethoscope
            size={20}
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
              styles.careStatusTitle
            }
          >
            {t(
              "No active care request",
            )}
          </Text>

          <Text
            style={
              styles.careStatusSubtitle
            }
          >
            {t(
              "When you request care, its progress will appear here.",
            )}
          </Text>
        </View>
      </View>

      <Pressable
        style={
          styles.careButton
        }
        onPress={() =>
          router.push(
            "/(citizen-tabs)/care",
          )
        }
      >
        <Text
          style={
            styles.careButtonText
          }
        >
          {t(
            "Start a care request",
          )}
        </Text>

        <ArrowRight
          size={18}
          color={
            colors.white
          }
        />
      </Pressable>
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
      paddingTop: 18,
      paddingBottom: 34,
    },

    header: {
      minHeight: 62,
      marginBottom: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: 12,
    },

    greeting: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 24,
    },

    tagline: {
      marginTop: 4,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 11,
    },

    brandIcon: {
      width: 48,
      height: 48,
      borderRadius: 15,
      backgroundColor:
        colors.charcoal,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    networkCard: {
      padding: 17,
      borderRadius:
        radius.large,
      backgroundColor:
        colors.surfaceSoft,
    },

    networkTop: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      gap: 12,
    },

    networkIcon: {
      width: 44,
      height: 44,
      borderRadius: 13,
      backgroundColor:
        "rgba(255,255,255,0.72)",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    networkTitle: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 16,
    },

    networkSubtitle: {
      marginTop: 5,
      fontFamily:
        fonts.regular,
      color:
        colors.charcoalSoft,
      fontSize: 10,
      lineHeight: 15,
    },

    locationRow: {
      marginTop: 14,
      paddingTop: 13,
      borderTopWidth: 1,
      borderTopColor:
        "rgba(48,48,48,0.12)",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 8,
    },

    locationLabel: {
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
    },

    locationValue: {
      marginTop: 1,
      fontFamily:
        fonts.semiBold,
      color:
        colors.text,
      fontSize: 10,
    },

    sosCard: {
      marginTop: 14,
      padding: 15,
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
        "center",
      gap: 12,
    },

    sosIcon: {
      width: 50,
      height: 50,
      borderRadius: 16,
      backgroundColor:
        colors.error,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    sosEyebrow: {
      fontFamily:
        fonts.bold,
      color:
        colors.error,
      fontSize: 8,
      textTransform:
        "uppercase",
    },

    sosTitle: {
      marginTop: 2,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 15,
    },

    sosSubtitle: {
      marginTop: 3,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 9,
      lineHeight: 13,
    },

    sectionTitle: {
      marginTop: 24,
      marginBottom: 10,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 14,
    },

    actionGrid: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 10,
    },

    actionCard: {
      width: "48.4%",
      minHeight: 150,
      padding: 14,
      borderRadius:
        radius.large,
      position:
        "relative",
    },

    actionIcon: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor:
        "rgba(255,255,255,0.72)",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    actionTitle: {
      marginTop: 15,
      paddingRight: 18,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 12,
    },

    actionSubtitle: {
      marginTop: 4,
      paddingRight: 8,
      fontFamily:
        fonts.regular,
      color:
        colors.charcoalSoft,
      fontSize: 8,
      lineHeight: 12,
    },

    actionArrow: {
      position:
        "absolute",
      right: 12,
      top: 15,
    },

    summaryCard: {
      paddingHorizontal: 15,
      borderRadius:
        radius.large,
      backgroundColor:
        colors.white,
      borderWidth: 1,
      borderColor:
        colors.border,
    },

    summaryItem: {
      minHeight: 66,
      justifyContent:
        "center",
    },

    summaryLabel: {
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
    },

    summaryValue: {
      marginTop: 3,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 11,
      lineHeight: 15,
    },

    summaryDivider: {
      height: 1,
      backgroundColor:
        colors.border,
    },

    careStatus: {
      padding: 15,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.large,
      backgroundColor:
        colors.white,
      flexDirection:
        "row",
      gap: 11,
      alignItems:
        "center",
    },

    careStatusIcon: {
      width: 44,
      height: 44,
      borderRadius: 13,
      backgroundColor:
        colors.surface,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    careStatusTitle: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 11,
    },

    careStatusSubtitle: {
      marginTop: 3,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
      lineHeight: 12,
    },

    careButton: {
      minHeight: 52,
      marginTop: 10,
      paddingHorizontal: 16,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.charcoal,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    careButtonText: {
      fontFamily:
        fonts.bold,
      color:
        colors.white,
      fontSize: 11,
    },
  });
