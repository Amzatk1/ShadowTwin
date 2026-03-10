import { ContentPage } from "@/components/site";

export default function AboutPage() {
  return (
    <ContentPage
      eyebrow="About"
      title="Designed for people whose leverage comes from context."
      summary="ShadowTwin exists for operators whose work is buried across tools, obligations, and hidden decision context. The system is built to extend judgment, not replace it."
      sections={[
        {
          title: "Who it is for",
          copy: "Founders, chiefs of staff, sales leaders, recruiters, consultants, researchers, and other high-context operators.",
        },
        {
          title: "What makes it different",
          copy: "It is not another chatbot, CRM, note app, or task manager. It is a private operational model of how a person works.",
        },
        {
          title: "Product philosophy",
          copy: "Calm minimalism, invisible power, operational intelligence, and trust before automation shape every design and technical decision.",
        },
      ]}
    />
  );
}

