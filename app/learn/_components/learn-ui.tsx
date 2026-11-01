import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon, InfoIcon, LightbulbIcon, TriangleAlertIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const LEARN_PAGES = [
  { href: "/learn", title: "eve とは", summary: "何ができて、いまどんな段階か" },
  { href: "/learn/architecture", title: "このアプリの構成", summary: "ファイルと役割、リクエストの通り道" },
  { href: "/learn/turn", title: "1 ターンの流れ", summary: "質問から承認・再開まで" },
  { href: "/learn/streaming", title: "ストリーミング UI", summary: "文字が少しずつ出て、再読み込みしても続く理由" },
  { href: "/learn/vercel", title: "Vercel の機能", summary: "どの機能が何を楽にしているか" },
] as const;

export function PageHeader({
  eyebrow,
  title,
  lead,
}: {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: ReactNode;
}) {
  return (
    <header className="space-y-3 border-b pb-8">
      <p className="font-medium text-muted-foreground text-xs uppercase tracking-widest">{eyebrow}</p>
      <h1 className="font-semibold text-3xl tracking-tight sm:text-4xl">{title}</h1>
      <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">{lead}</p>
    </header>
  );
}

export function Section({
  title,
  children,
}: {
  readonly title: string;
  readonly children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="font-semibold text-xl tracking-tight">{title}</h2>
      <div className="space-y-4 text-[15px] leading-relaxed">{children}</div>
    </section>
  );
}

const CALLOUT_STYLES = {
  info: { icon: InfoIcon, box: "border-sky-500/30 bg-sky-500/5", text: "text-sky-700 dark:text-sky-300" },
  tip: {
    icon: LightbulbIcon,
    box: "border-emerald-500/30 bg-emerald-500/5",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  warn: {
    icon: TriangleAlertIcon,
    box: "border-amber-500/30 bg-amber-500/5",
    text: "text-amber-700 dark:text-amber-300",
  },
} as const;

export function Callout({
  kind = "info",
  title,
  children,
}: {
  readonly kind?: keyof typeof CALLOUT_STYLES;
  readonly title?: string;
  readonly children: ReactNode;
}) {
  const style = CALLOUT_STYLES[kind];
  const Icon = style.icon;
  return (
    <div className={cn("flex gap-3 rounded-lg border p-4 text-sm leading-relaxed", style.box)}>
      <Icon className={cn("mt-0.5 size-4 shrink-0", style.text)} />
      <div className="min-w-0 space-y-1">
        {title ? <p className={cn("font-medium", style.text)}>{title}</p> : null}
        <div className="text-foreground/90">{children}</div>
      </div>
    </div>
  );
}

export function Code({ children }: { readonly children: ReactNode }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
      {children}
    </code>
  );
}

export function CodeBlock({ title, children }: { readonly title?: string; readonly children: string }) {
  return (
    <figure className="overflow-hidden rounded-lg border bg-card">
      {title ? (
        <figcaption className="border-b bg-muted/50 px-4 py-2 font-mono text-muted-foreground text-xs">
          {title}
        </figcaption>
      ) : null}
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed">
        <code>{children.trim()}</code>
      </pre>
    </figure>
  );
}

/** Rows of label/value pairs, for comparisons and quick facts. */
export function Table({
  head,
  rows,
}: {
  readonly head: readonly string[];
  readonly rows: readonly (readonly ReactNode[])[];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <table className="w-full min-w-[32rem] text-left text-sm">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr>
            {head.map((cell) => (
              <th className="px-4 py-2.5 font-medium" key={cell}>
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td
                  className={cn("px-4 py-2.5 align-top", cellIndex === 0 && "font-medium")}
                  key={cellIndex}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CardGrid({ children }: { readonly children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

export function Card({
  icon,
  title,
  children,
}: {
  readonly icon?: ReactNode;
  readonly title: string;
  readonly children: ReactNode;
}) {
  return (
    <div className="space-y-2 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        {icon ? (
          <span className="flex size-7 items-center justify-center rounded-md bg-muted text-foreground [&_svg]:size-4">
            {icon}
          </span>
        ) : null}
        <p className="font-medium text-sm">{title}</p>
      </div>
      <div className="text-muted-foreground text-sm leading-relaxed">{children}</div>
    </div>
  );
}

/** A vertical sequence of numbered steps, each with a short title and explanation. */
export function Steps({
  steps,
}: {
  readonly steps: readonly { readonly title: ReactNode; readonly body: ReactNode; readonly tag?: string }[];
}) {
  return (
    <ol className="relative space-y-5 border-l pl-6">
      {steps.map((step, index) => (
        <li className="relative" key={index}>
          <span className="absolute top-0 -left-[37px] flex size-6 items-center justify-center rounded-full border bg-card font-medium text-xs">
            {index + 1}
          </span>
          <div className="space-y-1">
            <p className="flex flex-wrap items-center gap-2 font-medium text-sm">
              {step.title}
              {step.tag ? (
                <span className="rounded-full border px-2 py-0.5 font-normal text-[11px] text-muted-foreground">
                  {step.tag}
                </span>
              ) : null}
            </p>
            <div className="text-muted-foreground text-sm leading-relaxed">{step.body}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Boxes joined by arrows; wraps to a column on narrow screens. */
export function Flow({
  nodes,
}: {
  readonly nodes: readonly { readonly title: string; readonly detail: string; readonly accent?: boolean }[];
}) {
  return (
    <div className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center">
      {nodes.map((node, index) => (
        <div className="flex flex-col items-center gap-2 lg:flex-1 lg:flex-row" key={node.title}>
          <div
            className={cn(
              "w-full rounded-lg border bg-card p-3 text-center",
              node.accent && "border-foreground/40 shadow-sm",
            )}
          >
            <p className="font-medium text-sm">{node.title}</p>
            <p className="mt-1 text-muted-foreground text-xs leading-snug">{node.detail}</p>
          </div>
          {index < nodes.length - 1 ? (
            <ArrowRightIcon className="size-4 shrink-0 rotate-90 text-muted-foreground lg:rotate-0" />
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function NextPage({ current }: { readonly current: string }) {
  const index = LEARN_PAGES.findIndex((page) => page.href === current);
  const next = LEARN_PAGES[index + 1];
  if (!next) {
    return (
      <Link
        className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
        href="/"
      >
        <span>
          <span className="block text-muted-foreground text-xs">読み終わったら</span>
          <span className="font-medium">チャットで試してみる</span>
        </span>
        <ArrowRightIcon className="size-4" />
      </Link>
    );
  }
  return (
    <Link
      className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
      href={next.href}
    >
      <span>
        <span className="block text-muted-foreground text-xs">次のページ</span>
        <span className="font-medium">{next.title}</span>
      </span>
      <ArrowRightIcon className="size-4" />
    </Link>
  );
}
