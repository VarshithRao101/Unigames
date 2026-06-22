"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MessageSquareText, Send, Users, Zap, Shield, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GLOBAL_CHAT_SEED, ONLINE_SQUAD } from "@/data/platform";
import { useAuth } from "@/context/auth-context";

export function Sidebar() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState(GLOBAL_CHAT_SEED);
  const scrollRef = useRef<HTMLDivElement>(null);

  const onlineCount = useMemo(
    () => ONLINE_SQUAD.filter((member) => member.status !== "away").length,
    []
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputText.trim()) return;

    const nextMessage = {
      id: `${Date.now()}`,
      sender: user?.username ?? "You",
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((current) => [...current, nextMessage]);
    setInputText("");

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-reply`,
          sender: "UniGame AI",
          text: "Connection established.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 900);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen((value) => !value)}
        className={`fixed right-0 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-3 rounded-l-2xl border-3 border-r-0 border-black bg-slate-900 px-3 py-6 text-slate-50 shadow-[2px_2px_0px_#000000] transition-all duration-300 ${isOpen ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100 hover:border-brand-orange hover:text-brand-orange'}`}
        aria-label="Toggle friends panel"
      >
        <Users className="h-6 w-6" />
        <span className="font-outfit text-[9px] font-black uppercase tracking-[0.2em] [writing-mode:vertical-lr]">
          FRIENDS HUB
        </span>
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 z-50 flex h-full w-80 md:w-96 flex-col border-l-3 border-black bg-slate-950 shadow-[-4px_0px_0px_#000000] pt-20"
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 bg-slate-950 border-3 border-black border-r-0 p-3 rounded-l-2xl text-slate-50 hover:text-brand-orange transition-all shadow-[-2px_2px_0px_#000000]"
            >
               <ChevronRight className="h-6 w-6" />
            </button>

            <div className="border-b-3 border-black p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-outfit text-xl font-black uppercase tracking-widest text-slate-50 mb-2">
                    Online Users
                  </h3>
                  <div className="flex items-center gap-3">
                     <div className="flex items-center gap-1.5 px-2.5 py-1 bg-success/10 border-2 border-black rounded-lg shadow-[1.5px_1.5px_0px_#000000]">
                        <span className="h-1.5 w-1.5 bg-success rounded-full animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-success">{onlineCount} Syncing</span>
                     </div>
                  </div>
                </div>
                <Users className="w-6 h-6 text-brand-orange opacity-40" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-10">
              {/* Online Players */}
              <section>
                <div className="flex items-center justify-between mb-6">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Status Feed</h4>
                   <Activity className="w-3 h-3 text-slate-700" />
                </div>
                <div className="space-y-3">
                  {ONLINE_SQUAD.map((member) => (
                    <div
                      key={member.id}
                      className="group flex items-center gap-4 p-4 rounded-2xl border-2 border-black bg-slate-900/45 hover:border-brand-orange transition-all shadow-[2px_2px_0px_#000000]"
                    >
                      <div className="h-12 w-12 rounded-full flex-shrink-0 aspect-square bg-slate-950 border-2 border-black flex items-center justify-center text-slate-400 font-black text-sm relative">
                        {member.name.charAt(0).toUpperCase()}
                        <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-black ${
                          member.status === 'online' ? 'bg-success' : member.status === 'match' ? 'bg-brand-orange' : 'bg-slate-600'
                        }`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-outfit text-sm font-black uppercase tracking-tighter text-slate-50 group-hover:text-brand-orange transition-colors">
                          {member.name}
                        </p>
                        <p className="truncate text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          {member.activity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Chat Panel */}
              <section className="flex flex-col h-[400px]">
                <div className="flex items-center justify-between mb-6">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Node Chat</h4>
                   <MessageSquareText className="w-3 h-3 text-slate-700" />
                </div>

                <div 
                  ref={scrollRef}
                  className="flex-1 space-y-5 overflow-y-auto pr-2 scrollbar-hide"
                >
                  {messages.map((message) => {
                    const isSelf = message.sender === (user?.username ?? "You");
                    return (
                      <div
                        key={message.id}
                        className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}
                      >
                        <div className="mb-2 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-600">
                          <span>{message.sender}</span>
                          <span>{message.time}</span>
                        </div>
                        <div className="relative">
                          <div
                            className={`max-w-[90%] rounded-2xl px-5 py-3 text-sm font-bold border-2 border-black shadow-[2px_2px_0px_#000000] relative ${
                              isSelf
                                ? "bg-brand-orange text-black rounded-tr-none"
                                : "bg-slate-900 text-slate-300 rounded-tl-none"
                            }`}
                          >
                            {message.text}
                          </div>
                          {/* Comic Speech Bubble Tail */}
                          {isSelf ? (
                            <div className="absolute top-[3px] right-[-4px] w-2.5 h-2.5 bg-brand-orange border-r-2 border-t-2 border-black rotate-[45deg] z-10" />
                          ) : (
                            <div className="absolute top-[3px] left-[-4px] w-2.5 h-2.5 bg-slate-900 border-l-2 border-t-2 border-black rotate-[-45deg] z-10" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleSendMessage} className="mt-6">
                   <div className="relative">
                      <input
                        type="text"
                        value={inputText}
                        onChange={(event) => setInputText(event.target.value)}
                        placeholder="Type a message..."
                        className="w-full h-14 bg-slate-900 border-3 border-black rounded-xl px-12 text-[10px] font-black uppercase tracking-widest text-slate-50 focus:outline-none focus:border-brand-orange shadow-[2px_2px_0px_#000000]"
                      />
                      <MessageSquareText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-750" />
                      <button type="submit" className="absolute right-2 top-2 h-10 w-10 bg-brand-orange border-2 border-black rounded-lg flex items-center justify-center text-slate-950 hover:bg-brand-orange shadow-[1px_1px_0px_#000000] cursor-pointer">
                        <Send className="h-4 w-4 fill-current" />
                      </button>
                   </div>
                </form>
              </section>
            </div>
            
            {/* Security Note */}
            <div className="p-8 border-t-3 border-black bg-brand-orange/5">
                <div className="flex items-center gap-3 mb-2">
                   <Shield className="w-3 h-3 text-brand-orange" />
                   <span className="text-[8px] font-black text-slate-50 uppercase tracking-widest">Secure Connection</span>
                </div>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                   Connection secure. Verified via UniGame.
                </p>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}
