import Link from "next/link";
import { Search, ArrowLeft } from "lucide-react";
import { PublicLayout } from "@/components/common/layouts";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PublicLayout>
      <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <div className="panel-strong edge-glow scan-line rounded-[2rem] px-8 py-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-brand-amber/30 bg-brand-amber/10 text-brand-amber">
            <Search className="h-9 w-9" />
          </div>
          <p className="kicker justify-center">Route not found</p>
          <h1 className="mt-6 text-4xl font-black uppercase tracking-[0.2em] text-white sm:text-5xl">
            This room is offline
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base font-semibold text-slate-400">
            The page or room code does not exist in this preview build. Head back to the main lobby and pick another game.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/">
              <Button leftIcon={<ArrowLeft className="h-4 w-4" />}>Back to home</Button>
            </Link>
            <Link href="/rooms">
              <Button variant="secondary">Browse rooms</Button>
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
