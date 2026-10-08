"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { BookOpen, Calendar, Clock, ArrowRight, Tag, Search } from 'lucide-react';
import Link from 'next/link';

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await apiService.getBlogPosts();
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
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
          <header className="mb-16">
            <div className="flex items-center gap-4 mb-6">
               <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary-light px-4 py-1.5 rounded-lg border border-primary/10">Insights</span>
               <div className="h-px flex-1 bg-slate-100"></div>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">Scholar Stories & Guides</h1>
            <p className="text-slate-500 max-w-2xl font-medium leading-relaxed text-lg">
              Success stories and application tips written by Bangladeshi students who've already secured their international dreams.
            </p>
          </header>

          <div className="grid lg:grid-cols-3 gap-16">
            {/* Main Blog Feed */}
            <div className="lg:col-span-2 space-y-20">
               {loading ? (
                  <div className="space-y-16">
                     {[1, 2].map(i => (
                       <div key={i} className="space-y-6">
                          <div className="aspect-video w-full bg-slate-50 rounded-[2rem] animate-pulse border border-slate-100"></div>
                          <div className="h-8 w-3/4 bg-slate-50 rounded-xl animate-pulse"></div>
                          <div className="h-4 w-1/2 bg-slate-50 rounded-xl animate-pulse"></div>
                       </div>
                     ))}
                  </div>
               ) : (
                  <div className="space-y-20">
                     {posts.map((post) => (
                       <article key={post.id} className="group cursor-pointer">
                          <Link href={`/blog/${post.id}`}>
                             <div className="aspect-[16/9] w-full rounded-[2rem] overflow-hidden mb-10 border border-slate-100 bg-slate-50 relative shadow-2xl shadow-slate-200/50">
                                <img
                                  src={post.image || 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200&q=80'}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                  alt={post.title}
                                />
                                <div className="absolute top-8 left-8">
                                   <span className="bg-white/90 backdrop-blur-md px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 border border-slate-200 shadow-lg">
                                      {post.category || 'Success Story'}
                                   </span>
                                </div>
                             </div>

                             <div className="space-y-6">
                                <div className="flex items-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                   <span className="flex items-center gap-2.5"><Calendar size={16} className="text-primary" /> {post.created_at || 'Oct 12, 2024'}</span>
                                   <span className="flex items-center gap-2.5"><Clock size={16} className="text-primary" /> 5 min read</span>
                                </div>

                                <h2 className="text-3xl font-bold text-slate-900 group-hover:text-primary transition-colors leading-tight tracking-tight">
                                   {post.title}
                                </h2>

                                <p className="text-slate-500 text-base leading-relaxed line-clamp-3 font-medium">
                                   {post.excerpt || post.content}
                                </p>

                                <div className="flex items-center gap-3 text-primary font-black text-xs uppercase tracking-widest group-hover:gap-5 transition-all pt-4">
                                   Read Full Story
                                   <ArrowRight size={20} />
                                </div>
                             </div>
                          </Link>
                       </article>
                     ))}
                  </div>
               )}
            </div>

            {/* Sidebar */}
            <div className="space-y-16">
               <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Search Articles</h3>
                  <div className="relative">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                     <input
                       type="text"
                       placeholder="Search keywords..."
                       className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs font-bold"
                     />
                  </div>
               </section>

               <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Popular Tags</h3>
                  <div className="flex flex-wrap gap-3">
                     {['USA', 'MEXT', 'Commonwealth', 'SOP Tips', 'IELTS', 'Germany', 'Visa'].map(tag => (
                       <button key={tag} className="px-5 py-2.5 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-primary hover:text-primary hover:bg-white transition-all shadow-sm">
                          {tag}
                       </button>
                     ))}
                  </div>
               </section>

               <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden">
                  <div className="relative z-10 space-y-6">
                    <h4 className="font-bold text-slate-900 text-lg">Want to share your story?</h4>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium">
                       Help the next generation of Bangladeshi scholars by sharing your experiences and tips.
                    </p>
                    <button className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                       Submit Article
                    </button>
                  </div>
                  <BookOpen size={150} className="absolute -bottom-10 -right-10 text-primary opacity-5 rotate-12" />
               </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-slate-100 text-center">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">© 2026 ScholarshipConnectBD Blog</p>
      </footer>
    </div>
  );
}
