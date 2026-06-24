"use client";

import Link from "next/link";
import { Globe, Mail, MessageSquare, Shield, ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-20 border-t-3 border-black bg-slate-950 relative z-10 overflow-hidden">
       {/* Background Glow */}
       <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-1/2 bg-brand-orange/5 blur-[120px] rounded-full pointer-events-none" />
       
       <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
             {/* Brand */}
             <div className="lg:col-span-1">
                <div className="flex items-center gap-3 mb-6">
                   <img
                      src="/images/applogo.png"
                      alt="UniGame Logo"
                      className="h-12 w-12 object-contain rounded-2xl border-2 border-black shadow-[1.5px_1.5px_0px_#000000]"
                   />
                   <span className="font-outfit text-2xl font-black text-slate-50 uppercase tracking-tighter">UniGame</span>
                </div>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                   The world's most advanced strategic board platform. 
                   Enter the arena, dominate the boards, and claim your legacy.
                </p>
                <div className="flex gap-4">
                   {[Globe, MessageSquare, Mail, Shield].map((Icon, i) => (
                     <Link key={i} href="#" className="h-10 w-10 rounded-xl bg-slate-900 border-2 border-black flex items-center justify-center text-slate-400 hover:text-brand-orange transition-all shadow-[1.5px_1.5px_0px_#000000] cursor-pointer">
                        <Icon className="h-5 w-5" />
                     </Link>
                   ))}
                </div>
             </div>

             {/* Links */}
             <div>
                <h4 className="font-outfit text-xs font-black text-slate-50 uppercase tracking-[0.2em] mb-8">Ecosystem</h4>
                <nav className="flex flex-col gap-4">
                   {['Home', 'Featured Games', 'Leaderboards', 'Global Lobbies'].map(l => (
                     <Link key={l} href="#" className="text-sm font-bold text-slate-500 hover:text-slate-50 transition-colors">
                        {l}
                     </Link>
                   ))}
                </nav>
             </div>

             <div>
                <h4 className="font-outfit text-xs font-black text-slate-50 uppercase tracking-[0.2em] mb-8">Community</h4>
                <nav className="flex flex-col gap-4">
                   {['Leaderboards', 'Match Feed', 'Achievements', 'Join Discord'].map(l => (
                     <Link key={l} href="#" className="text-sm font-bold text-slate-500 hover:text-slate-50 transition-colors">
                        {l}
                     </Link>
                   ))}
                </nav>
             </div>

             {/* Newsletter */}
             <div>
                <h4 className="font-outfit text-xs font-black text-slate-50 uppercase tracking-[0.2em] mb-8">Newsletter</h4>
                <p className="text-slate-500 text-xs font-medium mb-6">Stay updated with our newest games and features.</p>
                <div className="relative">
                   <input 
                     type="text" 
                     placeholder="YOUR EMAIL" 
                     className="w-full h-14 bg-slate-900 border-3 border-black rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-brand-orange text-slate-50 shadow-[2px_2px_0px_#000000]"
                   />
                   <button className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-brand-orange border-2 border-black flex items-center justify-center text-slate-950 hover:bg-brand-orange shadow-[1px_1px_0px_#000000] cursor-pointer">
                      <Link href="#"><ArrowRight className="h-5 w-5" /></Link>
                   </button>
                </div>
             </div>
          </div>
          
          <div className="pt-10 border-t-3 border-black flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">© 2026 UNIGAME INTERACTIVE. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">
               <Link href="#" className="hover:text-slate-50 transition-colors">Privacy Policy</Link>
               <Link href="#" className="hover:text-slate-50 transition-colors">Terms of Service</Link>
            </div>
          </div>
       </div>
    </footer>
  );
}
