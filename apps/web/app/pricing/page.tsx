import { ContentPage } from "@/components/site";

export default function PricingPage() {
  return (
    <ContentPage
      eyebrow="Pricing"
      title="Structured for solo operators, executives, and teams."
      summary="Plans are framed around capability depth, privacy controls, and operational reach instead of simplistic per-message pricing."
      sections={[
        {
          title: "Free trial",
          copy: "Guided onboarding, minimal mode, and a short evaluation path for core use cases like meeting prep and follow-up risk detection.",
        },
        {
          title: "Solo Pro and Executive",
          copy: "Deeper style modeling, semantic memory, richer connections, and stronger approval tooling for individual operators.",
        },
        {
          title: "Team and Enterprise",
          copy: "Shared memory, role permissions, audit depth, policy controls, and security workflows designed for multiple operators in one workspace.",
        },
      ]}
    />
  );
}

