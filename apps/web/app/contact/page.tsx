import { ContentPage } from "@/components/site";

export default function ContactPage() {
  return (
    <ContentPage
      eyebrow="Contact"
      title="Book a demo or start a conversation."
      summary="The launch motion is intentionally high-touch. Teams should understand privacy, onboarding, and integration scope before enabling deeper twin behavior."
      sections={[
        {
          title: "Book a demo",
          copy: "See the full web and mobile system, onboarding flow, privacy center, and operational workflows with product context tailored to your role.",
        },
        {
          title: "Join the waitlist",
          copy: "Early access is geared toward founders, operators, chiefs of staff, and lean teams with high context load.",
        },
        {
          title: "Security and procurement",
          copy: "Enterprise buyers can request security documentation, architecture summaries, and role or workspace policy walkthroughs.",
        },
      ]}
    />
  );
}

