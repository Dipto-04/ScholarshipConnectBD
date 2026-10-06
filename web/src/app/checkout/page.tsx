"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import {
  CreditCard,
  Smartphone,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const [method, setMethod] = useState('bkash');
  const [processing, setProcessing] = useState(false);

  const handlePayment = () => {
    setProcessing(true);
    // Simulate payment gateway redirect
    setTimeout(() => {
      alert('Redirecting to SSLCommerz Gateway...');
      router.push('/profile');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-10 lg:py-16">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-black uppercase tracking-widest mb-12"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Order Summary */}
            <div className="space-y-10">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Order Summary</h1>
                  <p className="text-slate-500 text-sm font-medium">Review your subscription upgrade details.</p>
                </div>

                <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-10 space-y-8">
                  <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-lg">ScholarConnect Pro</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">30 Days Membership</p>
                      </div>
                      <span className="font-black text-slate-900 text-xl tracking-tighter">500 BDT</span>
                  </div>

                  <div className="h-px bg-slate-200"></div>

                  <div className="space-y-4">
                      {['Priority AI Tools Access', 'Unlimited SOP/CV Checks', 'Golden Verified Badge', 'Direct Mentor Chat'].map(feat => (
                        <div key={feat} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                            <CheckCircle2 size={18} className="text-emerald-500" />
                            {feat}
                        </div>
                      ))}
                  </div>

                  <div className="h-px bg-slate-200"></div>

                  <div className="flex justify-between items-center pt-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Payable Amount</span>
                      <span className="text-3xl font-black text-primary underline decoration-primary/10 decoration-8 underline-offset-8">500 BDT</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Lock size={18} />
                  SSLCommerz Secure 256-bit Transaction
                </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-10">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select Payment Gateway</h2>

                <div className="space-y-4">
                  {[
                    { id: 'bkash', name: 'bKash Checkout', icon: Smartphone, color: 'text-pink-600', sub: 'Fast & Secure' },
                    { id: 'nagad', name: 'Nagad Pay', icon: Smartphone, color: 'text-orange-600', sub: 'Popular Choice' },
                    { id: 'card', name: 'Debit / Credit Card', icon: CreditCard, color: 'text-blue-600', sub: 'All Banks Accepted' }
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={`w-full flex items-center justify-between p-6 border rounded-[1.5rem] transition-all group ${
                        method === m.id ? 'border-primary ring-4 ring-primary/5 bg-slate-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${m.color}`}>
                              <m.icon size={24} />
                          </div>
                          <div className="text-left">
                              <p className="font-bold text-slate-900 text-sm">{m.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{m.sub}</p>
                          </div>
                        </div>
                        {method === m.id && <CheckCircle2 size={24} className="text-primary" />}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-slate-300 disabled:opacity-50"
                >
                  {processing ? 'Connecting Gateway...' : 'Secure Checkout'}
                  <ArrowRight size={20} />
                </button>

                <div className="flex justify-center gap-6 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all pt-6">
                  <img src="https://securepay.sslcommerz.com/gw/images/brand-name/visa.png" className="h-6" alt="Visa" />
                  <img src="https://securepay.sslcommerz.com/gw/images/brand-name/mastercard.png" className="h-6" alt="Master" />
                  <img src="https://securepay.sslcommerz.com/gw/images/brand-name/bkash.png" className="h-6" alt="bKash" />
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
