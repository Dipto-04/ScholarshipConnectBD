"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Zap,
  Star,
  Users,
  ArrowRight,
  Sparkles,
  Crown,
  CheckCircle2,
  Wallet,
  Trophy
} from 'lucide-react';

const BENEFITS = [
  { title: 'Unlimited AI Tools', desc: 'SOP Helper, CV Reviewer & Live Support without daily limits.', icon: Zap, color: 'text-blue-600 bg-blue-50 border-blue-100' },
  { title: 'Priority Matching', desc: 'Be the first to know about scholarships tailored to your profile.', icon: Star, color: 'text-amber-600 bg-amber-50 border-amber-100' },
  { title: 'Verified Badge', desc: 'Stand out in the community with a gold ScholarConnect badge.', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  { title: 'Expert Consultations', desc: 'Direct access to premium mentorship sessions.', icon: Users, color: 'text-purple-600 bg-purple-50 border-purple-100' },
];

export default function UpgradeProPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  if (authLoading) return null;
  if (!user) {
    router.push('/login');
    return null;
  }

  const handlePointUpgrade = async () => {
    const cost = 200;
    const userPoints = (user as any).scholar_points || 0;

    if (userPoints < cost) {
      alert(`Insufficient Points. You need ${cost} points. You currently have ${userPoints}.`);
      return;
    }

    if (window.confirm(`Unlock Pro for ${cost} ScholarPoints?`)) {
      setProcessing(true);
      const res = await apiService.upgradeWithPoints();
      if (res.ok) {
        alert('Success! Welcome to ScholarConnect Pro.');
        router.push('/profile');
      } else {
        alert(res.data.error || 'Upgrade failed.');
      }
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10 lg:py-16">
        <div className="bg-white border border-slate-200 rounded-sm p-8 md:p-16 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-8">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary-light text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                <Crown size={14} />
                ScholarConnect Premium
             </div>
             <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">Level up your scholarship journey.</h1>
             <p className="text-slate-500 font-medium text-lg leading-relaxed">Unlock exclusive tools and priority support to secure your international education dreams.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
             {/* Benefits */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {BENEFITS.map((benefit, i) => (
                  <div key={i} className={`p-8 border rounded-lg space-y-6 hover:shadow-xl transition-all bg-white group ${benefit.color}`}>
                     <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-white shadow-sm group-hover:scale-110 transition-transform`}>
                        <benefit.icon size={24} />
                     </div>
                     <div className="space-y-2">
                        <h3 className="font-bold text-slate-900">{benefit.title}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">{benefit.desc}</p>
                     </div>
                  </div>
                ))}
             </div>

             {/* Pricing/Upgrade Options */}
             <div className="space-y-8">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Choose your plan</h2>

                {/* Option 1: ScholarPoints */}
                <div className={`border-[3px] rounded-lg p-10 transition-all relative overflow-hidden bg-slate-50/50 ${((user as any).scholar_points || 0) >= 200 ? 'border-primary' : 'border-slate-100 opacity-60'}`}>
                   <div className="relative z-10 flex justify-between items-start">
                      <div className="space-y-6">
                         <div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Community Special</p>
                            <h3 className="text-3xl font-black text-slate-900">200 Points</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">7 Days Pro Access</p>
                         </div>
                         <div className="space-y-2">
                            <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                               <CheckCircle2 size={16} className="text-emerald-500" />
                               Current Balance: {(user as any).scholar_points || 0} pts
                            </p>
                         </div>
                         <button
                           onClick={handlePointUpgrade}
                           disabled={processing || ((user as any).scholar_points || 0) < 200}
                           className="w-full sm:w-auto px-10 py-4 bg-primary text-white rounded-lg font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all disabled:bg-slate-200 shadow-xl shadow-primary/20"
                         >
                           Redeem Points
                         </button>
                      </div>
                      <Trophy size={64} className="text-yellow-400 opacity-50" />
                   </div>
                   <Sparkles size={150} className="absolute -bottom-10 -right-10 text-primary opacity-5 pointer-events-none" />
                </div>

                {/* Option 2: Cash Payment */}
                <div className="border-[3px] border-primary-light rounded-lg p-10 text-slate-900 relative overflow-hidden bg-white shadow-2xl shadow-slate-200">
                   <div className="relative z-10 flex justify-between items-start">
                      <div className="space-y-6">
                         <div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Instant Access</p>
                            <h3 className="text-3xl font-black text-slate-900">500 BDT</h3>
                            <p className="text-xs text-slate-400 font-black uppercase tracking-wider mt-1">30 Days Pro Access</p>
                         </div>
                         <div className="space-y-2">
                            <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
                               <CheckCircle2 size={16} className="text-emerald-500" />
                               SSLCommerz Secure Payment
                            </p>
                         </div>
                         <Link
                           href="/checkout"
                           className="inline-block px-12 py-5 bg-primary text-white rounded-lg font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                         >
                           Upgrade Now
                           <ArrowRight size={18} className="inline ml-3" />
                         </Link>
                      </div>
                      <Wallet size={64} className="text-slate-100" />
                   </div>
                   <Crown size={200} className="absolute -bottom-16 -right-16 text-slate-50 pointer-events-none rotate-12" />
                </div>

                <p className="text-[10px] text-center text-slate-400 font-black uppercase tracking-[0.2em] pt-6">
                   Secure 256-bit encryption. SSLCommerz Verified.
                </p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
