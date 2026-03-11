import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { onboardingSteps } from "../data/sample";
import { apiClient } from "../services/api";
import { useSessionStore } from "../store/useSessionStore";
import { palette, radii, spacing } from "../theme/tokens";

export function OnboardingScreen() {
  const setSession = useSessionStore((state) => state.setSession);
  const [email, setEmail] = useState("ayo@shadowtwin.demo");
  const [password, setPassword] = useState("shadowtwin123");

  const loginMutation = useMutation({
    mutationFn: () => apiClient.auth.token(email, password),
    onSuccess: async (payload) => {
      await setSession(payload);
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>ShadowTwin</Text>
        <Text style={styles.title}>A private operational twin for how high-context people actually work.</Text>
        <Text style={styles.copy}>
          Built for founders first, but usable by any operator who needs a calm, trust-first layer across scattered work.
        </Text>
        <View style={styles.stack}>
          {onboardingSteps.map((step) => (
            <View key={step.title} style={styles.card}>
              <Text style={styles.cardTitle}>{step.title}</Text>
              <Text style={styles.cardCopy}>{step.copy}</Text>
            </View>
          ))}
        </View>
        <View style={styles.footer}>
          <View style={styles.notice}>
            <Text style={styles.noticeText}>Minimal mode available. Source connection and scope control stay on web first.</Text>
          </View>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={palette.textMuted}
            style={styles.input}
            value={email}
          />
          <TextInput
            autoCapitalize="none"
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={palette.textMuted}
            secureTextEntry
            style={styles.input}
            value={password}
          />
          <Pressable onPress={() => loginMutation.mutate()} style={styles.button}>
            <Text style={styles.buttonText}>{loginMutation.isPending ? "Signing in..." : "Continue"}</Text>
          </Pressable>
          {loginMutation.isError ? (
            <Text style={styles.errorText}>
              {loginMutation.error instanceof Error ? loginMutation.error.message : "Unable to sign in."}
            </Text>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: "space-between",
  },
  eyebrow: {
    color: palette.accent,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    color: palette.text,
    fontSize: 40,
    fontWeight: "700",
    lineHeight: 46,
    marginTop: spacing.sm,
  },
  copy: {
    color: palette.textMuted,
    fontSize: 16,
    lineHeight: 26,
    marginTop: spacing.md,
  },
  stack: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.lg,
  },
  cardTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "700",
  },
  cardCopy: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },
  footer: {
    gap: spacing.md,
  },
  notice: {
    borderRadius: radii.md,
    padding: spacing.md,
    backgroundColor: palette.accentSoft,
  },
  noticeText: {
    color: palette.accent,
    fontSize: 13,
    fontWeight: "600",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: palette.accent,
    paddingVertical: 16,
  },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    color: palette.text,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 15,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  errorText: {
    color: "#F4A5A5",
    fontSize: 13,
    lineHeight: 20,
  },
});
