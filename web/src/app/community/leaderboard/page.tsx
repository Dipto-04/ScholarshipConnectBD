"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { Trophy, Award, Star, ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await apiService.getLeaderboard();
        if (res.ok) {
          setLeaderboard(res.data as any[]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <header className="text-center mb-16">
          <div className="w-16 h-16 bg-yellow-400 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-yellow-400/20 rotate-3">
             <Trophy size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Community Leaderboard</h1>
          <p className="text-slate-500 max-w-md mx-auto text-sm">Celebrating our top contributors and successful scholars.</p>
        </header>

        {loading ? (
          <div className="space-y-4">
             {[1, 2, 3, 4, 5].map(i => (
               <div key={i} className="h-24 bg-white border border-slate-200 rounded-2xl animate-pulse shadow-sm"></div>
             ))}
          </div>
        ) : (
          <div className="space-y-4">
             {leaderboard.map((item, index) => (
               <div
                 key={item.id}
                 className={`group flex items-center gap-6 p-5 border rounded-2xl transition-all shadow-sm ${
                   user?.id === item.id ? 'bg-primary/[0.02] border-primary/20 ring-1 ring-primary/10' : 'bg-white border-slate-200 hover:border-primary/30'
                 }`}
               >
                 <div className="w-10 flex flex-col items-center">
                    {index === 0 ? <Trophy size={20} className="text-yellow-500 mb-1" /> :
                     index === 1 ? <Award size={20} className="text-slate-400 mb-1" /> :
                     index === 2 ? <Star size={20} className="text-orange-500 mb-1" /> : null}
                    <span className={`text-lg font-black ${
                      index === 0 ? 'text-yellow-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-orange-500' : 'text-slate-300'
                    }`}>
                      {index + 1}
                    </span>
                 </div>

                 <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xl uppercase border border-slate-200 shadow-inner overflow-hidden">
                    {item.avatar || item.avatar_url ? (
                      <img src={item.avatar || item.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (item.full_name || item.username || 'A')[0]
                    )}
                 </div>

                 <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-lg truncate flex items-center gap-2">
                       {item.full_name || item.username}
                       {user?.id === item.id && <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-black uppercase">You</span>}
                    </h4>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2 mt-0.5">
                       {item.is_pro ? 'Gold Member' : 'Scholar'}
                       <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                       Rank #{index + 1}
                    </p>
                 </div>

                 <div className="text-right">
                    <p className="text-primary font-black text-xl">{item.scholar_points || 0}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Points</p>
                 </div>
               </div>
             ))}

             {/* Info Box */}
             <div className="mt-12 bg-white border border-slate-200 rounded-2xl p-8 text-slate-900 relative overflow-hidden shadow-sm">
                <div className="relative z-10 max-w-lg">
                   <h3 className="font-bold text-lg mb-2">How to earn points?</h3>
                   <p className="text-slate-500 text-sm leading-relaxed mb-6">
                     Get points by helping others in the community, sharing scholarship updates, or having your SOP reviewed by mentors.
                   </p>
                   <Link href="/community" className="inline-flex items-center gap-2 text-[11px] font-bold bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-all uppercase tracking-widest">
                     Join Discussion
                     <ArrowUpRight size={14} />
                   </Link>
                </div>
                <Trophy size={120} className="absolute -bottom-6 -right-6 text-slate-50/50 rotate-12" />
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
