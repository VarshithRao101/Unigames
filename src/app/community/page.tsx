"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CommunityPageRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="bg-slate-950 min-h-screen text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
        <p className="font-outfit text-xs font-black uppercase tracking-widest text-slate-500">Redirecting to Community Hub...</p>
      </div>
    </div>
  );
}
