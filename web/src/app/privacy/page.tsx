"use client";

import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { Shield, Lock, Eye, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-10 lg:py-16">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-16 shadow-sm">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-black uppercase tracking-widest mb-12"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>

          <header className="mb-20">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">Privacy Policy</h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">Last updated: June 20, 2024</p>
          </header>

          <div className="space-y-16 text-slate-600 leading-relaxed max-w-3xl">
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shadow-sm"><Shield size={22} /></div>
                  1. Information Collection
                </h2>
                <p className="text-base font-medium">
                  We collect information you provide directly to us when you create an account, fill out your profile, or use our AI tools. This includes your name, email address, academic history, and any documents you upload to your secure Vault.
                </p>
            </section>

            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm"><Eye size={22} /></div>
                  2. Usage of Data
                </h2>
                <p className="text-base font-medium">
                  We use the information to provide, maintain, and improve our services, including our ScholarAI matching algorithms. We do not sell your personal data to third parties. Your data is used solely to help you find and apply for scholarships.
                </p>
            </section>

            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm"><Lock size={22} /></div>
                  3. Security Protocols
                </h2>
                <p className="text-base font-medium">
                  We implement industry-standard security measures, including end-to-end encryption for document storage and secure authentication via Firebase. All sensitive files in the Doc Vault are encrypted using AES-256 standards.
                </p>
            </section>

            <section className="p-10 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-6">
                <h3 className="font-bold text-slate-900 text-lg">Questions about your data?</h3>
                <p className="text-sm text-slate-500 font-medium">If you have any questions or requests regarding your personal information, please reach out to our privacy officer.</p>
                <Link href="/ai-tools/support-bot" className="inline-flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest hover:underline pt-2">
                  Contact Support →
                </Link>
            </section>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-slate-100 text-center">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">ScholarshipConnectBD legal center</p>
      </footer>
    </div>
  );
}
