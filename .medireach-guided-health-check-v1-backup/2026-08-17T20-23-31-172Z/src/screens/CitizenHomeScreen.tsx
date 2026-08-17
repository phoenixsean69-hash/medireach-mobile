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
  useFocusEffect,
} from "expo-router";

import {
  useCallback,
  useState,
} from "react";

import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  useCitizenApp,
} from "../context/CitizenAppContext";

import {
  useCitizenOffline,
} from "../context/CitizenOfflineContext";

import CitizenOfflineBanner from "../components/citizen/CitizenOfflineBanner";

import {
  signupOptionLabel,
} from "../localization/signupLocalization";

import {
  loadCitizenHomeSnapshot,
  type CitizenHomeSnapshot,
} from "../services/citizenDataService";

import {
  colors,
  fonts,
  radius,
} from "../theme";

function localizeClinicalValue(
  value: unknown,
  language: string,
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  const values =
    Array.isArray(value)
      ? value.map(String)
      : String(value)
          .split(";")
          .map(
            (item) =>
              item.trim(),
          )
          .filter(Boolean);

  return values
    .map((item) =>
      signupOptionLabel(
        item,
        language,
      ),
    )
    .join("; ");
}

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

function Metric({
  icon: Icon,
  label,
  value,
  onPress,
  danger = false,
}: {
  icon: any;
  label: string;
  value: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={
        styles.metric
      }
    >
      <View
        style={[
          styles.metricIcon,
          danger &&
            styles
              .metricIconDanger,
        ]}
      >
        <Icon
          size={19}
          color={
            colors.white
          }
        />
      </View>

      <Text
        style={
          styles.metricValue
        }
      >
        {value}
      </Text>

      <Text
        style={
          styles.metricLabel
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}

function HealthItem({
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
        styles.healthItem
      }
    >
      <Text
        style={
          styles.healthLabel
        }
      >
        {t(label)}
      </Text>

      <Text
        style={
          styles.healthValue
        }
        numberOfLines={2}
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

export default function CitizenHomeScreen() {
  const insets =
    useSafeAreaInsets();

  const {
    profile,
    patient,
    language,
    t,
  } =
    useCitizenApp();

  const {
    syncRevision,
  } =
    useCitizenOffline();

  const [
    snapshot,
    setSnapshot,
  ] =
    useState<
      CitizenHomeSnapshot | null
    >(null);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const load =
    useCallback(
      async () => {
        try {
          setSnapshot(
            await loadCitizenHomeSnapshot(),
          );
        }
        finally {
          setRefreshing(false);
        }
      },
      [],
    );

  useFocusEffect(
    useCallback(() => {
      setRefreshing(true);
      load();
    }, [
      load,
      syncRevision,
    ]),
  );

  const firstName =
    String(
      profile?.firstName ||
      patient?.firstName ||
      "",
    ).trim();

  const area = [
    profile?.city ??
      patient?.city,
    profile?.district ??
      patient?.district,
    profile?.province ??
      patient?.province,
  ]
    .filter(Boolean)
    .join(", ");

  const metricValue =
    (
      value: number,
      readable: boolean,
    ) =>
      readable
        ? String(value)
        : "—";

  const latestCare =
    snapshot
      ?.latestCareStatus
      ?.replace(
        /_/g,
        " ",
      );

  return (
    <ScrollView
      style={
        styles.root
      }
      contentContainerStyle={[
        styles.content,
        {
          paddingTop:
            Math.max(
              insets.top + 10,
              20,
            ),
        },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={
            refreshing
          }
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
        />
      }
      showsVerticalScrollIndicator={
        false
      }
    >
      <CitizenOfflineBanner />

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
              styles.greeting
            }
          >
            {t(
              greetingKey(),
            )}
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

            <Text
              style={
                styles.locationValue
              }
            >
              {area}
            </Text>
          </View>
        ) : null}
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
          styles.metrics
        }
      >
        <Metric
          icon={
            Stethoscope
          }
          label={t(
            "Care",
          )}
          value={
            snapshot
              ? metricValue(
                  snapshot
                    .activeCareCount,
                  snapshot
                    .readableCare,
                )
              : "…"
          }
          onPress={() =>
            router.push(
              "/(citizen-tabs)/care",
            )
          }
        />

        <Metric
          icon={
            AlertCircle
          }
          label="SOS"
          danger
          value={
            snapshot
              ? metricValue(
                  snapshot
                    .activeSosCount,
                  snapshot
                    .readableSos,
                )
              : "…"
          }
          onPress={() =>
            router.push(
              "/(citizen-tabs)/sos",
            )
          }
        />

        <Metric
          icon={
            MessageCircle
          }
          label={t(
            "Messages",
          )}
          value={
            snapshot
              ? metricValue(
                  snapshot
                    .conversationCount,
                  snapshot
                    .readableMessages,
                )
              : "…"
          }
          onPress={() =>
            router.push(
              "/(citizen-tabs)/messages",
            )
          }
        />
      </View>

      <View
        style={
          styles.latestCare
        }
      >
        <View
          style={
            styles.latestCareIcon
          }
        >
          <Stethoscope
            size={18}
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
              styles.latestCareLabel
            }
          >
            Latest care request
          </Text>

          <Text
            style={
              styles.latestCareValue
            }
          >
            {latestCare
              ? latestCare
              : t(
                  "No active care request",
                )}
          </Text>
        </View>
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
            size={24}
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
          size={19}
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
          "Health summary",
        )}
      </Text>

      <View
        style={
          styles.healthCard
        }
      >
        <HealthItem
          label="Blood group"
          value={
            patient?.bloodGroup
          }
        />

        <View
          style={
            styles.divider
          }
        />

        <HealthItem
          label="Allergies"
          value={
            localizeClinicalValue(
              patient?.allergies,
              language,
            )
          }
        />

        <View
          style={
            styles.divider
          }
        />

        <HealthItem
          label="Conditions"
          value={
            localizeClinicalValue(
              patient?.conditions,
              language,
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
          "Quick actions",
        )}
      </Text>

      <View
        style={
          styles.actions
        }
      >
        <Pressable
          style={
            styles.action
          }
          onPress={() =>
            router.push(
              "/(citizen-tabs)/care",
            )
          }
        >
          <Stethoscope
            size={19}
            color={
              colors.charcoal
            }
          />
          <Text
            style={
              styles.actionText
            }
          >
            {t(
              "Request care",
            )}
          </Text>
        </Pressable>

        <Pressable
          style={
            styles.action
          }
          onPress={() =>
            router.push(
              "/(citizen-tabs)/messages",
            )
          }
        >
          <MessageCircle
            size={19}
            color={
              colors.charcoal
            }
          />
          <Text
            style={
              styles.actionText
            }
          >
            {t(
              "Messages",
            )}
          </Text>
        </Pressable>

        <Pressable
          style={
            styles.action
          }
          onPress={() =>
            router.push(
              "/(citizen-tabs)/profile",
            )
          }
        >
          <UserRound
            size={19}
            color={
              colors.charcoal
            }
          />
          <Text
            style={
              styles.actionText
            }
          >
            {t(
              "Profile",
            )}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles =
  StyleSheet.create({
    root:{
      flex:1,
      backgroundColor:
        colors.canvas,
    },
    content:{
      paddingHorizontal:18,
      paddingBottom:34,
    },
    header:{
      minHeight:70,
      marginBottom:14,
      flexDirection:"row",
      alignItems:"center",
      gap:12,
    },
    greeting:{
      fontFamily:fonts.bold,
      color:colors.text,
      fontSize:24,
    },
    tagline:{
      marginTop:4,
      fontFamily:fonts.regular,
      color:colors.muted,
      fontSize:11,
    },
    brandIcon:{
      width:48,
      height:48,
      borderRadius:15,
      backgroundColor:
        colors.charcoal,
      alignItems:"center",
      justifyContent:"center",
    },
    networkCard:{
      padding:16,
      borderRadius:radius.large,
      backgroundColor:
        colors.surfaceSoft,
      borderWidth:1,
      borderColor:
        colors.border,
    },
    networkTop:{
      flexDirection:"row",
      alignItems:"flex-start",
      gap:11,
    },
    networkIcon:{
      width:42,
      height:42,
      borderRadius:13,
      backgroundColor:
        colors.white,
      alignItems:"center",
      justifyContent:"center",
    },
    networkTitle:{
      fontFamily:fonts.bold,
      color:colors.text,
      fontSize:14,
    },
    networkSubtitle:{
      marginTop:4,
      fontFamily:fonts.regular,
      color:colors.muted,
      fontSize:9,
      lineHeight:14,
    },
    locationRow:{
      marginTop:12,
      paddingTop:11,
      borderTopWidth:1,
      borderTopColor:
        colors.border,
      flexDirection:"row",
      alignItems:"center",
      gap:7,
    },
    locationValue:{
      flex:1,
      fontFamily:fonts.semiBold,
      color:colors.text,
      fontSize:9,
    },
    sectionTitle:{
      marginTop:22,
      marginBottom:9,
      fontFamily:fonts.bold,
      color:colors.text,
      fontSize:14,
    },
    metrics:{
      flexDirection:"row",
      gap:8,
    },
    metric:{
      flex:1,
      minHeight:112,
      padding:11,
      borderRadius:radius.large,
      borderWidth:1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.white,
    },
    metricIcon:{
      width:36,
      height:36,
      borderRadius:11,
      backgroundColor:
        colors.charcoal,
      alignItems:"center",
      justifyContent:"center",
    },
    metricIconDanger:{
      backgroundColor:
        colors.error,
    },
    metricValue:{
      marginTop:10,
      fontFamily:fonts.bold,
      color:colors.text,
      fontSize:21,
    },
    metricLabel:{
      marginTop:2,
      fontFamily:fonts.regular,
      color:colors.muted,
      fontSize:8,
    },
    latestCare:{
      marginTop:9,
      minHeight:60,
      padding:12,
      borderRadius:radius.card,
      backgroundColor:
        colors.surfaceSoft,
      flexDirection:"row",
      alignItems:"center",
      gap:9,
    },
    latestCareIcon:{
      width:37,
      height:37,
      borderRadius:11,
      backgroundColor:
        colors.white,
      alignItems:"center",
      justifyContent:"center",
    },
    latestCareLabel:{
      fontFamily:fonts.regular,
      color:colors.muted,
      fontSize:8,
    },
    latestCareValue:{
      marginTop:2,
      fontFamily:fonts.bold,
      color:colors.text,
      fontSize:10,
      textTransform:"capitalize",
    },
    sosCard:{
      marginTop:14,
      padding:14,
      borderRadius:radius.large,
      borderWidth:1,
      borderColor:colors.border,
      backgroundColor:
        colors.white,
      flexDirection:"row",
      alignItems:"center",
      gap:11,
    },
    sosIcon:{
      width:47,
      height:47,
      borderRadius:15,
      backgroundColor:
        colors.error,
      alignItems:"center",
      justifyContent:"center",
    },
    sosTitle:{
      fontFamily:fonts.bold,
      color:colors.text,
      fontSize:13,
    },
    sosSubtitle:{
      marginTop:3,
      fontFamily:fonts.regular,
      color:colors.muted,
      fontSize:8,
      lineHeight:13,
    },
    healthCard:{
      paddingHorizontal:13,
      borderRadius:radius.large,
      borderWidth:1,
      borderColor:colors.border,
      backgroundColor:
        colors.white,
    },
    healthItem:{
      minHeight:62,
      paddingVertical:11,
    },
    healthLabel:{
      fontFamily:fonts.regular,
      color:colors.muted,
      fontSize:8,
    },
    healthValue:{
      marginTop:3,
      fontFamily:fonts.bold,
      color:colors.text,
      fontSize:10,
      lineHeight:14,
    },
    divider:{
      height:1,
      backgroundColor:
        colors.border,
    },
    actions:{
      gap:8,
    },
    action:{
      minHeight:52,
      paddingHorizontal:13,
      borderRadius:radius.card,
      borderWidth:1,
      borderColor:colors.border,
      backgroundColor:
        colors.white,
      flexDirection:"row",
      alignItems:"center",
      gap:9,
    },
    actionText:{
      fontFamily:fonts.bold,
      color:colors.text,
      fontSize:10,
    },
  });
