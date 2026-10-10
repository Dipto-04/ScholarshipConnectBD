"use client";

import React, { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { Recommendation, User } from '@/types';
import Link from 'next/link';
import { Brain, Sparkles, ArrowRight, ShieldCheck, MapPin, GraduationCap, Bot, ChevronRight, SearchX } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function MatchmakerPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadMatches();
    }
  }, [user, authLoading, router]);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const res = await apiService.getScholarshipMatches();
      if (res.ok && res.data) {
        // Fix: API returns { recommendations: [], profile_summary: ... }
        const recommendations = (res.data as any).recommendations || [];
        setMatches(recommendations);
      }
    } catch (error) {
      console.error('Failed to get matches', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartMatching = async () => {
    setMatching(true);
    // Artificial delay for "matching" feel as in original web version
    await new Promise(r => setTimeout(r, 2000));
    await loadMatches();
    setMatching(false);
  };

  if (authLoading || !user) return null;

  if (loading && !matching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-slate-500 font-medium tracking-tight">Analyzing your profile with AI...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-10 lg:py-16">
        <div className="bg-white border border-slate-200 rounded-sm p-8 md:p-12 shadow-sm">

          {/* Header Section */}
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-50">
            <button onClick={() => router.back()} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Matchmaker</h1>
          </div>

          {matching ? (
            <div className="text-center py-24 space-y-8">
               <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <Bot className="absolute inset-0 m-auto text-primary" size={40} />
               </div>
               <div className="space-y-3">
                  <p className="font-bold text-slate-900 text-xl animate-pulse tracking-tight">Analyzing your profile...</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Scanning database for compatibility</p>
               </div>
            </div>
          ) : matches.length === 0 ? (
            <div className="space-y-10">
              {/* AI Banner - Mobile Style */}
              <div className="flex items-center bg-primary-light p-8 rounded-lg border border-primary/10">
                <div className="text-primary p-4 bg-white rounded-xl shadow-sm shrink-0">
                  <Bot size={32} />
                </div>
                <div className="ml-6 flex-1">
                  <h2 className="text-lg font-bold text-primary">Smart Suggestions</h2>
                  {!user?.is_pro ? (
                    <Link href="/upgrade-pro" className="text-sm text-red-600 font-bold hover:underline block mt-1">
                      PRO FEATURE: Upgrade for 100% precision matching & hidden opportunities.
                    </Link>
                  ) : (
                    <p className="text-sm text-primary/80 block mt-1 font-medium">NLP model is currently analyzing your deep profile.</p>
                  )}
                </div>
              </div>

              <div className="text-center py-12 border border-slate-100 border-dashed rounded-lg bg-slate-50/30">
                <SearchX size={48} className="text-slate-300 mx-auto mb-6" />
                <h3 className="font-bold text-slate-900 text-xl mb-2">No matches found yet</h3>
                <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto mb-8">Try updating your profile details to get better AI recommendations or start a new scan.</p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleStartMatching}
                    className="bg-primary text-white px-10 py-4 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    <Sparkles size={18} />
                    Start AI Matching
                  </button>
                  <Link
                    href="/profile"
                    className="border border-slate-200 text-slate-700 px-10 py-4 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center"
                  >
                    Update Profile
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* AI Banner - Mobile Style */}
              <div className="flex items-center bg-primary-light p-8 rounded-lg border border-primary/10 mb-10">
                <div className="text-primary p-4 bg-white rounded-xl shadow-sm shrink-0">
                  <Bot size={32} />
                </div>
                <div className="ml-6 flex-1">
                  <h2 className="text-lg font-bold text-primary">Smart Suggestions</h2>
                  {!user?.is_pro ? (
                    <Link href="/upgrade-pro" className="text-sm text-red-600 font-bold hover:underline block mt-1">
                      PRO FEATURE: Upgrade for 100% precision matching & hidden opportunities.
                    </Link>
                  ) : (
                    <p className="text-sm text-primary/80 block mt-1 font-medium">NLP model is currently analyzing your deep profile.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Top Recommendations</h3>
                <button onClick={handleStartMatching} className="text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:underline">Re-scan database</button>
              </div>

              <div className="grid gap-6">
                {matches.map((item, index) => (
                  <Link
                    key={item.scholarship.id}
                    href={`/scholarships/${item.scholarship.id}`}
                    className="group bg-white p-6 rounded-lg border border-slate-100 hover:border-primary/30 transition-all shadow-sm block relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-2">
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-lg border border-emerald-100 uppercase tracking-widest">
                          {item.match_score}% Match
                        </span>
                        {index === 0 && (
                          <span className="bg-primary text-white text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest shadow-lg shadow-primary/20">
                            Best Fit
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors tracking-tight">{item.scholarship.title}</h4>
                        <p className="text-sm text-slate-500 mb-6 font-medium">{item.scholarship.provider}</p>

                        <div className="flex gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-80">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-primary" />
                            {item.scholarship.country}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <GraduationCap size={14} className="text-primary" />
                            {item.scholarship.level}
                          </div>
                        </div>
                      </div>
                      <div className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0">
                        <ChevronRight size={24} />
                      </div>
                    </div>

                    {/* Match Score Bar - Mobile Style */}
                    <div className="h-1 bg-slate-50 rounded-full mt-8 overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-1000 ease-out"
                        style={{ width: `${item.match_score}%` }}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const ArrowLeft = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);
