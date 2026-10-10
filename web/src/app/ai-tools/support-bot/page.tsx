"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/lib/api';
import {
  Bot,
  Send,
  User,
  Loader2,
  ChevronLeft,
  Sparkles,
  MessageSquare,
  Info,
  History,
  Trash2,
  CheckCheck,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  time?: string;
}

export default function SupportBotPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Welcome to ScholarAI Support. I am here to assist with your applications, SOPs, and scholarship queries. How can I help you today?', isUser: false, time: 'System' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await apiService.getAIChatHistory();
      if (res.ok && res.data && res.data.length > 0) {
        const formattedMessages = res.data.map((m: any, index: number) => ({
          id: m.id ? m.id.toString() : `history-${index}`,
          text: m.message,
          isUser: m.is_user,
          time: new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setMessages([
          { id: '1', text: 'Welcome to ScholarAI Support. I am here to assist with your applications, SOPs, and scholarship queries. How can I help you today?', isUser: false, time: '' },
          ...formattedMessages
        ]);
      }
    } catch (error) {
      console.error('[SupportBot] History Sync Error:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsgText = inputText.trim();
    const userMessage = {
        id: Date.now().toString(),
        text: userMsgText,
        isUser: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    // Filter out error messages from context history so previous failures don't ruin context
    const history = messages
        .filter(m => m.text && !m.text.includes('temporarily') && !m.text.includes('Connection Error') && !m.text.includes('refreshing') && !m.text.includes('experiencing high demand'))
        .slice(-6)
        .map(m => m.text);

    try {
        const res = await apiService.aiLiveSupport(userMsgText, history);
        if (res.ok && res.data?.response) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                text: res.data.response,
                isUser: false,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } else {
            const errorText = res.data?.error || res.data?.message || 'ScholarAI is currently busy. Please try asking again in a moment.';
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                text: errorText,
                isUser: false,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }
    } catch (err) {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: 'Connection Error: Could not reach the server. Please check your internet connection.',
            isUser: false
        }]);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden font-sans">

      {/* Premium Navigation Bar */}
      <header className="px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-3 bg-white hover:bg-gray-50 rounded-2xl text-foreground shadow-sm border border-black/5 transition-all active:scale-95"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary text-white rounded-[20px] flex items-center justify-center shadow-lg shadow-primary/20">
              <Bot size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black text-foreground tracking-tight leading-none">ScholarAI Support</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Live Assistant</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <button className="p-3 bg-white hover:bg-gray-50 rounded-2xl text-text-secondary shadow-sm border border-black/5 transition-all">
              <History size={18} />
           </button>
           <button className="p-3 bg-white hover:bg-red-50 rounded-2xl text-red-500 shadow-sm border border-black/5 transition-all">
              <Trash2 size={18} />
           </button>
        </div>
      </header>

      {/* Main Container: Following the "Profile/Messages" card style */}
      <main className="flex-1 max-w-5xl w-full mx-auto overflow-hidden flex flex-col px-4">

        <div className="flex-1 bg-white rounded-t-sm shadow-sm border-t border-x border-black/5 overflow-hidden flex flex-col relative">

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 custom-scrollbar">

            <div className="flex justify-center mb-8">
               <div className="bg-primary-light/50 border border-primary/10 px-6 py-2 rounded-full flex items-center gap-2">
                  <Zap size={14} className="text-primary fill-primary" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Context-Aware AI Training Active</span>
               </div>
            </div>

            {historyLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                 <Loader2 className="animate-spin text-primary/30 mb-4" size={32} />
                 <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Synchronizing Encrypted Chat...</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className={`flex items-start gap-3 max-w-[80%] ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}>

                    {!msg.isUser && (
                       <div className="w-8 h-8 bg-primary-light text-primary rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-1 shadow-sm">
                          <Bot size={16} />
                       </div>
                    )}

                    <div className="group relative">
                      <div className={`px-5 py-3 rounded-[24px] shadow-sm border text-sm leading-relaxed font-medium transition-all ${
                        msg.isUser
                        ? 'bg-gradient-to-br from-primary to-[#1F6F66] text-white border-transparent'
                        : 'bg-white text-foreground border-black/5'
                      }`}>
                         {msg.text}
                      </div>

                      {/* Meta under bubble */}
                      <div className={`flex items-center gap-1.5 mt-2 px-1 text-[9px] font-bold text-text-secondary uppercase tracking-widest ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                         <span>{msg.time}</span>
                         {msg.isUser && <CheckCheck size={12} className="text-primary" />}
                      </div>
                    </div>

                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex items-start gap-3">
                 <div className="w-8 h-8 bg-primary text-white flex items-center justify-center rounded-xl shadow-md animate-bounce">
                    <Bot size={16} />
                 </div>
                 <div className="bg-gray-50 border border-black/5 px-5 py-3 rounded-[22px] rounded-tl-none shadow-sm flex items-center gap-3">
                    <div className="flex gap-1">
                       <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
                       <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                       <span className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">AI is matching criteria...</span>
                 </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area: Floating Style inside card */}
          <div className="p-6 bg-white border-t border-gray-50">
             <div className="max-w-3xl mx-auto relative group">
                <form
                  onSubmit={handleSend}
                  className="flex items-center gap-3 bg-gray-50 border border-gray-100 p-2 rounded-xl focus-within:ring-4 focus-within:ring-primary/5 focus-within:border-primary/20 transition-all shadow-inner"
                >
                   <button type="button" className="p-3 text-text-secondary hover:text-primary transition-colors">
                      <MessageSquare size={20} />
                   </button>

                   <input
                     type="text"
                     placeholder="Ask about MEXT, Commonwealth, or your SOP..."
                     className="flex-1 bg-transparent border-none py-3 px-2 text-sm outline-none text-foreground placeholder:text-gray-400 font-medium"
                     value={inputText}
                     onChange={(e) => setInputText(e.target.value)}
                   />

                   <button
                     type="submit"
                     disabled={!inputText.trim() || loading}
                     className="bg-primary text-white p-4 rounded-lg shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                   >
                      <Send size={20} />
                   </button>
                </form>

                <div className="mt-4 flex justify-between items-center px-2">
                   <div className="flex items-center gap-4">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                         <Info size={12} />
                         End-to-End Encrypted
                      </p>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                         <Sparkles size={12} className="text-amber-500" />
                         Premium NLP
                      </p>
                   </div>
                   <p className="text-[9px] font-black text-primary uppercase tracking-widest">
                      v2.4.0-Live
                   </p>
                </div>
             </div>
          </div>

        </div>

        {/* Small Disclaimer */}
        <p className="text-[9px] text-center text-text-secondary/50 mt-4 font-bold uppercase tracking-widest">
           ScholarAI can provide outdated info. Always check official embassy websites for deadline accuracy.
        </p>
      </main>

    </div>
  );
}
