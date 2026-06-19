"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X, Bot, User, Minus, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

interface Message {
  id: string;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
}

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Welcome to UniGame! I'm your AI assistant. How can I help you level up today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate bot response
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(input),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 1000);
  };

  const getBotResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes("game") || q.includes("play")) {
      return "We have a variety of games including Tic-Tac-Toe X and Chess Masters. You can find them in the Games Explorer!";
    }
    if (q.includes("leaderboard") || q.includes("rank")) {
      return "The Global Leaderboard shows the top-tier players. Keep winning to climb the ranks!";
    }
    if (q.includes("lobby") || q.includes("room")) {
      return "Lobbies are spaces where you can join or create matches. Check the Lobbies section for active rooms.";
    }
    return "That's a great question! For specific account issues, you might want to check our Community forums or contact support directly. Is there anything else I can help with?";
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? "auto" : "500px" 
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "mb-4 w-80 sm:w-96 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-2xl flex flex-col",
              isMinimized ? "h-14" : "h-[500px]"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-brand-amber/10 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-brand-amber flex items-center justify-center text-slate-950">
                    <Bot size={18} />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-none">UniGame AI</h3>
                  <p className="text-[10px] text-brand-amber mt-1 font-medium tracking-wider uppercase">Online Support</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-white/50 hover:text-white"
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minus size={16} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-white/50 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "flex gap-2 max-w-[85%]",
                        m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1",
                        m.sender === "bot" ? "bg-brand-amber/20 text-brand-amber" : "bg-white/10 text-white/70"
                      )}>
                        {m.sender === "bot" ? <Bot size={12} /> : <User size={12} />}
                      </div>
                      <div
                        className={cn(
                          "p-3 rounded-2xl text-sm leading-relaxed",
                          m.sender === "bot" 
                            ? "bg-white/5 text-white/90 rounded-tl-none border border-white/5" 
                            : "bg-brand-amber text-slate-950 font-medium rounded-tr-none"
                        )}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/5 bg-slate-950/50">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask anything..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-amber/50 transition-colors placeholder:text-white/20"
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      className="shrink-0 bg-brand-amber hover:bg-brand-amber/80 text-slate-950"
                      disabled={!input.trim()}
                    >
                      <Send size={18} />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300",
          isOpen 
            ? "bg-brand-amber text-slate-950 rotate-90" 
            : "bg-slate-900 border border-brand-amber/30 text-brand-amber hover:border-brand-amber hover:shadow-brand-amber/20"
        )}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && (
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-amber opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-amber"></span>
          </span>
        )}
      </motion.button>
    </div>
  );
};
