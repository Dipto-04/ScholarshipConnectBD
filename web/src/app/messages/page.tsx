"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/lib/api';
import {
  Search,
  Send,
  Image as ImageIcon,
  MoreVertical,
  Phone,
  Video,
  Info,
  Check,
  CheckCheck,
  Smile,
  Trash2,
  Edit3,
  CornerUpLeft,
  Paperclip
} from 'lucide-react';

interface Message {
  id: number;
  senderId: number;
  text: string;
  time: string;
  isRead: boolean;
  reactions: string[];
  isEdited?: boolean;
}

interface ChatSession {
  id: number;
  name: string;
  lastMsg: string;
  time: string;
  avatar: string;
  online: boolean;
  unreadCount?: number;
  role?: string;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showReactionPicker, setShowReactionPicker] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Professional Reactions List (LinkedIn Style)
  const professionalReactions = [
    { emoji: '👍', name: 'Like' },
    { emoji: '👏', name: 'Celebrate' },
    { emoji: '❤️', name: 'Support' },
    { emoji: '💡', name: 'Insightful' },
    { emoji: '🤔', name: 'Curious' }
  ];

  useEffect(() => {
    // Premium Mock Conversations
    setConversations([
      { id: 1, name: 'Yeasin Arafat Nayem', lastMsg: 'I have checked your SOP. Looks excellent!', time: '10:45 AM', avatar: 'YN', online: true, role: 'Team Leader / Mentor', unreadCount: 1 },
      { id: 2, name: 'S.M. Azman Sikder', lastMsg: 'Did you submit the MEXT application forms?', time: 'Yesterday', avatar: 'AS', online: false, role: 'Backend Expert' },
      { id: 3, name: 'Jahid Tanvir', lastMsg: 'Please attend the sync session tomorrow at BUBT.', time: 'Monday', avatar: 'JT', online: true, role: 'Lecturer & Supervisor' },
    ]);

    // Initial Messages for Selected Chat
    setMessages([
      { id: 1, senderId: 2, text: "Hello! Welcome to the premium chat suite.", time: "10:30 AM", isRead: true, reactions: ['👍'] },
      { id: 2, senderId: 1, text: "Hi! I saw your recent application for the MEXT scholarship. Do you need any help with the research plan?", time: "10:32 AM", isRead: true, reactions: [] },
      { id: 3, senderId: 999, text: "Yes, that would be great! I'm struggling with the field of study section.", time: "10:35 AM", isRead: true, reactions: ['💡'] },
      { id: 4, senderId: 1, text: "Don't worry. I have a sample plan that worked for me. I'll send it over right now.", time: "10:45 AM", isRead: false, reactions: [] },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMsg: Message = {
      id: Date.now(),
      senderId: 999, // Current User Id Mock
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      reactions: []
    };

    setMessages([...messages, newMsg]);
    setMessage('');
  };

  const handleAddReaction = (msgId: number, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        const reactions = m.reactions.includes(emoji)
          ? m.reactions.filter(r => r !== emoji)
          : [...m.reactions, emoji];
        return { ...m, reactions };
      }
      return m;
    }));
    setShowReactionPicker(null);
  };

  const handleDeleteMessage = (msgId: number) => {
    setMessages(prev => prev.filter(m => m.id !== msgId));
  };

  return (
    <div className="h-[calc(100vh-68px)] bg-background flex overflow-hidden">

      {/* Sidebar: Conversation Hub */}
      <div className="w-full md:w-96 bg-white border-r border-gray-100 flex flex-col h-full shrink-0">
        <div className="p-6 border-b border-gray-50 bg-white">
           <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-black text-foreground tracking-tight">Messages</h1>
              <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                 3 Active
              </span>
           </div>
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search scholars, mentors..."
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400 font-medium"
              />
           </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-white">
           {conversations.map((chat) => (
             <div
               key={chat.id}
               onClick={() => setSelectedChat(chat)}
               className={`p-4 flex items-center gap-4 cursor-pointer transition-all rounded-[24px] relative ${
                 selectedChat?.id === chat.id
                   ? 'bg-gradient-to-r from-primary-light/50 to-primary-light/10 text-primary shadow-sm'
                   : 'hover:bg-gray-50/80 text-foreground'
               }`}
             >
                <div className="relative shrink-0">
                   <div className="w-13 h-13 bg-primary text-white rounded-[20px] flex items-center justify-center font-bold text-lg shadow-md shadow-primary/10">
                      {chat.avatar}
                   </div>
                   {chat.online && (
                     <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-white rounded-full"></span>
                   )}
                </div>

                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-sm truncate text-foreground">{chat.name}</h3>
                      <span className="text-[10px] text-text-secondary font-medium shrink-0">{chat.time}</span>
                   </div>
                   <p className="text-xs text-text-secondary truncate font-medium">
                      {chat.lastMsg}
                   </p>
                   {chat.role && (
                     <span className="text-[9px] font-bold text-primary/70 uppercase tracking-wider block mt-1">
                        {chat.role}
                     </span>
                   )}
                </div>

                {chat.unreadCount && selectedChat?.id !== chat.id && (
                  <span className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-black absolute right-4 top-1/2 -translate-y-1/2">
                     {chat.unreadCount}
                  </span>
                )}
             </div>
           ))}
        </div>
      </div>

      {/* Main Premium Chat Suite */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col h-full bg-[#F8F2E7]/40 relative">

           {/* Chat Header */}
           <div className="p-4 px-6 bg-white border-b border-gray-100 flex justify-between items-center shadow-sm relative z-10">
              <div className="flex items-center gap-4">
                 <div className="relative">
                    <div className="w-11 h-11 bg-primary text-white rounded-xl flex items-center justify-center font-bold shadow-md shadow-primary/10">
                       {selectedChat.avatar}
                    </div>
                    {selectedChat.online && (
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                 </div>
                 <div>
                    <h2 className="font-bold text-sm text-foreground leading-tight">{selectedChat.name}</h2>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">
                       {selectedChat.online ? 'Online' : 'Offline'}
                    </p>
                 </div>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                 <button className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors"><Phone size={18} /></button>
                 <button className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors"><Video size={18} /></button>
                 <button className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors"><Info size={18} /></button>
              </div>
           </div>

           {/* Message History View */}
           <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex justify-center">
                 <span className="text-[10px] font-black text-primary bg-primary-light px-4 py-1.5 rounded-full uppercase tracking-widest border border-primary/5">
                    Session Timestamps Grouped
                 </span>
              </div>

              <div className="flex flex-col gap-4">
                 {messages.map((msg) => {
                   const isMe = msg.senderId === 999;
                   return (
                     <div
                       key={msg.id}
                       className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
                     >
                       <div className={`flex items-end gap-2 max-w-[75%] relative`}>

                         {/* Avatar for received messages */}
                         {!isMe && (
                           <div className="w-7 h-7 bg-primary-light text-primary rounded-lg flex items-center justify-center text-[10px] font-bold shadow-sm shrink-0 mb-1">
                              {selectedChat.avatar}
                           </div>
                         )}

                         {/* Chat Bubble with Teal Gradient for User */}
                         <div className="relative group">
                           <div className={`p-4 rounded-[24px] shadow-sm border ${
                             isMe
                               ? 'bg-gradient-to-br from-primary to-[#1F6F66] text-white rounded-tr-none border-transparent'
                               : 'bg-white text-foreground rounded-tl-none border-black/5'
                           } text-sm leading-relaxed font-medium transition-all`}>
                              {msg.text}
                           </div>

                           {/* Professional Reactions Display */}
                           {msg.reactions.length > 0 && (
                             <div className={`absolute -bottom-3 ${isMe ? 'right-2' : 'left-2'} bg-white border border-gray-100 rounded-full px-2 py-0.5 shadow-md flex items-center gap-1 text-xs cursor-pointer z-10`}>
                               {msg.reactions.map((r, i) => <span key={i}>{r}</span>)}
                               <span className="text-[9px] font-bold text-gray-400 px-0.5">{msg.reactions.length}</span>
                             </div>
                           )}

                           {/* Hover Action Sheet (Reaction Picker trigger, Delete, Edit) */}
                           <div className={`absolute top-1/2 -translate-y-1/2 ${isMe ? '-left-24 flex-row-reverse' : '-right-24'} hidden group-hover:flex items-center gap-1 bg-white p-1 rounded-xl shadow-lg border border-gray-100 z-20`}>
                             <button
                               onClick={() => setShowReactionPicker(showReactionPicker === msg.id ? null : msg.id)}
                               className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-primary transition-colors"
                             >
                               <Smile size={14} />
                             </button>
                             {isMe && (
                               <button
                                 onClick={() => handleDeleteMessage(msg.id)}
                                 className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                               >
                                 <Trash2 size={14} />
                               </button>
                             )}
                             <button className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-primary transition-colors">
                               <CornerUpLeft size={14} />
                             </button>
                           </div>

                           {/* LinkedIn Style Inline Reaction Picker Popup */}
                           {showReactionPicker === msg.id && (
                             <div className={`absolute -top-12 ${isMe ? 'right-0' : 'left-0'} bg-white border border-gray-100 rounded-2xl p-2 shadow-xl flex gap-2 animate-in fade-in slide-in-from-bottom-2 z-30`}>
                               {professionalReactions.map((reaction) => (
                                 <button
                                   key={reaction.name}
                                   onClick={() => handleAddReaction(msg.id, reaction.emoji)}
                                   className="text-lg hover:scale-130 transition-transform block"
                                   title={reaction.name}
                                 >
                                   {reaction.emoji}
                                 </button>
                               ))}
                             </div>
                           )}

                         </div>
                       </div>

                       {/* Message Meta Info below bubble */}
                       <div className={`flex items-center gap-1.5 mt-1.5 ${isMe ? 'mr-1' : 'ml-10'} text-[10px] text-text-secondary font-bold uppercase tracking-wider`}>
                          <span>{msg.time}</span>
                          {isMe && (
                            msg.isRead ? <CheckCheck size={12} className="text-primary" /> : <Check size={12} />
                          )}
                       </div>

                     </div>
                   );
                 })}
                 <div ref={messagesEndRef} />
              </div>
           </div>

           {/* Modern Premium Message Input Area */}
           <div className="p-5 bg-white border-t border-gray-100/80 sticky bottom-0">
              <div className="flex items-center gap-3 max-w-4xl mx-auto bg-gray-50 p-2 rounded-[24px] border border-gray-100">
                 <div className="flex gap-1">
                   <button className="p-3 text-text-secondary hover:text-primary rounded-xl hover:bg-white transition-all">
                      <ImageIcon size={20} />
                   </button>
                   <button className="p-3 text-text-secondary hover:text-primary rounded-xl hover:bg-white transition-all">
                      <Paperclip size={20} />
                   </button>
                 </div>
                 <input
                   type="text"
                   placeholder="Type a premium chat message..."
                   className="flex-1 bg-transparent border-none py-3 px-2 text-sm outline-none text-foreground placeholder:text-gray-400 font-medium"
                   value={message}
                   onChange={(e) => setMessage(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                 />
                 <button
                   onClick={handleSendMessage}
                   className="p-3.5 bg-gradient-to-br from-primary to-[#1F6F66] text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                 >
                    <Send size={18} />
                 </button>
              </div>
           </div>

        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-[#F8F2E7]/20">
           <div className="text-center max-w-sm px-6">
              <div className="w-24 h-24 bg-white rounded-[36px] shadow-sm border border-black/5 flex items-center justify-center mx-auto mb-6 text-primary animate-bounce">
                 <Send size={36} className="rotate-12" />
              </div>
              <h3 className="text-2xl font-black text-foreground tracking-tight mb-2">Advanced Messenger</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                 Select a verified scholar, global mentor, or administrator from the left hub to begin structured, context-prefilled dialogue.
              </p>
           </div>
        </div>
      )}
    </div>
  );
}
