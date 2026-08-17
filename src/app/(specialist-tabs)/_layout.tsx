import {
  BriefcaseMedical,
  ClipboardList,
  House,
  MessageCircle,
  UserRound,
} from "lucide-react-native";

import {
  Tabs,
} from "expo-router";

import SpecialistLoading from "../../components/specialist/SpecialistLoading";

import {
  SpecialistAppProvider,
  useSpecialistApp,
} from "../../context/SpecialistAppContext";

import {
  colors,
  fonts,
} from "../../theme";

import {
  translateZimbabweText,
} from "../../i18n/zimbabweLanguages";

function SpecialistTabsContent() {
  const {
    loading,
    language,
  } =
    useSpecialistApp();

  const t =
    (
      text: string,
    ) =>
      translateZimbabweText(
        text,
        language,
      );

  if (loading) {
    return (
      <SpecialistLoading />
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
        name="referrals"
        options={{
          title:
            t("Referrals"),
          tabBarIcon: ({
            color,
            focused,
          }) => (
            <BriefcaseMedical
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
        name="cases"
        options={{
          title:
            t("Cases"),
          tabBarIcon: ({
            color,
            focused,
          }) => (
            <ClipboardList
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
        name="packet-review"
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

export default function SpecialistTabsLayout() {
  return (
    <SpecialistAppProvider>
      <SpecialistTabsContent />
    </SpecialistAppProvider>
  );
}
