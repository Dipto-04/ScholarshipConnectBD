"use client";

import React from 'react';
import Header from '@/components/Header';
import {
  BookOpen,
  HelpCircle,
  Search,
  Cpu,
  Users,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ManualPage() {
  const router = useRouter();
  const sections = [
    { title: 'Getting Started', icon: BookOpen, sub: 'Registration and profile setup' },
    { title: 'Scholarship Search', icon: Search, sub: 'How to use filters and search effectively' },
    { title: 'Using AI Tools', icon: Cpu, sub: 'Matchmaker, SOP Helper and Eligibility Checker' },
    { title: 'Mentorship', icon: Users, sub: 'Booking sessions and chatting with mentors' },
    { title: 'Payments & Points', icon: CreditCard, sub: 'Upgrading to Pro and earning ScholarPoints' },
    { title: 'Data Security', icon: ShieldCheck, sub: 'Managing your Doc Vault' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10 lg:py-16">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-black uppercase tracking-widest mb-12"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>

          <header className="text-center max-w-2xl mx-auto mb-20">
            <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-8 border border-blue-100 shadow-sm">
               <HelpCircle size={32} />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">User Manual</h1>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">Everything you need to know about navigating and using ScholarConnectBD effectively.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {sections.map((sec, i) => (
              <div key={i} className="flex items-center justify-between p-8 border border-slate-100 rounded-[2rem] hover:border-primary/30 transition-all cursor-pointer group bg-slate-50/20 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all shadow-sm">
                        <sec.icon size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 leading-tight mb-1">{sec.title}</h4>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{sec.sub}</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>

          <div className="border-[3px] border-slate-900 rounded-[3rem] p-12 md:p-20 text-center text-slate-900 relative overflow-hidden bg-white">
            <div className="relative z-10 space-y-8">
              <h3 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">Still having trouble?</h3>
              <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto">Our specialized support team is available 24/7 to answer your specific technical or academic questions.</p>
              <Link href="/ai-tools/support-bot" className="inline-block px-12 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-300">
                Chat with Support
              </Link>
            </div>
            <div className="absolute top-0 left-0 w-80 h-80 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-slate-100 text-center">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">ScholarshipConnectBD documentation</p>
      </footer>
    </div>
  );
}
