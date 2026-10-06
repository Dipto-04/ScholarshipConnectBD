"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { MessageSquare, Users, MessageCircle, Heart, Share2, Plus, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await apiService.getDiscussions();
        if (res.ok) {
          setPosts(res.data as any[]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10 lg:py-16">
        <div className="bg-white border border-slate-200 rounded-sm p-8 md:p-12 shadow-sm">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Community</h1>
              <p className="text-slate-500 text-sm font-medium">Connect with fellow scholars and share your journey.</p>
            </div>
            <button className="bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 text-xs uppercase tracking-widest">
               <Plus size={20} />
               Start Discussion
            </button>
          </header>

          <div className="grid lg:grid-cols-4 gap-12">
            {/* Sidebar Filters */}
            <div className="hidden lg:block space-y-10">
               <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Categories</h3>
                  <div className="space-y-1">
                     {['All Discussions', 'Application Tips', 'Country Guides', 'Visa Experience', 'General Help'].map(cat => (
                       <button key={cat} className={`w-full text-left px-5 py-3 rounded-xl text-xs font-bold transition-all ${
                         cat === 'All Discussions' ? 'bg-primary-light text-primary border border-primary/10' : 'text-slate-500 hover:text-primary hover:bg-slate-50'
                       }`}>
                          {cat}
                       </button>
                     ))}
                  </div>
               </section>

               <div className="border border-slate-100 rounded-3xl p-8 text-slate-900 text-center bg-slate-50/50 relative overflow-hidden group">
                  <Users size={48} className="mx-auto mb-4 text-primary opacity-20 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-sm mb-2 relative z-10">Top Scholars</h4>
                  <p className="text-slate-500 text-[10px] mb-8 relative z-10 leading-relaxed font-bold uppercase tracking-wider">See who's leading the community this month.</p>
                  <Link href="/community/leaderboard" className="block w-full py-3 bg-slate-900 text-white text-[10px] font-black rounded-xl hover:bg-slate-800 transition-colors uppercase tracking-widest relative z-10">
                     View Rankings
                  </Link>
               </div>
            </div>

            {/* Feed */}
            <div className="lg:col-span-3 space-y-8">
               {/* Search */}
               <div className="relative mb-10 max-w-xl">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search discussions..."
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                  />
               </div>

               {loading ? (
                 <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-48 border border-black/5 rounded-lg animate-pulse bg-gray-50/30"></div>
                    ))}
                 </div>
               ) : (
                 <div className="space-y-6">
                    {posts.map((post) => (
                      <div key={post.id} className="border border-slate-100 rounded-lg p-6 hover:border-primary/20 transition-all bg-gray-50/20 group">
                         <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 bg-white border border-black/5 rounded-xl flex items-center justify-center text-slate-400 font-bold text-base uppercase shadow-sm">
                               {post.author_name?.[0] || 'A'}
                            </div>
                            <div>
                               <h4 className="text-sm font-bold text-slate-900">{post.author_name || 'Anonymous'}</h4>
                               <div className="flex items-center gap-3">
                                  <span className="text-[10px] text-primary font-black uppercase tracking-widest">{post.category || 'General'}</span>
                                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{post.created_at || '2h ago'}</span>
                               </div>
                            </div>
                            <button className="ml-auto p-2 text-slate-300 hover:text-slate-600 transition-colors"><MoreVerticalIcon size={20} /></button>
                         </div>

                         <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-primary transition-colors leading-snug">{post.title}</h3>
                         <p className="text-slate-500 text-sm mb-4 line-clamp-3 leading-relaxed font-medium">{post.content}</p>

                         <div className="flex items-center gap-8 pt-4 border-t border-slate-100">
                            <button className="flex items-center gap-2.5 text-slate-400 hover:text-primary transition-all">
                               <MessageCircle size={18} />
                               <span className="text-[10px] font-black uppercase tracking-widest">{post.comments_count || 0} Comments</span>
                            </button>
                            <button className="flex items-center gap-2.5 text-slate-400 hover:text-red-500 transition-all">
                               <Heart size={18} />
                               <span className="text-[10px] font-black uppercase tracking-widest">{post.likes_count || 0} Likes</span>
                            </button>
                            <button className="ml-auto text-slate-300 hover:text-primary transition-all">
                               <Share2 size={16} />
                            </button>
                         </div>
                      </div>
                    ))}
                 </div>
               )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const MoreVerticalIcon = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
);
