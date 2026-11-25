"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { Scholarship } from '@/types';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import {
  ArrowRight,
  MapPin,
  GraduationCap,
  Sparkles,
  Brain,
  Users,
  Globe,
  ShieldCheck,
  Send,
  Trophy
} from 'lucide-react';

export default function Home() {
  const [featured, setFeatured] = useState<Scholarship[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [stats, setStats] = useState({
    total_scholarships: 0,
    total_applications: 0,
    total_scholars: 0,
    countries_count: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/home');
    }
  }, [user, loading, router]);

  useEffect(() => {
    setFeaturedLoading(true);
    apiService.getScholarships('limit=3').then((res) => {
      if (res.ok && res.data) {
        setFeatured(res.data as unknown as Scholarship[]);
      }
      setFeaturedLoading(false);
    });

    setStatsLoading(true);
    apiService.getPublicStats().then((res) => {
      if (res.ok && res.data) {
        setStats(res.data);
      }
      setStatsLoading(false);
    });
  }, []);

  const displayScholarshipsCount = Math.max(stats.total_scholarships || 0, featured.length);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 lg:py-28 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-medium uppercase tracking-widest">
              <Sparkles size={14} />
              Empowering Bangladeshi Scholars
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.2] lg:leading-[1.1] tracking-tight">
              Unlock Your <span className="text-primary underline decoration-primary/20 underline-offset-4 lg:underline-offset-8">International</span> Journey.
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-500 font-normal leading-relaxed max-w-2xl mx-auto">
              Discover, track, and apply for world-class scholarships with AI-powered guidance tailored for students in Bangladesh.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
              <Link
                href="/scholarships"
                className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                Browse Scholarships
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/ai-tools"
                className="w-full sm:w-auto px-8 py-3.5 border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-medium hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <Brain size={18} />
                ScholarAI Suite
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Decorative Gradients */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      </section>

      {/* Real Live Database Stats Banner (Publicly fetched live from backend) */}
      <section className="py-8 bg-slate-50/80 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-4 sm:p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-primary mb-1">
                <Trophy size={18} />
                <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Scholarships</span>
              </div>
              <p className="text-xl sm:text-3xl font-bold text-slate-900">
                {statsLoading ? (
                  <span className="inline-block h-7 w-16 bg-slate-100 rounded-lg animate-pulse"></span>
                ) : (
                  displayScholarshipsCount.toLocaleString()
                )}
              </p>
              <p className="text-[11px] text-slate-500 font-normal">Total Live Scholarships</p>
            </div>

            <div className="p-4 sm:p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-600 mb-1">
                <Send size={18} />
                <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Applications</span>
              </div>
              <p className="text-xl sm:text-3xl font-bold text-slate-900">
                {statsLoading ? (
                  <span className="inline-block h-7 w-16 bg-slate-100 rounded-lg animate-pulse"></span>
                ) : (
                  stats.total_applications.toLocaleString()
                )}
              </p>
              <p className="text-[11px] text-slate-500 font-normal">Submitted Globally</p>
            </div>

            <div className="p-4 sm:p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-blue-600 mb-1">
                <Users size={18} />
                <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Community</span>
              </div>
              <p className="text-xl sm:text-3xl font-bold text-slate-900">
                {statsLoading ? (
                  <span className="inline-block h-7 w-16 bg-slate-100 rounded-lg animate-pulse"></span>
                ) : (
                  stats.total_scholars.toLocaleString()
                )}
              </p>
              <p className="text-[11px] text-slate-500 font-normal">Registered Scholars</p>
            </div>

            <div className="p-4 sm:p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-purple-600 mb-1">
                <Globe size={18} />
                <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Destinations</span>
              </div>
              <p className="text-xl sm:text-3xl font-bold text-slate-900">
                {statsLoading ? (
                  <span className="inline-block h-7 w-16 bg-slate-100 rounded-lg animate-pulse"></span>
                ) : (
                  stats.countries_count.toLocaleString()
                )}
              </p>
              <p className="text-[11px] text-slate-500 font-normal">Target Countries</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Scholarships */}
      <section className="py-16 sm:py-20 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">Recently Added Opportunities</h2>
              <p className="text-slate-500 text-xs sm:text-sm font-normal">Explore the latest opportunities verified for Bangladeshi applicants.</p>
            </div>
            <Link
              href="/scholarships"
              className="text-primary font-medium text-xs uppercase tracking-wider flex items-center gap-1.5 group"
            >
              View All Opportunities
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 border border-slate-100 rounded-2xl bg-slate-50 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featured.map((s) => (
                <Link
                  key={s.id}
                  href={`/scholarships/${s.id}`}
                  className="group border border-slate-200 rounded-2xl p-5 sm:p-6 hover:border-primary/40 transition-all bg-white hover:shadow-md"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-normal px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      {s.level || 'Degree'}
                    </span>
                    <div className="h-px flex-1 bg-slate-100"></div>
                  </div>

                  <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {s.title}
                  </h3>

                  <div className="flex items-center gap-4 text-slate-400 text-xs font-normal uppercase tracking-wider mb-5">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-primary" /> {s.country}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[10px] font-normal text-slate-400 uppercase tracking-wider">
                    <span>Deadline: {s.deadline || 'Ongoing'}</span>
                    <div className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-transform">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-20 bg-slate-50/50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
          {[
            {
              title: 'Verified Only',
              sub: 'All scholarships are manually checked and verified by our academic team.',
              icon: ShieldCheck,
              color: 'text-emerald-600 bg-emerald-50',
            },
            {
              title: 'Eligibility Checker',
              sub: 'Instantly check if you meet the criteria for any scholarship in our database.',
              icon: Brain,
              color: 'text-primary bg-primary-light',
            },
            {
              title: 'Mentor Support',
              sub: 'Connect directly with successful scholars for guidance and SOP reviews.',
              icon: Users,
              color: 'text-purple-600 bg-purple-50',
            },
          ].map((feat, i) => (
            <div key={i} className="space-y-3 bg-white p-6 border border-slate-200/70 rounded-2xl shadow-xs">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${feat.color}`}>
                <feat.icon size={22} />
              </div>
              <h4 className="font-bold text-base text-slate-900">{feat.title}</h4>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">{feat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-teal-50/90 via-emerald-50/90 to-cyan-50/90 border border-teal-200/80 rounded-2xl p-8 sm:p-14 text-center text-slate-900 relative overflow-hidden shadow-xs">
            <div className="relative z-10 max-w-xl mx-auto space-y-4">
              <h2 className="text-2xl sm:text-4xl font-bold leading-tight">Ready to start your application?</h2>
              <p className="text-slate-600 font-normal text-xs sm:text-sm leading-relaxed">
                Join Bangladeshi students using ScholarAI to track deadlines and secure their international dreams.
              </p>
              <div className="pt-2">
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white rounded-xl text-xs font-medium hover:bg-primary/90 transition-all shadow-xs"
                >
                  Create Free Account
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-10 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-xs">S</div>
            <span className="font-bold text-sm tracking-tight text-slate-900">
              ScholarshipConnect<span className="text-primary">BD</span>
            </span>
          </div>

          <div className="flex gap-6 text-[10px] sm:text-xs font-normal text-slate-400 uppercase tracking-wider">
            <Link href="/scholarships" className="hover:text-primary">Browse</Link>
            <Link href="/blog" className="hover:text-primary">Insights</Link>
            <Link href="/mentorship" className="hover:text-primary">Mentors</Link>
            <Link href="/privacy" className="hover:text-primary">Privacy</Link>
            <Link href="/terms" className="hover:text-primary">Terms</Link>
          </div>

          <p className="text-[10px] sm:text-xs font-normal text-slate-400 uppercase tracking-wider">© 2026 Bangladesh</p>
        </div>
      </footer>
    </div>
  );
}
