"use client";

import React, { useState } from 'react';
import { Bot, FileText, Search, Sparkles, Wand2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AIToolsPage() {
  const tools = [
    {
      title: 'AI Matchmaker',
      desc: 'Get personalized scholarship recommendations based on your unique academic profile using NLP.',
      icon: Search,
      path: '/scholarships/matchmaker',
      color: 'bg-teal-50 text-teal-600',
      badge: 'Popular'
    },
    {
      title: 'SOP Generator',
      desc: 'Draft high-quality Statement of Purpose tailored to specific scholarship requirements.',
      icon: FileText,
      path: '/ai-tools/sop-writer',
      color: 'bg-purple-50 text-purple-600',
      badge: 'Pro'
    },
    {
      title: 'CV Reviewer',
      desc: 'Upload your CV and get instant feedback on how to optimize it for global academic standards.',
      icon: Wand2,
      path: '/ai-tools/cv-reviewer',
      color: 'bg-amber-50 text-amber-600',
      badge: 'Pro'
    },
    {
      title: 'Eligibility Checker',
      desc: 'Instantly check if you meet the criteria for any scholarship in our database.',
      icon: Sparkles,
      path: '/ai-tools/eligibility',
      color: 'bg-blue-50 text-blue-600',
      badge: 'Free'
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-white border-b border-gray-100 px-6 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="w-16 h-16 bg-primary-light text-primary rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-sm">
            <Bot size={32} />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-foreground mb-4">Scholar<span className="text-primary">AI</span> Suite</h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
            Leverage advanced AI models (Gemini/Groq) to simplify your application process and increase your success rate.
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tools.map((tool, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-[40px] shadow-sm border border-black/5 hover:shadow-2xl hover:-translate-y-1 transition-all group flex flex-col"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${tool.color}`}>
                  <tool.icon size={28} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                  tool.badge === 'Pro' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tool.badge}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                {tool.title}
              </h3>
              <p className="text-text-secondary leading-relaxed mb-8 flex-1">
                {tool.desc}
              </p>

              <Link
                href={tool.path}
                className="flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all"
              >
                Launch Tool
                <ArrowRight size={20} />
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-br from-primary to-[#1F6F66] rounded-[48px] p-12 text-white text-center relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
           <h2 className="text-3xl font-bold mb-6 relative z-10">Unlock the Full Power of ScholarAI</h2>
           <p className="text-white/80 max-w-xl mx-auto mb-10 relative z-10">
              Upgrade to Pro to get unlimited access to all AI tools, including professional SOP drafting and personalized CV reviews.
           </p>
           <Link href="/upgrade-pro" className="inline-block bg-white text-primary px-10 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-transform relative z-10">
              Upgrade to Pro Now
           </Link>
        </div>
      </main>
    </div>
  );
}
