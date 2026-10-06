"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Lock, Mail, ArrowRight, Loader2, Sparkles, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/home');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/home');
    } catch (err: any) {
      setError(err.message || 'Google login failed.');
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side: Illustration - Now White */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden border-r border-slate-100 bg-slate-50/30">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="relative z-10 max-w-md space-y-10">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              <Sparkles size={14} />
              Welcome Back
           </div>

           <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Your journey <br/>continues <span className="text-primary underline decoration-primary/20 underline-offset-8">here</span>.
           </h1>

           <p className="text-slate-500 text-lg leading-relaxed font-medium">
              Access your personalized dashboard, track applications, and connect with mentors.
           </p>

           <div className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm relative overflow-hidden group">
              <p className="italic text-slate-600 text-sm leading-relaxed relative z-10">
                "The ScholarAI matchmaker helped me find the perfect scholarship for my Master's in Germany! The process was so much easier than I expected."
              </p>
              <div className="mt-6 flex items-center gap-3 relative z-10">
                 <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center text-primary font-bold text-xs">A</div>
                 <div>
                    <p className="font-bold text-slate-900 text-xs">— Ahmed</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">MEXT Scholar</p>
                 </div>
              </div>
              <GraduationCap size={120} className="absolute -bottom-8 -right-8 text-slate-50 group-hover:text-primary/5 transition-colors duration-500" />
           </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <Link href="/" className="inline-flex items-center gap-2 mb-8 lg:mb-12">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-primary/20">S</div>
              <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900">ScholarshipConnect<span className="text-primary">BD</span></span>
            </Link>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Sign In</h2>
            <p className="text-slate-500 mt-2 font-medium text-sm sm:text-base">Enter your details to access your account.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-6 border border-red-100 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                <Link href="/forgot-password" title="Forgot Password?" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  Sign In
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-slate-400"><span className="bg-white px-4">Or continue with</span></div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4">
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-3 bg-white border border-slate-200 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 text-slate-700"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Google
            </button>
          </div>

          <p className="mt-12 text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
            Don't have an account? <Link href="/register" className="text-primary hover:underline">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
