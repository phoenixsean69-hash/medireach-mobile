import {
  HeartPulse,
  House,
  MessageCircle,
  Siren,
  UserRound,
} from "lucide-react-native";

import {
  Tabs,
} from "expo-router";

import {
  StyleSheet,
  View,
} from "react-native";

import RhwLoading from "../../components/rhw/RhwLoading";

import {
  RhwAppProvider,
  useRhwApp,
} from "../../context/RhwAppContext";

import {
  colors,
  fonts,
} from "../../theme";

function RhwTabsContent() {
  const {
    loading,
    t,
  } =
    useRhwApp();

  if (loading) {
    return (
      <RhwLoading />
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor:
          colors.charcoal,

        tabBarInactiveTintColor:
          colors.softMuted,

        tabBarLabelStyle: {
          fontFamily:
            fonts.bold,
          fontSize: 9,
          marginTop: 2,
        },

        tabBarStyle: {
          height: 72,
          paddingTop: 8,
          paddingBottom: 10,
          borderTopWidth: 1,
          borderTopColor:
            colors.border,
          backgroundColor:
            colors.white,
        },

        tabBarHideOnKeyboard:
          true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title:
            t("Home"),

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <House
              size={
                focused
                  ? 22
                  : 21
              }
              color={color}
              strokeWidth={
                focused
                  ? 2.5
                  : 2
              }
            />
          ),
        }}
      />

      <Tabs.Screen
        name="requests"
        options={{
          title:
            t(
              "Care",
            ),

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <HeartPulse
              size={
                focused
                  ? 22
                  : 21
              }
              color={color}
              strokeWidth={
                focused
                  ? 2.5
                  : 2
              }
            />
          ),
        }}
      />

      <Tabs.Screen
        name="sos"
        options={{
          title: "SOS",

          tabBarIcon: ({
            focused,
          }) => (
            <View
              style={[
                styles.sosIcon,
                focused &&
                  styles
                    .sosIconActive,
              ]}
            >
              <Siren
                size={20}
                color={
                  colors.white
                }
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          title:
            t(
              "Messages",
            ),

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <MessageCircle
              size={
                focused
                  ? 22
                  : 21
              }
              color={color}
              strokeWidth={
                focused
                  ? 2.5
                  : 2
              }
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title:
            t(
              "Profile",
            ),

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <UserRound
              size={
                focused
                  ? 22
                  : 21
              }
              color={color}
              strokeWidth={
                focused
                  ? 2.5
                  : 2
              }
            />
          ),
        }}
      />
    </Tabs>
  );
}

export default function RhwTabsLayout() {
  return (
    <RhwAppProvider>
      <RhwTabsContent />
    </RhwAppProvider>
  );
}

const styles =
  StyleSheet.create({
    sosIcon: {
      width: 37,
      height: 37,
      marginTop: -8,
      borderRadius: 12,
      backgroundColor:
        colors.error,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    sosIconActive: {
      transform: [
        {
          scale: 1.07,
        },
      ],
    },
  });
