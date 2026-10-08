"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  Heart,
  MessageCircle,
  Tag
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function BlogDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      // Proxy: fetch all and filter for now
      const res = await apiService.getBlogPosts();
      if (res.ok) {
        const found = (res.data as any[]).find(p => String(p.id) === id);
        setPost(found);
      }
      setLoading(false);
    };
    loadPost();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (!post) return <div className="p-20 text-center font-bold">Story not found.</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10 lg:py-16">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest mb-12"
          >
            <ArrowLeft size={16} />
            Back to Insights
          </button>

          <article className="max-w-4xl mx-auto space-y-12">
            <header className="space-y-8">
                <div className="flex items-center gap-4">
                  <span className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-lg">
                      {post.category || 'Success Story'}
                  </span>
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <Calendar size={16} className="text-primary" /> {post.created_at || 'Oct 12, 2024'}
                  </div>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
                  {post.title}
                </h1>

                <div className="flex items-center justify-between py-8 border-y border-slate-100">
                  <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 font-bold text-xl uppercase border border-slate-200 shadow-sm">
                        {post.author_name?.[0] || 'S'}
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-900">{post.author_name || 'Scholar'}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Featured Author</p>
                      </div>
                  </div>

                  <div className="flex gap-4">
                      <button className="p-3 text-slate-400 hover:text-primary transition-all border border-slate-100 rounded-xl hover:bg-slate-50 hover:shadow-sm"><Share2 size={20} /></button>
                      <button className="p-3 text-slate-400 hover:text-red-500 transition-all border border-slate-100 rounded-xl hover:bg-slate-50 hover:shadow-sm"><Heart size={20} /></button>
                  </div>
                </div>
            </header>

            <div className="aspect-video w-full rounded-[3rem] overflow-hidden border border-slate-100 bg-slate-50 shadow-2xl shadow-slate-200/50">
                <img
                  src={post.image || 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200&q=80'}
                  className="w-full h-full object-cover"
                  alt={post.title}
                />
            </div>

            <div className="prose prose-slate max-w-none">
                <div className="text-slate-600 text-lg leading-relaxed space-y-8 font-medium">
                  {post.content.split('\n').map((para: string, i: number) => (
                      <p key={i}>{para}</p>
                  ))}
                  {!post.content && (
                    <p>
                      This is a featured success story about how a Bangladeshi student successfully applied for the MEXT scholarship in Japan.
                      The journey involved meticulous preparation of the Statement of Purpose, gathering strong recommendation letters,
                      and performing well in the interview process at the Japanese Embassy in Dhaka.
                    </p>
                  )}
                </div>
            </div>

            <div className="pt-12 border-t border-slate-100 flex flex-wrap gap-3">
                {['Scholarship', 'Application', 'Tips', 'Education'].map(tag => (
                  <span key={tag} className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:bg-white transition-all shadow-sm">
                    <Tag size={14} />
                    {tag}
                  </span>
                ))}
            </div>

            <div className="border-[3px] border-slate-900 rounded-[3rem] p-12 text-slate-900 text-center space-y-8 relative overflow-hidden bg-white">
                <h3 className="text-3xl font-bold relative z-10">Inspired by this story?</h3>
                <p className="text-slate-500 text-base max-w-lg mx-auto relative z-10 font-medium leading-relaxed">Start your own journey today with our AI Matchmaker and find scholarships that fit your profile.</p>
                <button
                  onClick={() => router.push('/ai-tools/matchmaker')}
                  className="px-12 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all relative z-10 shadow-xl shadow-primary/20"
                >
                  Find My Matches
                </button>
                <div className="absolute top-0 right-0 w-80 h-80 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            </div>
          </article>
        </div>
      </main>

      <footer className="py-12 border-t border-slate-100 text-center">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">ScholarshipConnectBD Insights</p>
      </footer>
    </div>
  );
}
