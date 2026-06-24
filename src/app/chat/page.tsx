"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { DoorOpen, Send, Users, Activity, Shield, Zap, MessageSquare, Terminal } from "lucide-react";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { getPusherClient } from "@/lib/pusher";

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<{ id: string; sender: string; senderId?: string; avatar?: string; text: string; time: string }[]>([]);
  const [text, setText] = useState("");
  const [onlineMembers, setOnlineMembers] = useState<{ id: string; name: string; avatar: string; activity: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // 1. Fetch chat history
    async function fetchChatHistory() {
      try {
        const res = await fetch("/api/chat?channel=global");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setMessages(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to load global chat history:", err);
      }
    }
    fetchChatHistory();

    // 2. Subscribe to Pusher channel
    const pusher = getPusherClient();
    const channelName = "presence-global-chat";
    const channel = pusher.subscribe(channelName);

    // Bind event for new message
    channel.bind("new-message", (msg: any) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    // Helper to extract list from members object
    const updateMembersList = () => {
      const list: any[] = [];
      const presenceChannel = channel as any;
      if (presenceChannel.members) {
        presenceChannel.members.each((member: any) => {
          list.push({
            id: member.id,
            name: member.info?.username || "Gamer",
            avatar: member.info?.image || "/avatars/avatar-placeholder.png",
            activity: "Exploring Unigames",
          });
        });
      }
      setOnlineMembers(list);
    };

    channel.bind("pusher:subscription_succeeded", () => {
      updateMembersList();
    });

    channel.bind("pusher:member_added", () => {
      updateMembersList();
    });

    channel.bind("pusher:member_removed", () => {
      updateMembersList();
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, []);

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;

    const messageText = text.trim();
    setText("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: "global",
          text: messageText,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to send message");
      }
    } catch (err) {
      console.error("Error sending global message:", err);
    }
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
                    <Terminal className="w-4 h-4" /> Global Chat Channel
                 </span>
                 <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase leading-[0.9]">
                    Global <span className="gradient-text">Chat</span>
                 </h1>
                 <p className="text-lg text-slate-400 font-medium">
                    Chat with other players, share room codes, and hang out with the community.
                 </p>
              </div>
              <div className="flex bg-slate-900/40 border-3 border-black rounded-2xl p-4 items-center gap-6 shadow-[3px_3px_0px_#000000]">
                 <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-success">Online</span>
                 </div>
                 <div className="h-8 w-[1.5px] bg-slate-800" />
                 <div className="flex items-center gap-2">
                     <Users className="w-4 h-4 text-brand-orange" />
                     <span className="text-lg font-space font-black text-slate-50">{onlineMembers.length}</span>
                  </div>
              </div>
           </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[380px_1fr]">
          {/* Active Members Sidebar */}
          <aside className="space-y-8">
             <div className="glass p-8">
                <div className="flex items-center justify-between mb-8">
                   <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-50">Online Users</h4>
                   <Activity className="w-4 h-4 text-brand-orange animate-pulse" />
                </div>
                
                <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-hide pr-2">
                   {onlineMembers.length === 0 ? (
                     <p className="text-[10px] font-bold text-slate-550 uppercase tracking-widest text-center py-4">No other users online</p>
                   ) : (
                     onlineMembers.map((member) => (
                       <div key={member.id} className="group p-4 rounded-[1.8rem] border-3 border-black bg-slate-900/40 hover:bg-slate-900/80 transition-all shadow-[2.5px_2.5px_0px_#000000]">
                          <div className="flex items-center gap-4">
                             <div className="h-12 w-12 rounded-full bg-slate-900 border-2 border-black flex items-center justify-center font-black text-slate-400 shadow-[2px_2px_0px_#000000] relative overflow-hidden shrink-0">
                                {member.avatar && (member.avatar.startsWith("http") || member.avatar.startsWith("/") || member.avatar.includes(".")) ? (
                                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                  member.name.charAt(0).toUpperCase()
                                )}
                                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-success rounded-full border-2 border-black" />
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="text-sm font-black uppercase tracking-tighter text-slate-50 group-hover:text-brand-orange transition-colors truncate">
                                  {member.name} {member.id === user?.id && <span className="text-[9px] text-brand-orange font-bold font-mono lowercase">(you)</span>}
                                </p>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate">{member.activity}</p>
                             </div>
                             <Zap className="w-3.5 h-3.5 text-slate-650 shrink-0" />
                          </div>
                       </div>
                     ))
                   )}
                </div>

                 <Link href="/rooms" className="mt-8 block">
                    <Button variant="outline" className="w-full h-14 rounded-2xl border-3 border-black bg-slate-900 text-slate-555 hover:bg-slate-800 font-black uppercase text-[10px] tracking-widest shadow-[3px_3px_0px_#000000]">
                       Game Rooms
                    </Button>
                 </Link>
             </div>
             
             {/* Security Note */}
             <div className="panel p-8 bg-brand-orange/5">
                <div className="flex items-center gap-4 mb-4">
                   <Shield className="w-5 h-5 text-brand-orange" />
                   <h4 className="text-[10px] font-black uppercase tracking-widest">Secure Chat</h4>
                </div>
                <p className="text-[10px] font-bold text-slate-450 leading-relaxed uppercase tracking-widest">
                   Your connection is secure. All messages are encrypted and private.
                </p>
             </div>
          </aside>

          {/* Chat Node */}
          <section className="glass border-[4px] border-black rounded-[2.5rem] shadow-[8px_8px_0px_#000000] overflow-hidden flex flex-col h-[800px] relative">
             {/* Chat Background Decor */}
             <div className="absolute inset-0 opacity-[0.08] pointer-events-none z-0 bg-[radial-gradient(#000000_1.5px,transparent_1.5px)] [background-size:16px_16px]" />

             {/* Messages Area */}
             <div 
                ref={scrollRef}
                className="flex-1 p-8 md:p-12 overflow-y-auto scrollbar-hide space-y-8 relative z-10 flex flex-col"
             >
                <AnimatePresence initial={false}>
                   {messages.map((message, i) => {
                     const isSelf = message.sender === 'You' || (message.senderId && message.senderId === user?.id);
                     return (
                       <motion.div 
                         key={message.id}
                         initial={{ opacity: 0, x: isSelf ? 20 : -20 }}
                         animate={{ opacity: 1, x: 0 }}
                         className={`flex gap-4 items-start w-fit max-w-[85%] ${isSelf ? 'flex-row-reverse self-end' : 'self-start'}`}
                       >
                         {/* Player Avatar Sticker */}
                         <div className={`h-10 w-10 rounded-full border-3 border-black flex items-center justify-center font-black text-sm shrink-0 shadow-[2px_2px_0px_#000000] relative overflow-hidden ${
                           isSelf ? 'bg-brand-orange text-slate-950' : 'bg-slate-900 text-slate-400'
                         }`}>
                           {message.avatar && (message.avatar.startsWith("http") || message.avatar.startsWith("/") || message.avatar.includes(".")) ? (
                             <img src={message.avatar} alt={message.sender} className="w-full h-full object-cover rounded-full" />
                           ) : (
                             message.sender.charAt(0).toUpperCase()
                           )}
                           {!isSelf && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-success rounded-full border-2 border-black animate-pulse" />}
                         </div>

                         {/* Speech Bubble Content */}
                         <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-2 mb-1">
                               <span className={`text-[10px] font-black uppercase tracking-widest ${isSelf ? 'text-brand-orange' : 'text-slate-400'}`}>
                                  {isSelf ? 'You' : message.sender}
                               </span>
                               <span className="text-[8px] font-black text-slate-600 tracking-[0.2em]">{message.time}</span>
                            </div>
                            
                            <div className="relative">
                               <div className={`p-5 rounded-[1.8rem] border-3 border-black transition-all duration-300 relative text-sm shadow-[4px_4px_0px_#000000] ${
                                 isSelf 
                                   ? 'bg-brand-orange text-slate-950 font-bold rounded-tr-none' 
                                   : 'bg-slate-900 text-slate-100 font-medium rounded-tl-none'
                               }`}>
                                  <p className="leading-relaxed">{message.text}</p>
                               </div>
                               {/* Comic Speech Bubble Tail */}
                               {isSelf ? (
                                 <div className="absolute top-[3px] right-[-5px] w-3 h-3 bg-brand-orange border-r-3 border-t-3 border-black rotate-[45deg] z-10" />
                               ) : (
                                 <div className="absolute top-[3px] left-[-5px] w-3 h-3 bg-slate-900 border-l-3 border-t-3 border-black rotate-[-45deg] z-10" />
                               )}
                            </div>
                         </div>
                       </motion.div>
                     );
                   })}
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
                        placeholder="Type a message..."
                        className="w-full h-16 bg-slate-900 border-3 border-black rounded-2xl px-16 text-[10px] font-black uppercase tracking-[0.3em] text-slate-50 focus:outline-none focus:border-brand-orange/50 shadow-[3px_3px_0px_#000000]"
                      />
                    </div>
                    <Button type="submit" className="btn-neo h-16 px-10 rounded-2xl">
                       Send
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
