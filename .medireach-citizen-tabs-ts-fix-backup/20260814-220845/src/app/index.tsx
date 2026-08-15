import {
  router,
} from "expo-router";

import {
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import {
  account,
} from "../config/appwrite";

import {
  colors,
} from "../theme";

export default function Index() {
  const [resolving, setResolving] =
    useState(true);

  useEffect(() => {
    const resolve =
      async () => {
        try {
          const user =
            await account.get();

          const role =
            String(
              user.prefs?.role ||
              "",
            );

          if (
            role ===
            "citizen"
          ) {
            router.replace(
              "/(citizen-tabs)",
            );

            return;
          }

          router.replace(
            "/auth-success",
          );
        }
        catch {
          router.replace(
            "/signup",
          );
        }
        finally {
          setResolving(
            false,
          );
        }
      };

    resolve();
  }, []);

  if (!resolving) {
    return null;
  }

  return (
    <View style={styles.root}>
      <ActivityIndicator
        size="large"
        color={
          colors.charcoal
        }
      />
    </View>
  );
}

const styles =
  StyleSheet.create({
    root: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        colors.canvas,
    },
  });
