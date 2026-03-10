import { ContentPage } from "@/components/site";

export default function PrivacyPage() {
  return (
    <ContentPage
      eyebrow="Privacy"
      title="Private by default, selective by design."
      summary="Privacy is not positioned as a checkbox. It is part of the operating model: selective sync, visible scopes, explicit approvals, and easy deletion or export."
      sections={[
        {
          title: "Selective sync",
          copy: "Users can begin with minimal mode, connect tools gradually, and exclude sensitive folders, workspaces, or data sources from learning.",
        },
        {
          title: "Transparent model usage",
          copy: "Every connection explains what is accessed, why it is needed, whether it is read-only, and what actions require approval.",
        },
        {
          title: "User control",
          copy: "Every memory item can be removed. Learning can be disabled per-item or per-source. Export and delete controls exist at both account and workspace level.",
        },
      ]}
    />
  );
}

