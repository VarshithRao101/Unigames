"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { DoorOpen, Send, Users, Activity, Shield, Zap, MessageSquare, Terminal } from "lucide-react";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { Button } from "@/components/ui/button";
import { GLOBAL_CHAT_SEED, ONLINE_SQUAD } from "@/data/platform";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatPage() {
  const [messages, setMessages] = useState(GLOBAL_CHAT_SEED);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;

    setMessages((current) => [
      ...current,
      {
        id: `${Date.now()}`,
        sender: "You",
        text: text.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setText("");
  };

  return (
    <div className="bg-transparent text-slate-50 min-h-screen">
      <Navbar />

      <main className="pt-32 pb-20 px-6 container mx-auto max-w-7xl">
        {/* Header */}
        <section className="relative mb-12">
           <div className="absolute top-0 left-0 w-80 h-80 bg-brand-orange/5 blur-[100px] rounded-full pointer-events-none" />
           <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-10">
              <div className="max-w-2xl">
                 <span className="kicker mb-4 inline-flex items-center gap-2">
                    <Terminal className="w-4 h-4" /> Global Comms Channel
                 </span>
                 <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase leading-[0.9]">
                    COMMUNICATION <span className="gradient-text">UPLINK</span>
                 </h1>
                 <p className="text-lg text-slate-400 font-medium">
                    Coordinate tactical maneuvers, share access keys, and maintain synchronization with the global squad.
                 </p>
              </div>
              <div className="flex bg-slate-900/40 border-3 border-black rounded-2xl p-4 items-center gap-6 shadow-[3px_3px_0px_#000000]">
                 <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-success">Node Online</span>
                 </div>
                 <div className="h-8 w-[1.5px] bg-slate-800" />
                 <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand-orange" />
                    <span className="text-lg font-space font-black text-slate-50">482</span>
                 </div>
              </div>
           </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[380px_1fr]">
          {/* Active Members Sidebar */}
          <aside className="space-y-8">
             <div className="glass p-8">
                <div className="flex items-center justify-between mb-8">
                   <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-50">Active Squad</h4>
                   <Activity className="w-4 h-4 text-brand-orange animate-pulse" />
                </div>
                
                <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-hide pr-2">
                   {ONLINE_SQUAD.map((member) => (
                     <div key={member.id} className="group p-4 rounded-[1.8rem] border-3 border-black bg-slate-900/40 hover:bg-slate-900/80 transition-all shadow-[2.5px_2.5px_0px_#000000]">
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-full bg-slate-900 border-2 border-black flex items-center justify-center font-black text-slate-400 shadow-[2px_2px_0px_#000000] relative">
                              {member.name.charAt(0)}
                              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-success rounded-full border-2 border-black" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-sm font-black uppercase tracking-tighter text-slate-50 group-hover:text-brand-orange transition-colors truncate">{member.name}</p>
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate">{member.activity}</p>
                           </div>
                           <Zap className="w-3.5 h-3.5 text-slate-650" />
                        </div>
                     </div>
                   ))}
                </div>

                 <Link href="/rooms" className="mt-8 block">
                    <Button variant="outline" className="w-full h-14 rounded-2xl border-3 border-black bg-slate-900 text-slate-555 hover:bg-slate-800 font-black uppercase text-[10px] tracking-widest shadow-[3px_3px_0px_#000000]">
                       Tactical Lobbies
                    </Button>
                 </Link>
             </div>
             
             {/* Security Note */}
             <div className="panel p-8 bg-brand-orange/5">
                <div className="flex items-center gap-4 mb-4">
                   <Shield className="w-5 h-5 text-brand-orange" />
                   <h4 className="text-[10px] font-black uppercase tracking-widest">Protocol Header</h4>
                </div>
                <p className="text-[10px] font-bold text-slate-450 leading-relaxed uppercase tracking-widest">
                   End-to-end synchronization established. All data packets are encrypted via UniGame core security.
                </p>
             </div>
          </aside>

          {/* Chat Node */}
          <section className="glass overflow-hidden flex flex-col h-[800px] relative">
             {/* Chat Background Decor */}
             <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-full bg-mesh rotate-12" />
             </div>

             {/* Messages Area */}
             <div 
               ref={scrollRef}
               className="flex-1 p-8 md:p-12 overflow-y-auto scrollbar-hide space-y-8 relative z-10"
             >
                <AnimatePresence initial={false}>
                   {messages.map((message, i) => (
                     <motion.div 
                       key={message.id}
                       initial={{ opacity: 0, x: message.sender === 'You' ? 20 : -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       className={`flex flex-col ${message.sender === 'You' ? 'items-end' : 'items-start'}`}
                     >
                        <div className="flex items-center gap-3 mb-2">
                           <span className={`text-[10px] font-black uppercase tracking-widest ${message.sender === 'You' ? 'text-brand-orange' : 'text-slate-500'}`}>
                              {message.sender}
                           </span>
                           <span className="text-[8px] font-black text-slate-600 tracking-[0.2em]">{message.time}</span>
                        </div>
                        <div className={`max-w-[80%] p-6 rounded-[2rem] border-3 border-black transition-all duration-300 ${
                          message.sender === 'You' 
                            ? 'bg-brand-orange/10 border-brand-orange/30 rounded-tr-none text-slate-50 shadow-[3px_3px_0px_#000000]' 
                            : 'bg-slate-900/60 rounded-tl-none text-slate-300 shadow-[3px_3px_0px_#000000]'
                        }`}>
                           <p className="text-sm font-medium leading-relaxed">{message.text}</p>
                        </div>
                     </motion.div>
                   ))}
                </AnimatePresence>
             </div>

             {/* Input Area */}
             <div className="p-8 md:p-12 bg-slate-900/20 border-t-3 border-black relative z-20 backdrop-blur-xl">
                <form onSubmit={handleSend} className="flex flex-col sm:flex-row gap-4">
                   <div className="relative flex-1">
                      <MessageSquare className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                      <input 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        type="text" 
                        placeholder="INPUT TRANSMISSION..."
                        className="w-full h-16 bg-slate-900 border-3 border-black rounded-2xl px-16 text-[10px] font-black uppercase tracking-[0.3em] text-slate-50 focus:outline-none focus:border-brand-orange/50 shadow-[3px_3px_0px_#000000]"
                      />
                   </div>
                   <Button type="submit" className="btn-gaming h-16 px-10 rounded-2xl">
                      Transmit
                   </Button>
                </form>
             </div>
          </section>
        </section>
      </main>

      <Footer />
    </div>
  );
}
