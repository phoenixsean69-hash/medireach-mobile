import {
  Check,
  HeartPulse,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react-native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import type { Models } from "react-native-appwrite";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { account } from "../config/appwrite";
import { colors, fonts, radius } from "../theme";

type MediReachPreferences = Models.Preferences & {
  role?: string;
  accountStatus?: string;
  verificationRequired?: boolean;
  firstName?: string;
  lastName?: string;
};

type MediReachUser = Models.User<MediReachPreferences>;

export default function AuthSuccess() {
  const [user, setUser] = useState<MediReachUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    account
      .get<MediReachPreferences>()
      .then(setUser)
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    try {
      await account.deleteSession({ sessionId: "current" });
      router.replace("/login");
    } catch (error: any) {
      Alert.alert("Logout failed", error?.message ?? "Unable to logout.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.charcoal} />
      </View>
    );
  }

  if (!user) return null;

  const role = user.prefs?.role || "MediReach user";
  const pending = user.prefs?.accountStatus === "pending_verification";

  return (
    <View style={styles.root}>
      <View style={styles.logo}>
        <HeartPulse size={27} color={colors.white} />
      </View>

      <View style={styles.card}>
        <View style={styles.success}>
          {pending ? (
            <ShieldCheck size={27} color={colors.charcoal} />
          ) : (
            <Check size={27} color={colors.charcoal} />
          )}
        </View>

        <Text style={styles.title}>
          {pending ? "Verification pending" : "Account ready"}
        </Text>

        <Text style={styles.subtitle}>
          {pending
            ? "Your professional MediReach account was created and is waiting for credential verification."
            : "Your MediReach account was created successfully."}
        </Text>

        <View style={styles.detail}>
          <UserRound size={18} color={colors.muted} />
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Account</Text>
            <Text style={styles.detailValue}>{user.name || user.email}</Text>
          </View>
        </View>

        <View style={styles.detail}>
          <ShieldCheck size={18} color={colors.muted} />
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Role</Text>
            <Text style={styles.detailValue}>{role}</Text>
          </View>
        </View>

        <Pressable style={styles.logout} onPress={logout}>
          <LogOut size={18} color={colors.charcoal} />
          <Text style={styles.logoutText}>Sign out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  center: {
    flex: 1,
    backgroundColor: colors.canvas,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.charcoal,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.large,
    padding: 22,
  },
  success: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  title: {
    marginTop: 16,
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 23,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 7,
    marginBottom: 21,
    fontFamily: fonts.regular,
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
  },
  detail: {
    minHeight: 62,
    marginTop: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  detailText: { flex: 1 },
  detailLabel: {
    fontFamily: fonts.regular,
    color: colors.muted,
    fontSize: 9,
  },
  detailValue: {
    marginTop: 2,
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 12,
  },
  logout: {
    height: 50,
    marginTop: 19,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  logoutText: {
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 12,
  },
});
