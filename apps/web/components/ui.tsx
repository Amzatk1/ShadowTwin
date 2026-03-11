import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Button({
  href,
  children,
  variant = "primary",
  onClick,
  type = "button",
  disabled = false,
}: {
  href?: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}) {
  const className = cn(
    "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition duration-200 disabled:opacity-60",
    variant === "primary" && "bg-ink text-white hover:bg-black/90",
    variant === "secondary" && "border border-line bg-surface text-ink hover:bg-surface-muted",
    variant === "ghost" && "text-ink-muted hover:text-ink",
  );

  if (href) {
    return (
      <Link className={className} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={className} disabled={disabled} onClick={onClick} type={type}>
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "accent" | "success" | "warning" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        tone === "default" && "border-line bg-surface text-ink-muted",
        tone === "accent" && "border-accent/15 bg-accent-soft text-accent",
        tone === "success" && "border-success/20 bg-success/10 text-success",
        tone === "warning" && "border-warning/20 bg-warning/10 text-warning",
        tone === "danger" && "border-danger/20 bg-danger/10 text-danger",
      )}
    >
      {tone === "accent" ? <Sparkles size={14} /> : null}
      {tone === "success" ? <CheckCircle2 size={14} /> : null}
      {children}
    </span>
  );
}

export function Section({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-8">
      <div className="max-w-3xl space-y-4">
        <Badge tone="accent">{eyebrow}</Badge>
        <h2 className="font-heading text-4xl leading-tight text-ink sm:text-5xl">
          {title}
        </h2>
        <p className="max-w-2xl text-base leading-7 text-ink-muted sm:text-lg">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

export function Panel({
  title,
  description,
  meta,
  children,
  tone = "default",
}: {
  title: string;
  description?: string;
  meta?: string;
  children?: ReactNode;
  tone?: "default" | "accent";
}) {
  return (
    <article
      className={cn(
        "rounded-[28px] border p-6 shadow-card",
        tone === "default" && "border-line bg-surface",
        tone === "accent" && "border-accent/15 bg-gradient-to-br from-accent-soft to-surface",
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-ink">{title}</h3>
          {meta ? <span className="text-xs text-ink-muted">{meta}</span> : null}
        </div>
        {description ? (
          <p className="text-sm leading-6 text-ink-muted">{description}</p>
        ) : null}
      </div>
      {children ? <div className="mt-5">{children}</div> : null}
    </article>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 text-sm leading-6 text-ink-muted">
      {items.map((item) => (
        <li className="flex items-start gap-3" key={item}>
          <span className="mt-1 rounded-full bg-accent/10 p-1 text-accent">
            <ArrowRight size={12} />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
