import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { onboardingSteps } from "../data/sample";
import { useAppStore } from "../store/useAppStore";
import { palette, radii, spacing } from "../theme/tokens";

export function OnboardingScreen() {
  const finishOnboarding = useAppStore((state) => state.finishOnboarding);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>ShadowTwin</Text>
        <Text style={styles.title}>A private operational twin for how you actually work.</Text>
        <Text style={styles.copy}>
          Start with minimal sync, visible permissions, and approval-first suggestions. The twin learns gradually and stays transparent.
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
            <Text style={styles.noticeText}>Minimal mode available. Sensitive sources can stay excluded.</Text>
          </View>
          <Pressable onPress={finishOnboarding} style={styles.button}>
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>
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
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
