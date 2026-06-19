"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export function SideChatWidget() {
  const pathname = usePathname();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (pathname === "/community") {
      e.preventDefault();
      const el = document.getElementById("chat");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <Link 
      href="/community#chat" 
      onClick={handleClick}
      className="fixed right-0 top-[45%] -translate-y-1/2 z-[80] group flex items-center"
    >
      {/* Visual Tab */}
      <div className="bg-brand-orange text-slate-950 border-y-[3px] border-l-[3px] border-black rounded-l-xl shadow-premium p-2 flex flex-col items-center gap-2 cursor-pointer transition-transform hover:-translate-x-1 duration-150 select-none">
        
        {/* Pulsing indicator */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success border border-black"></span>
        </span>

        {/* Message icon */}
        <MessageSquare className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />

        {/* Vertical Text */}
        <div className="flex flex-col text-[8px] font-black uppercase tracking-widest leading-none mt-1">
          <span>W</span>
          <span>O</span>
          <span>R</span>
          <span>L</span>
          <span>D</span>
          <span className="h-1" />
          <span>C</span>
          <span>H</span>
          <span>A</span>
          <span>T</span>
        </div>
      </div>
    </Link>
  );
}
