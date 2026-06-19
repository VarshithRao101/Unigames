"use client";

import Link from "next/link";
import { Globe, Mail, MessageSquare, Shield, ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-20 border-t border-white/5 bg-slate-dark relative z-10 overflow-hidden">
       {/* Background Glow */}
       <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-1/2 bg-brand-orange/5 blur-[120px] rounded-full pointer-events-none" />
       
       <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
             {/* Brand */}
             <div className="lg:col-span-1">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center text-brand-orange font-black text-xl">
                      U
                   </div>
                   <span className="font-outfit text-2xl font-black text-white uppercase tracking-tighter">UniGame</span>
                </div>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                   The world's most advanced strategic gaming hub. 
                   Enter the arena, dominate the boards, and claim your legacy.
                </p>
                <div className="flex gap-4">
                   {[Globe, MessageSquare, Mail, Shield].map((Icon, i) => (
                     <Link key={i} href="#" className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-brand-orange hover:border-brand-orange/40 transition-all">
                        <Icon className="h-5 w-5" />
                     </Link>
                   ))}
                </div>
             </div>

             {/* Links */}
             <div>
                <h4 className="font-outfit text-xs font-black text-white uppercase tracking-[0.2em] mb-8">Ecosystem</h4>
                <nav className="flex flex-col gap-4">
                   {['Home', 'Featured Games', 'Leaderboards', 'Global Lobbies'].map(l => (
                     <Link key={l} href="#" className="text-sm font-bold text-slate-500 hover:text-white transition-colors">
                        {l}
                     </Link>
                   ))}
                </nav>
             </div>

             <div>
                <h4 className="font-outfit text-xs font-black text-white uppercase tracking-[0.2em] mb-8">Community</h4>
                <nav className="flex flex-col gap-4">
                   {['Leaderboards', 'Match Feed', 'Achievements', 'Join Discord'].map(l => (
                     <Link key={l} href="#" className="text-sm font-bold text-slate-500 hover:text-white transition-colors">
                        {l}
                     </Link>
                   ))}
                </nav>
             </div>

             {/* Newsletter */}
             <div>
                <h4 className="font-outfit text-xs font-black text-white uppercase tracking-[0.2em] mb-8">Intelligence</h4>
                <p className="text-slate-500 text-xs font-medium mb-6">Stay ahead of the competition with weekly meta updates.</p>
                <div className="relative">
                   <input 
                     type="text" 
                     placeholder="ENCRYPTED EMAIL" 
                     className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-brand-orange/40"
                   />
                   <button className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-brand-orange flex items-center justify-center text-slate-950">
                      <Link href="#"><ArrowRight className="h-5 w-5" /></Link>
                   </button>
                </div>
             </div>
          </div>
          
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">© 2026 UNIGAME INTERACTIVE. DEPLOYED BY THE ELITE.</p>
            <div className="flex gap-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">
               <Link href="#" className="hover:text-white transition-colors">Privacy Protocol</Link>
               <Link href="#" className="hover:text-white transition-colors">Service Terms</Link>
            </div>
          </div>
       </div>
    </footer>
  );
}

