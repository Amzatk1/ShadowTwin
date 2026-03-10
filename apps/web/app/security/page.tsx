import { ContentPage } from "@/components/site";

export default function SecurityPage() {
  return (
    <ContentPage
      eyebrow="Security"
      title="Serious startup-grade security from the first release."
      summary="The architecture assumes secure OAuth connections, encrypted secrets, auditable actions, role-based access, and event-level visibility over the system's behavior."
      sections={[
        {
          title: "Access model",
          copy: "Role-based access, workspace boundaries, and approval policies prevent broad or silent action inside sensitive systems.",
        },
        {
          title: "Auditability",
          copy: "Every important suggestion, approval, write, and automation run leaves a visible audit trail.",
        },
        {
          title: "Operational safeguards",
          copy: "Sensitive write actions remain approval-gated. Trusted workflows can graduate to automation only after explicit policy changes.",
        },
      ]}
    />
  );
}
