import {
  ArrowRight,
  BellDot,
  BrainCircuit,
  CalendarCheck2,
  Lock,
  MailCheck,
  Orbit,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import {
  actionQueue,
  feed,
  insights,
  meetings,
  privacyControls,
  priorityStrip,
  todayMetrics,
  workflows,
} from "@shadowtwin/sample-data";

import { CommandPalette } from "@/components/command-palette";
import { Badge, BulletList, Button, Panel, Section } from "@/components/ui";

const marketingNav = [
  { href: "/product", label: "Product" },
  { href: "/privacy", label: "Privacy" },
  { href: "/security", label: "Security" },
  { href: "/pricing", label: "Pricing" },
  { href: "/insights", label: "Insights" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link className="flex items-center gap-3" href="/">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-line bg-surface shadow-card">
            <Orbit size={18} className="text-accent" />
          </div>
          <div>
            <div className="font-semibold text-ink">ShadowTwin</div>
            <div className="text-xs text-ink-muted">Private operational twin</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-ink-muted md:flex">
          {marketingNav.map((item) => (
            <Link className="transition hover:text-ink" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button href="/demo" variant="secondary">
            Book demo
          </Button>
          <Button href="/workspace">Open app</Button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="space-y-3">
          <div className="font-heading text-3xl text-ink">ShadowTwin</div>
          <p className="max-w-sm text-sm leading-6 text-ink-muted">
            A trust-first operational twin for founders, operators, and teams who need calm intelligence across scattered work.
          </p>
        </div>
        <FooterColumn
          title="Company"
          links={[
            { href: "/about", label: "About" },
            { href: "/pricing", label: "Pricing" },
            { href: "/contact", label: "Contact" },
          ]}
        />
        <FooterColumn
          title="Trust"
          links={[
            { href: "/privacy", label: "Privacy" },
            { href: "/security", label: "Security" },
            { href: "/demo", label: "Book demo" },
          ]}
        />
        <FooterColumn
          title="Product"
          links={[
            { href: "/product", label: "Product" },
            { href: "/insights", label: "Insights" },
            { href: "/workspace", label: "Web app" },
          ]}
        />
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-ink">{title}</div>
      <div className="space-y-2 text-sm text-ink-muted">
        {links.map((link) => (
          <Link className="block transition hover:text-ink" href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

const corePillars = [
  {
    icon: Lock,
    title: "Private by default",
    text: "Selective sync, fine-grained scopes, and approval before sensitive actions are designed into every flow.",
  },
  {
    icon: BrainCircuit,
    title: "Operational intelligence",
    text: "ShadowTwin models patterns, priorities, and decisions instead of behaving like a generic assistant.",
  },
  {
    icon: ShieldCheck,
    title: "Trust before automation",
    text: "The system begins with drafts, recommendations, and explainable suggestions before it ever acts on your behalf.",
  },
];

const useCases = [
  {
    title: "Email that understands obligations",
    copy: "Detect hidden follow-ups, draft replies in your style, and keep approval before send at the center.",
    icon: MailCheck,
  },
  {
    title: "Meeting prep without the scramble",
    copy: "Briefs arrive with people context, past touchpoints, and the open questions you usually need answered.",
    icon: CalendarCheck2,
  },
  {
    title: "Workflow intelligence that earns trust",
    copy: "Repeatable patterns become proposed automations with visible triggers, actions, and audit history.",
    icon: Workflow,
  },
];

export function HomePage() {
  return (
    <div className="space-y-24 pb-24">
      <Hero />
      <div className="mx-auto max-w-7xl space-y-24 px-6">
        <Section
          eyebrow="Why it feels different"
          title="A private model of how you work, not a chatbot layered onto your tools."
          description="ShadowTwin learns your follow-up cadence, how you prepare for meetings, what you usually prioritize, and how you communicate. The result is a system that can think with you and support execution with context."
        >
          <div className="grid gap-6 md:grid-cols-3">
            {corePillars.map((pillar) => (
              <Panel
                description={pillar.text}
                key={pillar.title}
                title={pillar.title}
              >
                <pillar.icon className="mb-4 text-accent" size={22} />
              </Panel>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Core use cases"
          title="Built for overloaded operators whose context is scattered everywhere."
          description="The interface stays restrained, but the underlying model works across email, calendar, CRM, notes, docs, meetings, and browser workflow capture."
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {useCases.map((item) => (
              <Panel description={item.copy} key={item.title} title={item.title}>
                <item.icon className="mb-4 text-accent" size={22} />
              </Panel>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Privacy-first product design"
          title="Trust is visible in the interface, not buried in policy language."
          description="Every recommendation can explain why it appeared, what sources informed it, and whether the system is observing, drafting, or waiting for your approval."
        >
          <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
            <Panel
              title="Permissions center"
              description="Connected tools, scopes, retention, read or write capability, and workspace exclusions are visible in one place."
              tone="accent"
            >
              <div className="space-y-3">
                {privacyControls.map((control) => (
                  <div
                    className="rounded-2xl border border-line bg-surface/80 p-4"
                    key={control.id}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium text-ink">{control.name}</div>
                        <div className="text-sm text-ink-muted">{control.scope}</div>
                      </div>
                      <Badge>{control.mode}</Badge>
                    </div>
                    <div className="mt-2 text-xs uppercase tracking-[0.18em] text-ink-muted">
                      Retention / {control.retention}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel
              title="Trust copy that belongs in the product"
              description="The language stays precise and reassuring without sounding like compliance theater."
            >
              <BulletList
                items={[
                  "Why this was suggested",
                  "Based on 4 similar meetings",
                  "Approval required before send",
                  "Sensitive sources excluded",
                  "Delete from twin memory",
                  "Do not learn from this item",
                ]}
              />
            </Panel>
          </div>
        </Section>

        <Section
          eyebrow="Product preview"
          title="Command center on desktop, fast approvals on mobile, and one shared system underneath."
          description="The web app focuses on operational depth. The mobile app stays compact and approval-driven for fast review, capture, and follow-up on the move."
        >
          <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
            <TodayPreview />
            <MobilePreview />
          </div>
        </Section>

        <Section
          eyebrow="Pricing"
          title="Structured for solo operators, executives, and teams."
          description="Pricing is positioned around trust, capability depth, and operational scale rather than raw message volume."
        >
          <div className="grid gap-6 lg:grid-cols-4">
            {[
              ["Free trial", "14-day guided setup and minimal mode access"],
              ["Solo Pro", "Personal twin, email and calendar intelligence, mobile review"],
              ["Executive", "Deeper memory, automation approvals, CRM and doc sync"],
              ["Team", "Shared workspace memory, role permissions, audit and policy controls"],
            ].map(([title, copy]) => (
              <Panel description={copy} key={title} title={title} />
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Call to action"
          title="ShadowTwin learns how you work. Then it works with you."
          description="Start with minimal sync, review what the twin learns, and build trust before anything ever acts on your behalf."
        >
          <div className="flex flex-wrap gap-3">
            <Button href="/demo">Book demo</Button>
            <Button href="/pricing" variant="secondary">
              View plans
            </Button>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="bg-shadow-grid">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-[1fr,0.95fr] lg:py-24">
        <div className="space-y-8">
          <Badge tone="accent">Your private operational twin</Badge>
          <div className="space-y-5">
            <h1 className="max-w-4xl font-heading text-[clamp(3.4rem,8vw,6.8rem)] leading-[0.96] text-ink">
              Learn how you work. Then work with you.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-ink-muted">
              ShadowTwin models your operating style across email, meetings, docs, tasks, and memory. It is built first for founders and CEOs, but it also fits any high-context operator who needs calm intelligence for execution.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/demo">Book demo</Button>
            <Button href="/workspace" variant="secondary">
              Preview web app
            </Button>
          </div>
          <div className="grid max-w-3xl gap-3 text-sm text-ink-muted sm:grid-cols-3">
            <div className="rounded-2xl border border-line bg-surface px-4 py-3 shadow-card">
              Private by default
            </div>
            <div className="rounded-2xl border border-line bg-surface px-4 py-3 shadow-card">
              Approval before action
            </div>
            <div className="rounded-2xl border border-line bg-surface px-4 py-3 shadow-card">
              Built for high-context work
            </div>
          </div>
        </div>
        <div className="rounded-[36px] border border-line bg-surface p-6 shadow-panel">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-ink">Today</div>
              <div className="text-sm text-ink-muted">
                Command center for priorities, approvals, and insights
              </div>
            </div>
            <Badge tone="success">Twin stage / Suggest</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {todayMetrics.map((metric) => (
              <div
                className="rounded-[24px] border border-line bg-canvas p-4"
                key={metric.label}
              >
                <div className="text-xs uppercase tracking-[0.18em] text-ink-muted">
                  {metric.label}
                </div>
                <div className="mt-3 text-3xl font-semibold text-ink">{metric.value}</div>
                <div className="mt-1 text-sm text-ink-muted">{metric.delta}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-[24px] border border-line bg-canvas p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-ink">Priority strip</div>
              <div className="text-xs uppercase tracking-[0.18em] text-ink-muted">Today</div>
            </div>
            <div className="space-y-3">
              {priorityStrip.map((priority) => (
                <div className="flex items-start gap-3 text-sm text-ink-muted" key={priority}>
                  <BellDot className="mt-0.5 text-accent" size={16} />
                  <span>{priority}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TodayPreview() {
  return (
    <Panel
      title="Web app / Today"
      description="A restrained command center that surfaces priorities, approvals, meeting prep, risks, and recent learning in one view."
      tone="accent"
    >
      <div className="grid gap-4">
        {actionQueue.map((item) => (
          <div className="rounded-2xl border border-line bg-surface p-4" key={item.id}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-medium text-ink">{item.title}</div>
                <div className="text-sm text-ink-muted">{item.description}</div>
              </div>
              <Badge>{item.status}</Badge>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function MobilePreview() {
  return (
    <Panel
      title="Mobile app / Review and act"
      description="The mobile experience is focused on quick review, approvals, meeting prep, capture, and follow-up."
    >
      <div className="mx-auto max-w-xs rounded-[32px] border border-line bg-[#101419] p-4 text-white shadow-panel">
        <div className="rounded-[24px] bg-white/6 p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-white/60">
            What your twin noticed
          </div>
          <div className="mt-3 text-lg font-semibold">
            Three follow-ups may slip before 17:00.
          </div>
          <div className="mt-2 text-sm text-white/70">
            Two approvals are ready and your 14:30 brief has been prepared.
          </div>
        </div>
        <div className="mt-4 grid gap-3">
          {[
            "Meeting brief ready",
            "Draft reply prepared in your style",
            "Workflow ready for approval",
          ].map((item) => (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm" key={item}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

export function ContentPage({
  eyebrow,
  title,
  summary,
  sections,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  sections: Array<{ title: string; copy: string; bullets?: string[] }>;
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-6 py-20">
      <div className="space-y-5">
        <Badge tone="accent">{eyebrow}</Badge>
        <h1 className="font-heading text-5xl text-ink">{title}</h1>
        <p className="max-w-3xl text-lg leading-8 text-ink-muted">{summary}</p>
      </div>
      <div className="space-y-6">
        {sections.map((section) => (
          <Panel description={section.copy} key={section.title} title={section.title}>
            {section.bullets ? <BulletList items={section.bullets} /> : null}
          </Panel>
        ))}
      </div>
    </div>
  );
}

const workspaceNav = [
  { href: "/workspace/setup", label: "Setup" },
  { href: "/workspace", label: "Today" },
  { href: "/workspace/feed", label: "Twin Feed" },
  { href: "/workspace/integrations", label: "Integrations" },
  { href: "/workspace/email", label: "Email" },
  { href: "/workspace/meetings", label: "Meetings" },
  { href: "/workspace/memory", label: "Memory" },
  { href: "/workspace/automations", label: "Automations" },
  { href: "/workspace/privacy", label: "Privacy" },
  { href: "/workspace/settings", label: "Settings" },
];

export function WorkspaceShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="grid min-h-screen lg:grid-cols-[260px,1fr]">
        <aside className="border-r border-line bg-surface px-5 py-6">
          <Link className="mb-8 flex items-center gap-3" href="/">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-canvas">
              <Orbit className="text-accent" size={18} />
            </div>
            <div>
              <div className="font-semibold text-ink">ShadowTwin</div>
              <div className="text-xs text-ink-muted">Workspace</div>
            </div>
          </Link>
          <nav className="space-y-2">
            {workspaceNav.map((item) => (
              <Link
                className="block rounded-2xl px-4 py-3 text-sm text-ink-muted transition hover:bg-canvas hover:text-ink"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 rounded-[24px] border border-line bg-canvas p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-ink-muted">
              Twin maturity
            </div>
            <div className="mt-2 text-lg font-semibold text-ink">Stage 2 / Suggest</div>
            <div className="mt-2 text-sm leading-6 text-ink-muted">
              Observing patterns confidently. Recommendations are explainable. Approval is still required before send or write actions.
            </div>
          </div>
        </aside>
        <main className="px-6 py-6">
          <div className="mb-8 flex flex-col gap-4 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-sm text-ink-muted">Operational twin workspace</div>
              <h1 className="font-heading text-4xl text-ink">{title}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-muted">{subtitle}</p>
            </div>
            <CommandPalette />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export function TodayView() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {todayMetrics.map((metric) => (
            <Panel
              description={metric.delta}
              key={metric.label}
              title={metric.value}
              meta={metric.label}
            />
          ))}
        </div>
        <Panel
          title="Action queue"
          description="High-leverage approvals, follow-up risks, and workflow suggestions waiting for your decision."
        >
          <div className="space-y-4">
            {actionQueue.map((item) => (
              <div className="rounded-2xl border border-line bg-canvas p-4" key={item.id}>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <div className="font-medium text-ink">{item.title}</div>
                    <div className="text-sm leading-6 text-ink-muted">{item.description}</div>
                  </div>
                  <div className="space-y-2">
                    <Badge>{item.status}</Badge>
                    <div className="text-right text-xs uppercase tracking-[0.18em] text-ink-muted">
                      {item.dueLabel}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel
          title="Meetings today"
          description="Briefs prepared, open loops surfaced, and likely tasks ready to extract."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {meetings.map((meeting) => (
              <div className="rounded-2xl border border-line bg-canvas p-4" key={meeting.id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-ink">{meeting.title}</div>
                  <Badge>{meeting.startTime}</Badge>
                </div>
                <div className="mt-2 text-sm leading-6 text-ink-muted">{meeting.summary}</div>
                <div className="mt-3 text-xs uppercase tracking-[0.18em] text-ink-muted">
                  Why you are seeing this / Based on prior meeting edits and follow-ups
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <div className="space-y-6">
        <Panel
          title="Priority strip"
          description="Top items likely to affect your day if left unattended."
          tone="accent"
        >
          <div className="space-y-3">
            {priorityStrip.map((priority) => (
              <div className="rounded-2xl border border-line bg-surface p-4 text-sm text-ink-muted" key={priority}>
                {priority}
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Twin insights" description="Operational patterns the model is confident enough to surface.">
          <div className="space-y-4">
            {insights.map((insight) => (
              <div className="rounded-2xl border border-line bg-canvas p-4" key={insight.id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-ink">{insight.title}</div>
                  <div className="text-sm text-accent">
                    {Math.round(insight.confidence * 100)}%
                  </div>
                </div>
                <div className="mt-2 text-sm leading-6 text-ink-muted">{insight.detail}</div>
                <div className="mt-3 text-xs uppercase tracking-[0.18em] text-ink-muted">
                  {insight.rationale}
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Quick capture" description="Send a note, voice memo, link, or screenshot into memory with context.">
          <div className="grid gap-3 sm:grid-cols-2">
            {["Quick note", "Voice memo", "Save link", "Attach screenshot"].map((item) => (
              <button
                className="rounded-2xl border border-line bg-canvas px-4 py-4 text-left text-sm font-medium text-ink transition hover:bg-surface-muted"
                key={item}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function FeedView() {
  return (
    <div className="grid gap-4">
      {feed.map((item) => (
        <Panel
          description={item.detail}
          key={item.id}
          meta={`${Math.round(item.confidence * 100)}% confidence`}
          title={item.title}
        >
          <div className="rounded-2xl border border-line bg-canvas p-4 text-sm leading-6 text-ink-muted">
            Why this was suggested / {item.why}
          </div>
        </Panel>
      ))}
    </div>
  );
}

export function EmailView() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr,0.9fr]">
      <Panel
        title="Important threads"
        description="Urgent conversations, stale threads, and waiting-on items grouped by likely business impact."
      >
        <div className="space-y-4">
          {[
            "Investor diligence reply / Draft prepared in your style / Approval required before send",
            "Candidate follow-up / Waiting 27 hours / Hidden obligation detected from interview close",
            "Customer expansion thread / Stale for 3 days / Proposed next-step email ready",
          ].map((thread) => (
            <div className="rounded-2xl border border-line bg-canvas p-4 text-sm text-ink-muted" key={thread}>
              {thread}
            </div>
          ))}
        </div>
      </Panel>
      <Panel
        title="User-style draft panel"
        description="Drafts remain editable and explainable before anything leaves your outbox."
        tone="accent"
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-surface p-4 text-sm leading-7 text-ink-muted">
            Daniel, great speaking earlier. I wanted to close the loop on the diligence points we discussed...
          </div>
          <div className="grid gap-3 text-sm text-ink-muted">
            <div className="rounded-2xl border border-line bg-surface p-4">
              Why this draft / Based on 4 similar investor follow-ups and your usual concise closing structure.
            </div>
            <div className="rounded-2xl border border-line bg-surface p-4">
              Confidence / 82% match to your usual decision style.
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

export function MeetingsView() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr,0.9fr]">
      <Panel
        title="Upcoming meetings"
        description="Prep briefs combine people context, documents, open loops, and your likely next actions."
      >
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <div className="rounded-2xl border border-line bg-canvas p-4" key={meeting.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium text-ink">{meeting.title}</div>
                <Badge>{meeting.startTime}</Badge>
              </div>
              <div className="mt-2 text-sm leading-6 text-ink-muted">{meeting.summary}</div>
              <div className="mt-3 text-xs uppercase tracking-[0.18em] text-ink-muted">
                People context / {meeting.participants.join(" / ")}
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel
        title="Post-meeting workflow"
        description="Transcript summary, decision extraction, tasks, and follow-up draft all stay in one approval loop."
      >
        <BulletList
          items={[
            "Decisions extracted into the action queue",
            "Tasks proposed with likely owners",
            "Follow-up email ready for approval",
            "CRM or note updates held until confirmed",
          ]}
        />
      </Panel>
    </div>
  );
}

export function MemoryView() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
      <Panel
        title="Semantic memory search"
        description="A blended archive of notes, meetings, docs, captures, and people context with relationship-level search."
        tone="accent"
      >
        <div className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink-muted">
          Search people, projects, decisions, commitments, and captures
        </div>
        <div className="mt-4 space-y-4">
          {[
            "Daniel Moss / last 2 investor calls / open diligence requests",
            "Candidate debrief notes linked to GTM role",
            "Pricing research screenshots connected to Q2 launch project",
          ].map((result) => (
            <div className="rounded-2xl border border-line bg-surface p-4 text-sm text-ink-muted" key={result}>
              {result}
            </div>
          ))}
        </div>
      </Panel>
      <Panel
        title="Graph and timeline"
        description="Memory stays explorable by people, projects, meetings, and capture type without forcing a dense graph-first interface."
      >
        <BulletList
          items={[
            "Timeline view for recent captures and decisions",
            "Linked people and projects for context retrieval",
            "Meeting memory grouped by relationship and topic",
            "Delete from memory and do-not-learn controls on every item",
          ]}
        />
      </Panel>
    </div>
  );
}

export function AutomationsView() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr,0.9fr]">
      <Panel
        title="Suggested automations"
        description="ShadowTwin proposes workflows only after patterns become consistent enough to explain and trust."
      >
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <div className="rounded-2xl border border-line bg-canvas p-4" key={workflow.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium text-ink">{workflow.title}</div>
                <div className="text-sm text-accent">
                  {Math.round(workflow.confidence * 100)}%
                </div>
              </div>
              <div className="mt-2 text-sm text-ink-muted">
                Trigger / {workflow.trigger}
              </div>
              <div className="mt-3 space-y-2">
                {workflow.actions.map((action) => (
                  <div className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink-muted" key={action}>
                    {action}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel
        title="Audit and rollback"
        description="Every automation remains inspectable, disable-able, and reversible."
      >
        <BulletList
          items={[
            "Pending approval queue for new triggers and actions",
            "Per-run audit trail with source objects and confidence",
            "Rollback control for writes that touch CRM or task systems",
            "Workspace policies for read-only mode and sensitive source exclusions",
          ]}
        />
      </Panel>
    </div>
  );
}

export function PrivacyView() {
  return (
    <div className="space-y-6">
      <Panel
        title="Connections and permissions"
        description="The strongest screen in the product. Every tool, scope, model behavior, retention rule, and write policy is visible here."
        tone="accent"
      >
        <div className="space-y-4">
          {privacyControls.map((control) => (
            <div
              className="grid gap-4 rounded-2xl border border-line bg-surface p-4 md:grid-cols-[0.8fr,1fr,0.7fr,0.6fr]"
              key={control.id}
            >
              <div className="font-medium text-ink">{control.name}</div>
              <div className="text-sm text-ink-muted">{control.scope}</div>
              <div className="text-sm text-ink-muted">{control.retention}</div>
              <Badge>{control.mode}</Badge>
            </div>
          ))}
        </div>
      </Panel>
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Model usage" description="Sensitive sources excluded from training. Workspace data stays isolated.">
          <BulletList
            items={[
              "Local-first processing where possible",
              "Do not learn from this item controls",
              "Export and delete available at workspace level",
            ]}
          />
        </Panel>
        <Panel title="Approval rules" description="Choose what the twin can draft, suggest, or queue for action.">
          <BulletList
            items={[
              "Always require approval before send",
              "Read-only mode for selected tools",
              "Per-source exclusion for executive or legal folders",
            ]}
          />
        </Panel>
        <Panel title="Auditability" description="Every suggestion and action can explain what sources informed it.">
          <BulletList
            items={[
              "Why this was suggested",
              "Based on similar meetings or threads",
              "Chronological audit event log",
            ]}
          />
        </Panel>
      </div>
    </div>
  );
}

export function SettingsView() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {[
        ["Profile", "Name, role, and executive context"],
        ["Workspace", "Members, roles, and team memory policies"],
        ["Twin behavior", "Stage visibility, confidence thresholds, and suggestions"],
        ["Writing style", "Voice anchors, examples, and tone exclusions"],
        ["Approval rules", "Always require approval before send or write"],
        ["Notifications", "Mobile pushes and digest frequency"],
        ["Integrations", "Connected tools, scopes, and sync health"],
        ["Data controls", "Retention, export, deletion, and exclusions"],
        ["Theme", "Light, dark, and reduced motion"],
      ].map(([title, copy]) => (
        <Panel description={copy} key={title} title={title} />
      ))}
    </div>
  );
}
