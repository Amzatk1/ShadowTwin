import { ContentPage } from "@/components/site";

export default function ProductPage() {
  return (
    <ContentPage
      eyebrow="Product"
      title="An operational twin that learns patterns, then supports execution."
      summary="ShadowTwin is designed around observation, explainable suggestions, approval-first action, and eventually careful delegation for trusted workflows."
      sections={[
        {
          title: "Observe, model, and suggest",
          copy: "The twin learns how you prioritize, reply, prepare, and follow up across tools without forcing you into a new system.",
        },
        {
          title: "Built around operational objects",
          copy: "Users, twins, workspaces, meetings, threads, tasks, memory items, automations, and audit events stay consistent across the product surface and backend.",
        },
        {
          title: "Trust-first UX",
          copy: "The product repeatedly explains why a recommendation appeared, how it was formed, and whether it is read-only, approval-gated, or action-enabled.",
        },
      ]}
    />
  );
}

