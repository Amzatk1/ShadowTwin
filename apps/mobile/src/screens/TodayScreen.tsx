import { Plus } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { approvals, priorities } from "../data/sample";
import {
  RowItem,
  ScreenContainer,
  SectionCard,
  Chip,
} from "../components/ui";
import { useAppStore } from "../store/useAppStore";
import { palette } from "../theme/tokens";

export function TodayScreen() {
  const openCapture = useAppStore((state) => state.openCapture);

  return (
    <ScreenContainer
      title="Today"
      subtitle="Top priorities, approvals, meeting prep, and what your twin noticed."
      action={
        <Pressable
          onPress={openCapture}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: palette.accent,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Plus color="#FFFFFF" size={20} />
        </Pressable>
      }
    >
      <SectionCard
        accent
        title="What your twin noticed"
        description="Three follow-ups may slip before 17:00, your 14:30 brief is ready, and two drafts are waiting for review."
      >
        <Chip label="Stage 2 / Suggest" />
      </SectionCard>
      <SectionCard title="Top priorities" description="A short list designed to reduce context switching.">
        {priorities.map((item) => (
          <RowItem detail="Why you are seeing this / It matches your usual follow-up or meeting cadence." key={item} title={item} />
        ))}
      </SectionCard>
      <SectionCard title="Approval requests" description="Edits remain possible before anything is sent or written.">
        {approvals.map((item) => (
          <RowItem key={item.title} title={item.title} detail={item.detail} />
        ))}
      </SectionCard>
      <View>
        <Text style={{ color: palette.textMuted, fontSize: 13 }}>
          Push examples: "Meeting brief ready for 2:30 PM with Daniel" and "Draft reply prepared in your style".
        </Text>
      </View>
    </ScreenContainer>
  );
}
