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
  chipText: {
    color: palette.accent,
    fontSize: 12,
    fontWeight: "600",
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
