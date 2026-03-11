import type { ReactNode } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { palette, radii, spacing } from "../theme/tokens";

export function ScreenContainer({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          {action}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function SectionCard({
  title,
  description,
  children,
  accent = false,
}: {
  title: string;
  description: string;
  children?: ReactNode;
  accent?: boolean;
}) {
  return (
    <View style={[styles.card, accent && styles.cardAccent]}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
      {children ? <View style={{ marginTop: spacing.md }}>{children}</View> : null}
    </View>
  );
}

export function Chip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

export function ToneChip({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "accent" | "success" | "warning" | "danger";
}) {
  return (
    <View
      style={[
        styles.chip,
        tone === "default" && styles.chipDefault,
        tone === "accent" && styles.chipAccent,
        tone === "success" && styles.chipSuccess,
        tone === "warning" && styles.chipWarning,
        tone === "danger" && styles.chipDanger,
      ]}
    >
      <Text
        style={[
          styles.chipText,
          tone === "default" && styles.chipTextDefault,
          tone === "accent" && styles.chipTextAccent,
          tone === "success" && styles.chipTextSuccess,
          tone === "warning" && styles.chipTextWarning,
          tone === "danger" && styles.chipTextDanger,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export function RowItem({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <View style={styles.rowItem}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowDetail}>{detail}</Text>
    </View>
  );
}

export function ActionButton({
  label,
  onPress,
  tone = "default",
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  tone?: "default" | "accent" | "danger";
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.actionButton,
        tone === "accent" && styles.actionButtonAccent,
        tone === "danger" && styles.actionButtonDanger,
        disabled && styles.actionButtonDisabled,
      ]}
    >
      <Text
        style={[
          styles.actionButtonText,
          tone === "accent" && styles.actionButtonTextAccent,
          tone === "danger" && styles.actionButtonTextDanger,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function InsightCard({
  title,
  detail,
  meta,
  chips,
  actions,
}: {
  title: string;
  detail: string;
  meta?: string;
  chips?: Array<{ label: string; tone?: "default" | "accent" | "success" | "warning" | "danger" }>;
  actions?: ReactNode;
}) {
  return (
    <View style={styles.insightCard}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowDetail}>{detail}</Text>
      {meta ? <Text style={styles.insightMeta}>{meta}</Text> : null}
      {chips?.length ? (
        <View style={styles.chipRow}>
          {chips.map((chip) => (
            <ToneChip key={`${chip.label}-${chip.tone ?? "default"}`} label={chip.label} tone={chip.tone} />
          ))}
        </View>
      ) : null}
      {actions ? <View style={styles.actionRow}>{actions}</View> : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.primaryButton}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function CaptureModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const items = ["Text note", "Voice note", "Image or screenshot", "Save link", "Tag person or project", "Set urgency"];

  return (
    <Modal animationType="slide" transparent visible={open}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Quick capture</Text>
          <Text style={styles.modalCopy}>
            Add a note, voice memo, screenshot, or link and attach it to the right project, person, or meeting.
          </Text>
          <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
            {items.map((item) => (
              <View key={item} style={styles.modalRow}>
                <Text style={styles.rowTitle}>{item}</Text>
              </View>
            ))}
          </View>
          <Pressable onPress={onClose} style={[styles.primaryButton, { marginTop: spacing.lg }]}>
            <Text style={styles.primaryButtonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  title: {
    color: palette.text,
    fontSize: 34,
    fontWeight: "700",
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 6,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.lg,
  },
  cardAccent: {
    backgroundColor: palette.surfaceRaised,
  },
  cardTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "700",
  },
  cardDescription: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 6,
  },
  chip: {
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    backgroundColor: palette.accentSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  chipDefault: {
    backgroundColor: palette.surfaceMuted,
  },
  chipAccent: {
    backgroundColor: palette.accentSoft,
  },
  chipSuccess: {
    backgroundColor: "rgba(57, 169, 118, 0.14)",
  },
  chipWarning: {
    backgroundColor: "rgba(213, 163, 60, 0.14)",
  },
  chipDanger: {
    backgroundColor: "rgba(217, 107, 107, 0.14)",
  },
  chipText: {
    color: palette.accent,
    fontSize: 12,
    fontWeight: "600",
  },
  chipTextDefault: {
    color: palette.textMuted,
  },
  chipTextAccent: {
    color: palette.accent,
  },
  chipTextSuccess: {
    color: palette.success,
  },
  chipTextWarning: {
    color: palette.warning,
  },
  chipTextDanger: {
    color: palette.danger,
  },
  rowItem: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceMuted,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowTitle: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "600",
  },
  rowDetail: {
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  insightCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceMuted,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  insightMeta: {
    color: palette.textMuted,
    fontSize: 11,
    lineHeight: 18,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: spacing.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  actionButtonAccent: {
    backgroundColor: palette.accentSoft,
    borderColor: palette.accentSoft,
  },
  actionButtonDanger: {
    backgroundColor: "rgba(217, 107, 107, 0.12)",
    borderColor: "rgba(217, 107, 107, 0.28)",
  },
  actionButtonDisabled: {
    opacity: 0.55,
  },
  actionButtonText: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "700",
  },
  actionButtonTextAccent: {
    color: palette.accent,
  },
  actionButtonTextDanger: {
    color: palette.danger,
  },
  primaryButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: palette.accent,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.48)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: palette.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.xl,
  },
  modalTitle: {
    color: palette.text,
    fontSize: 24,
    fontWeight: "700",
  },
  modalCopy: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },
  modalRow: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    backgroundColor: palette.surfaceMuted,
  },
});
