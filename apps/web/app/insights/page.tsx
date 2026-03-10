import { ContentPage } from "@/components/site";

export default function InsightsPage() {
  return (
    <ContentPage
      eyebrow="Insights"
      title="Editorial product thinking for the future of execution."
      summary="The blog and insights surface is designed for restrained writing about operational intelligence, privacy-first AI, and the mechanics of scaling individual judgment."
      sections={[
        {
          title: "Example themes",
          copy: "Operational memory, trust-first automation, explainability in workflow AI, and the design of calm dashboards.",
        },
        {
          title: "Audience",
          copy: "Founders, operators, executives, and software teams thinking seriously about AI as leverage rather than novelty.",
        },
        {
          title: "Voice",
          copy: "Calm, precise, and implementation-aware. The product language avoids hype and treats trust as a design requirement.",
        },
      ]}
    />
  );
}

