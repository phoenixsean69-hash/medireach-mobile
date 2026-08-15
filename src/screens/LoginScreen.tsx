import { router } from "expo-router";
import { Eye, EyeOff, HeartPulse, LockKeyhole, Phone } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  Pressable, StyleSheet, Text, TextInput, View,
} from "react-native";
import { account } from "../config/appwrite";
import { resolveLoginEmail } from "../services/signupService";
import { colors, fonts, radius } from "../theme";

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      Alert.alert("Missing details", "Enter your phone number or demo email and password.");
      return;
    }

    setLoading(true);
    try {
      try { await account.deleteSession({ sessionId: "current" }); } catch {}
      await account.createEmailPasswordSession({
        email: resolveLoginEmail(identifier),
        password,
      });
      await account.get();
      router.replace("/auth-success");
    } catch (error: any) {
      Alert.alert("Sign in failed", error?.message ?? "MediReach could not sign you in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.center}>
        <View style={styles.logo}>
          <HeartPulse size={28} color={colors.white} />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to MediReach</Text>

          <Text style={styles.label}>Phone number</Text>
          <View style={styles.inputWrap}>
            <Phone size={19} color={colors.muted} />
            <TextInput
              value={identifier}
              onChangeText={setIdentifier}
              style={styles.input}
              keyboardType="phone-pad"
              placeholder="Phone number"
              placeholderTextColor={colors.softMuted}
            />
          </View>

          <Text style={styles.hint}>
            Existing demo accounts can still enter their MediReach demo email here.
          </Text>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrap}>
            <LockKeyhole size={19} color={colors.muted} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry={!showPassword}
              placeholder="Password"
              placeholderTextColor={colors.softMuted}
              onSubmitEditing={handleLogin}
            />
            <Pressable onPress={() => setShowPassword((v) => !v)}>
              {showPassword
                ? <EyeOff size={19} color={colors.muted} />
                : <Eye size={19} color={colors.muted} />}
            </Pressable>
          </View>

          <Pressable style={styles.primary} onPress={handleLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.primaryText}>Sign in</Text>}
          </Pressable>

          <Pressable style={styles.link} onPress={() => router.replace("/signup")}>
            <Text style={styles.linkText}>New to MediReach? Create an account</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  center: {
    flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20,
  },
  logo: {
    width: 64, height: 64, borderRadius: 20, backgroundColor: colors.charcoal,
    alignItems: "center", justifyContent: "center", marginBottom: 18,
  },
  card: {
    width: "100%", maxWidth: 380, backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.large, padding: 22,
  },
  title: {
    fontFamily: fonts.bold, color: colors.text, fontSize: 24, textAlign: "center",
  },
  subtitle: {
    marginTop: 6, marginBottom: 24, fontFamily: fonts.regular,
    color: colors.muted, fontSize: 12, textAlign: "center",
  },
  label: {
    marginBottom: 7, fontFamily: fonts.bold, color: colors.text, fontSize: 11,
  },
  inputWrap: {
    minHeight: 52, marginBottom: 7, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.card, backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 13, flexDirection: "row", alignItems: "center", gap: 9,
  },
  input: {
    flex: 1, minHeight: 50, fontFamily: fonts.regular, color: colors.text, fontSize: 13,
  },
  hint: {
    marginBottom: 16, fontFamily: fonts.regular,
    color: colors.softMuted, fontSize: 8, lineHeight: 12,
  },
  primary: {
    height: 52, borderRadius: radius.card, backgroundColor: colors.charcoal,
    alignItems: "center", justifyContent: "center", marginTop: 4,
  },
  primaryText: { fontFamily: fonts.bold, color: colors.white, fontSize: 13 },
  link: { marginTop: 17, alignItems: "center" },
  linkText: { fontFamily: fonts.semiBold, color: colors.muted, fontSize: 11 },
});
