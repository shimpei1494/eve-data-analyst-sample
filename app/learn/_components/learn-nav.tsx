"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquareIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { LEARN_PAGES } from "./learn-ui";

export function LearnNav() {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {LEARN_PAGES.map((page, index) => {
        const active = pathname === page.href;
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active ? "bg-card font-medium shadow-sm ring-1 ring-border" : "hover:bg-accent",
            )}
            href={page.href}
            key={page.href}
          >
            <span className="w-4 shrink-0 text-muted-foreground tabular-nums">{index + 1}</span>
            <span className="min-w-0">
              <span className="block">{page.title}</span>
              <span className="block font-normal text-muted-foreground text-xs">{page.summary}</span>
            </span>
          </Link>
        );
      })}
      <Link
        className="mt-4 flex items-center gap-2 rounded-md px-3 py-2 text-muted-foreground text-sm hover:bg-accent hover:text-foreground"
        href="/"
      >
        <MessageSquareIcon className="size-4" />
        チャットに戻る
      </Link>
    </nav>
  );
}
