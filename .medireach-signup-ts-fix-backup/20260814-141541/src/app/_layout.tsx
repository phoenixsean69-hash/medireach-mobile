import {
  Mulish_400Regular, Mulish_600SemiBold, Mulish_700Bold, useFonts,
} from "@expo-google-fonts/mulish";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { colors } from "../theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded] = useFonts({
    Mulish_400Regular, Mulish_600SemiBold, Mulish_700Bold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);

  if (!loaded) return null;

  return (
    <>
      <StatusBar style="dark" backgroundColor={colors.canvas} />
      <Stack screenOptions={{ headerShown:false, contentStyle:{ backgroundColor:colors.canvas } }} />
    </>
  );
}
