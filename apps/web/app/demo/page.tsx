import { ContentPage } from "@/components/site";

export default function DemoPage() {
  return (
    <ContentPage
      eyebrow="Book demo"
      title="A guided walkthrough of the full product system."
      summary="The demo flow should start with onboarding and privacy, then move into Today, Meetings, Email Intelligence, Memory, Automations, and the permissions center."
      sections={[
        {
          title: "What the walkthrough should cover",
          copy: "Role-based onboarding, trust signals, approval flows, meeting prep, email drafting, semantic memory, workflow suggestions, and auditability.",
        },
        {
          title: "Who it is best for",
          copy: "Teams and individuals with scattered operational context and meaningful follow-up or decision load.",
        },
        {
          title: "Suggested next step",
          copy: "Connect calendar first, then inbox, then one notes or CRM source. Start in minimal mode before enabling action-oriented workflows.",
        },
      ]}
    />
  );
}

