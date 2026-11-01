import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpenIcon } from "lucide-react";
import { LearnNav } from "./_components/learn-nav";

export const metadata: Metadata = {
  title: "eve を理解する | eve データアナリスト",
  description: "eve の仕組みと、このデモアプリの作りの解説",
};

export default function LearnLayout({ children }: { readonly children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:px-6">
          <BookOpenIcon className="size-4" />
          <Link className="font-medium text-sm" href="/learn">
            eve を理解する
          </Link>
          <span className="text-muted-foreground text-sm">· eve データアナリストの解説</span>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[15rem_1fr] lg:gap-12">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <LearnNav />
        </aside>
        <main className="min-w-0 max-w-3xl space-y-10 pb-24">{children}</main>
      </div>
    </div>
  );
}
