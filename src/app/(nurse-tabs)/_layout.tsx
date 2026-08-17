import {
  HeartPulse,
  House,
  MessageCircle,
  UserRound,
  UsersRound,
} from "lucide-react-native";

import {
  Tabs,
} from "expo-router";

import NurseLoading from "../../components/nurse/NurseLoading";

import {
  NurseAppProvider,
  useNurseApp,
} from "../../context/NurseAppContext";

import {
  colors,
  fonts,
} from "../../theme";

function NurseTabsContent() {
  const {
    loading,
    t,
  } =
    useNurseApp();

  if (loading) {
    return (
      <NurseLoading />
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
          title: t("Home"),
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
        name="patients"
        options={{
          title:
            t("Patients"),
          tabBarIcon: ({
            color,
            focused,
          }) => (
            <UsersRound
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
        name="care"
        options={{
          title: t("Care"),
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
        name="messages"
        options={{
          title:
            t("Messages"),
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
        name="specialist-consult"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="consult-thread"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title:
            t("Profile"),
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

export default function NurseTabsLayout() {
  return (
    <NurseAppProvider>
      <NurseTabsContent />
    </NurseAppProvider>
  );
}
