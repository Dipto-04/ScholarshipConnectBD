"use client";

import React from 'react';
import Header from '@/components/Header';
import { FileText, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TermsPage() {
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
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">Terms of Service</h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">Agreement for ScholarConnectBD Users</p>
          </header>

          <div className="space-y-16 text-slate-600 leading-relaxed max-w-3xl">
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shadow-sm"><CheckCircle size={22} /></div>
                  1. Acceptance
                </h2>
                <p className="text-base font-medium">
                  By accessing or using ScholarshipConnectBD, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this site.
                </p>
            </section>

            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm"><FileText size={22} /></div>
                  2. Responsibility
                </h2>
                <p className="text-base font-medium">
                  You are responsible for maintaining the confidentiality of your account and password. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate.
                </p>
            </section>

            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shadow-sm"><AlertCircle size={22} /></div>
                  3. Liability
                </h2>
                <p className="text-base font-medium">
                  ScholarshipConnectBD provides information about scholarships but does not guarantee the success of any application. We are not responsible for the accuracy of scholarship information provided by third-party institutions.
                </p>
            </section>

            <div className="border border-slate-200 rounded-[2rem] p-10 text-center space-y-6 bg-slate-50/50 shadow-sm">
                <h3 className="font-bold text-slate-900 text-lg">Need further clarification?</h3>
                <p className="text-sm text-slate-500 font-medium">Our legal team is here to help you understand your rights and responsibilities on the platform.</p>
                <button className="bg-slate-900 text-white px-10 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                  Contact Legal Team
                </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-slate-100 text-center">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">ScholarshipConnectBD legal center</p>
      </footer>
    </div>
  );
}
