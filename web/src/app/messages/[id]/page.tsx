"use client";

import React, { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import {
  ArrowLeft,
  Send,
  User,
  ShieldCheck,
  MoreVertical,
  Paperclip,
  Image as ImageIcon
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ChatDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState([
    { id: 1, role: 'other', content: 'I have reviewed your SOP. Let me know when you are free for a call.', time: '10:45 AM' },
    { id: 2, role: 'user', content: 'Thank you! I am free tomorrow evening.', time: '11:00 AM' },
    { id: 3, role: 'other', content: 'Tomorrow at 7 PM sounds good. I will send a session request.', time: '11:05 AM' }
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages([...messages, {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button onClick={() => router.push('/messages')} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                 <ArrowLeft size={20} className="text-slate-400" />
              </button>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold">
                    S
                 </div>
                 <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                       Sabbir Ahmed
                       <ShieldCheck size={14} className="text-primary" />
                    </h2>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Online</p>
                 </div>
              </div>
           </div>

           <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
              <MoreVertical size={20} />
           </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-hide bg-slate-50/20">
           {messages.map((msg) => (
             <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] space-y-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                   <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                     msg.role === 'user'
                     ? 'bg-primary text-white font-medium rounded-tr-none shadow-sm'
                     : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm'
                   }`}>
                      {msg.content}
                   </div>
                   <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest px-1">{msg.time}</p>
                </div>
             </div>
           ))}
        </div>

        {/* Input */}
        <div className="p-6 bg-white border-t border-slate-100">
           <form onSubmit={handleSend} className="flex items-center gap-4">
              <div className="flex gap-2">
                 <button type="button" className="p-3 text-slate-400 hover:text-primary hover:bg-primary-light rounded-xl transition-all">
                    <Paperclip size={20} />
                 </button>
              </div>
              <div className="flex-1 relative">
                 <input
                   type="text"
                   placeholder="Type your message..."
                   className="w-full pl-6 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                 />
                 <button
                   type="submit"
                   disabled={!input.trim()}
                   className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                 >
                    <Send size={18} />
                 </button>
              </div>
           </form>
        </div>
      </main>
    </div>
  );
}
