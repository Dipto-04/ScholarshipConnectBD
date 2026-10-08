"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMentorMode } from '@/context/MentorModeContext';
import { apiService } from '@/lib/api';
import { Scholarship } from '@/types';
import Header from '@/components/Header';
import {
  MapPin,
  GraduationCap,
  ArrowRight,
  BookOpen,
  Globe,
  Search,
  MessageSquare,
  ShieldCheck,
  Brain,
  Calendar,
  DollarSign,
  Trophy,
  LayoutDashboard,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Bookmark,
  Send,
  FileText,
  Star
} from 'lucide-react';

function StudentHome({ user, scholarships, leaderboard, loading, search, setSearch, router, initials }: any) {
  const countries = ['USA', 'UK', 'Canada', 'Germany', 'Japan', 'Australia'];
  const aiTools = [
    { name: 'Live Support', sub: 'Instant AI Chat', icon: MessageSquare, color: 'text-orange-600 border-orange-100 bg-orange-50/30', href: '/ai-tools/support-bot' },
    { name: 'Eligibility', sub: 'Instant Analysis', icon: ShieldCheck, color: 'text-emerald-600 border-emerald-100 bg-emerald-50/30', href: '/ai-tools/eligibility' },
    { name: 'Doc Vault', sub: 'Store Safely', icon: BookOpen, color: 'text-amber-600 border-amber-100 bg-amber-50/30', href: '/profile/documents' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-8 md:p-12 shadow-sm">
      <div className="flex justify-between items-center mb-8 md:mb-10">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">Hello, {user.full_name?.split(' ')[0]}</h1>
          <p className="text-slate-500 text-xs sm:text-sm">Find your next scholarship opportunity today.</p>
        </div>
        <div className="flex items-center gap-4 lg:hidden">
           <Link href="/profile" className="w-10 h-10 rounded-xl bg-gray-50 border border-slate-100 flex items-center justify-center text-primary font-bold text-sm shadow-sm">
              {initials}
           </Link>
        </div>
      </div>

      <div className="mb-10 md:mb-12 relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search for scholarships..."
          className="w-full pl-12 pr-4 py-3 sm:py-4 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-medium shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && router.push(`/scholarships?search=${search}`)}
        />
      </div>

      <div className="grid lg:grid-cols-4 gap-8 md:gap-12">
        <div className="lg:col-span-3 space-y-10 md:space-y-12">
          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 md:mb-6">Quick AI Tools</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              {aiTools.map((tool) => (
                <Link
                  key={tool.name}
                  href={tool.href}
                  className={`border border-slate-100 rounded-2xl p-4 sm:p-6 flex items-center gap-4 hover:border-primary/30 transition-all group ${tool.color}`}
                >
                  <div className="p-2.5 rounded-xl bg-white shadow-sm group-hover:scale-110 transition-transform">
                     <tool.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{tool.name}</h4>
                    <p className="text-[10px] opacity-70 font-bold">{tool.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 md:mb-6">Explore Countries</h3>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {countries.map((country) => (
                <Link
                  key={country}
                  href={`/scholarships?country=${country}`}
                  className="flex-shrink-0 px-6 py-3 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 hover:border-teal-500 hover:text-teal-600 transition-all flex items-center gap-2 bg-white shadow-sm hover:shadow-md active:scale-95"
                >
                  <Globe size={14} className="text-teal-600" />
                  {country}
                </Link>
              ))}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Featured Opportunities</h3>
              <Link href="/scholarships" className="text-primary font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-28 border border-slate-100 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-5 w-full">
                {scholarships.length > 0 ? scholarships.map((item: any) => (
                  <Link
                    key={item.id}
                    href={`/scholarships/${item.id}`}
                    className="group block w-full max-w-full border border-slate-100/80 rounded-2xl p-5 sm:p-6 hover:border-teal-200 transition-all bg-slate-50/40 hover:bg-white hover:shadow-xl hover:shadow-slate-100/50 overflow-hidden shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                      <div className="w-full min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                           <h4 className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors text-sm sm:text-base leading-snug tracking-tight break-words">{item.title}</h4>
                           {item.is_featured && (
                             <span className="text-[7px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter shrink-0 border border-red-100/50">Hot</span>
                           )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-2.5 text-slate-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest items-start sm:items-center w-full">
                          <span className="flex items-center gap-2 max-w-full">
                            <MapPin size={14} className="text-teal-600 shrink-0" />
                            <span className="break-all whitespace-normal">{item.country}</span>
                          </span>
                          <span className="flex items-center gap-2 max-w-full">
                            <GraduationCap size={14} className="text-teal-600 shrink-0" />
                            <span className="break-all whitespace-normal">{item.level}</span>
                          </span>
                          <span className="flex items-center gap-2 text-slate-400 shrink-0">
                            <span>Deadline: {item.deadline || 'Ongoing'}</span>
                          </span>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-4 shrink-0">
                        <ArrowRight size={20} className="text-slate-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                )) : (
                  <div className="text-center py-16 border border-slate-200 rounded-2xl border-dashed bg-slate-50/30 w-full">
                     <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No featured opportunities right now.</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-8 md:space-y-10">
          <div className="border border-slate-200 rounded-2xl p-6 sm:p-8 relative overflow-hidden bg-slate-50/50 group">
             <h4 className="font-bold text-base text-slate-900 mb-2 relative z-10">Student Stories</h4>
             <p className="text-slate-500 text-[11px] leading-relaxed mb-6 relative z-10 font-medium">
               Read how fellow Bangladeshi students secured their dreams abroad.
             </p>
             <Link href="/blog" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors relative z-10 shadow-sm">
               Read Now
               <ArrowRight size={14} />
             </Link>
             <BookOpen size={80} className="absolute -bottom-4 -right-4 text-slate-100 opacity-50" />
          </div>

          <section className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="p-6 border-b border-slate-50 bg-slate-50/30">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Scholars</h3>
            </div>
            <div className="p-4 space-y-1">
              {loading ? (
                [1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-50 rounded-xl animate-pulse mb-2"></div>)
              ) : (
                leaderboard.map((item: any, index: number) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <span className="text-[10px] font-black text-slate-300 w-4">{index + 1}</span>
                    <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold text-xs uppercase border border-slate-200 shadow-sm">
                      {(item.full_name || item.username || 'A')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.full_name || item.username}</p>
                      <p className="text-[10px] text-primary font-black uppercase tracking-tighter">{item.scholar_points || 0} PTS</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link href="/community/leaderboard" className="block text-center py-4 bg-slate-50 text-[10px] font-black text-slate-400 hover:text-primary transition-colors border-t border-slate-100 uppercase tracking-widest">
              Full Leaderboard
            </Link>
          </section>

          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-8 text-center shadow-sm">
             <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
                <Brain size={24} />
             </div>
             <h4 className="text-sm font-bold text-slate-900 mb-2">ScholarAI Match</h4>
             <p className="text-[10px] text-slate-500 mb-6 leading-relaxed font-bold uppercase tracking-wider">
                Tailored matches based on your profile.
             </p>
             <Link href="/ai-tools/matchmaker" className="block w-full py-3 bg-primary text-white text-[10px] font-black rounded-xl hover:bg-primary/90 transition-colors uppercase tracking-widest shadow-sm">
               Match Me
             </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
             <Plus size={32} className="text-primary mx-auto mb-4 opacity-30" />
             <h4 className="font-bold text-sm mb-2 text-slate-900">Add Scholarship</h4>
             <p className="text-[11px] text-slate-500 mb-8 font-medium leading-relaxed">Know about an opportunity? Share it with the community.</p>
             <Link href="/scholarships/add" className="block w-full py-3 bg-slate-900 text-white text-[10px] font-black rounded-xl hover:bg-slate-800 transition-colors uppercase tracking-[0.2em] shadow-md">
                Submit Now
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function MentorHome({ user, initials }: any) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [impact, setImpact] = useState({ scholarships: 0, discussions: 0, solved: 0 });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [mentorshipRes, scholarRes] = await Promise.all([
          apiService.getMentorships(),
          apiService.getScholarships()
        ]);
        if (mentorshipRes.ok) setSessions(mentorshipRes.data);
        if (scholarRes.ok) {
           const myScholars = (scholarRes.data as any[]).filter(s => s.submitted_by === user.id);
           setImpact(prev => ({ ...prev, scholarships: myScholars.length }));
        }
      } catch (e) {} finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-8 md:p-12 shadow-sm">
      <div className="border border-slate-200 rounded-2xl p-6 md:p-12 text-slate-900 mb-12 relative overflow-hidden bg-slate-50/30">
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
               <p className="text-slate-500 text-sm font-medium mb-1">Welcome back,</p>
               <h1 className="text-3xl font-bold mb-4">{user.full_name}</h1>
               <div className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-primary/10">
                  <ShieldCheck size={14} />
                  Verified Mentor
               </div>
            </div>
            <div className="text-center">
               <div className="w-24 h-24 rounded-2xl border-2 border-slate-100 flex flex-col items-center justify-center bg-white shadow-md">
                  <span className="text-3xl font-black text-slate-900 leading-none">{user.scholar_points || 0}</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1.5">Points</span>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-3 gap-8 mt-12 pt-10 border-t border-slate-100 relative z-10">
            <div className="text-center">
               <p className="text-3xl font-black text-slate-900">{sessions.length}</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sessions</p>
            </div>
            <div className="text-center">
               <p className="text-3xl font-black text-amber-500">{sessions.filter(s => s.status === 'pending').length}</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pending</p>
            </div>
            <div className="text-center">
               <p className="text-3xl font-black text-emerald-500">98%</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Success</p>
            </div>
         </div>

         <LayoutDashboard size={200} className="absolute -bottom-20 -right-20 text-slate-200 opacity-20 pointer-events-none" />
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
         <div className="lg:col-span-2 space-y-12">
            <section>
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recent Requests</h3>
                  <Link href="/mentorship/sessions" className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline">View All</Link>
               </div>

               {loading ? (
                  <div className="space-y-6">
                     {[1, 2].map(i => <div key={i} className="h-32 border border-slate-100 rounded-xl animate-pulse"></div>)}
                  </div>
               ) : sessions.length === 0 ? (
                  <div className="text-center py-24 border border-slate-200 border-dashed rounded-xl bg-slate-50/30">
                     <p className="text-slate-400 text-sm font-bold">No mentorship requests yet.</p>
                  </div>
               ) : (
                  <div className="space-y-6">
                     {sessions.slice(0, 3).map(session => (
                        <div key={session.id} className="border border-slate-100 rounded-2xl p-8 hover:border-primary/30 transition-all bg-white shadow-sm group">
                           <div className="flex justify-between items-start mb-6">
                              <h4 className="font-bold text-slate-900 text-lg">{session.topic}</h4>
                              <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${
                                 session.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              }`}>{session.status}</span>
                           </div>
                           <div className="flex gap-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-8 opacity-70">
                              <span className="flex items-center gap-2"><Calendar size={16} className="text-primary" /> {session.scheduled_date || 'TBD'}</span>
                              <span className="flex items-center gap-2"><Clock size={16} className="text-primary" /> {session.scheduled_time || 'TBD'}</span>
                           </div>
                           <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200 shadow-sm">{session.mentee_name?.[0]}</div>
                                 <span className="text-sm font-bold text-slate-700">{session.mentee_name}</span>
                              </div>
                              <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">Manage Request</button>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </section>
         </div>

         <div className="space-y-10">
            <section className="border border-slate-100 rounded-2xl p-8 bg-slate-50/30">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Community Impact</h3>
               <div className="space-y-8">
                  <div className="flex items-center gap-5">
                     <div className="w-12 h-12 bg-white text-blue-600 rounded-lg flex items-center justify-center border border-slate-100 shadow-sm"><GraduationCap size={24} /></div>
                     <div>
                        <p className="text-xl font-black text-slate-900 leading-none">{impact.scholarships}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 font-bold">Scholarships Added</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-5">
                     <div className="w-12 h-12 bg-white text-purple-600 rounded-lg flex items-center justify-center border border-slate-100 shadow-sm"><MessageSquare size={24} /></div>
                     <div>
                        <p className="text-xl font-black text-slate-900 leading-none">{impact.discussions}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 font-bold">Discussions Joined</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-5">
                     <div className="w-12 h-12 bg-white text-emerald-600 rounded-lg flex items-center justify-center border border-slate-100 shadow-sm"><CheckCircle size={24} /></div>
                     <div>
                        <p className="text-xl font-black text-slate-900 leading-none">{impact.solved}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 font-bold">Issues Solved</p>
                     </div>
                  </div>
               </div>
            </section>

            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
               <Users size={32} className="text-primary mx-auto mb-4 opacity-30" />
               <h4 className="font-bold text-sm mb-2 text-slate-900">Mentor Profile</h4>
               <p className="text-[11px] text-slate-500 mb-8 font-medium leading-relaxed">Keep your university and scholarship details updated to attract more students.</p>
               <Link href="/profile/edit" className="block w-full py-3 bg-slate-900 text-white text-[10px] font-bold rounded-lg hover:bg-slate-800 transition-colors uppercase tracking-[0.2em] shadow-md">
                  Update Profile
               </Link>
            </div>
         </div>
      </div>
    </div>
  );
}

export default function UserHomePage() {
  const { user, loading: authLoading } = useAuth();
  const { isMentorMode } = useMentorMode();
  const router = useRouter();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scholarRes, leaderRes] = await Promise.all([
          apiService.getScholarships('limit=3&featured=true'),
          apiService.getLeaderboard()
        ]);

        if (scholarRes.ok) {
          setScholarships(scholarRes.data as unknown as Scholarship[]);
        }
        if (leaderRes.ok) {
          setLeaderboard((leaderRes.data as any[]).slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const initials = user.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : (user.email.substring(0, 2).toUpperCase() || 'S');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 lg:py-16">
        {isMentorMode && user.is_staff ? (
           <MentorHome user={user} initials={initials} />
        ) : (
           <StudentHome
             user={user}
             scholarships={scholarships}
             leaderboard={leaderboard}
             loading={loading}
             search={search}
             setSearch={setSearch}
             router={router}
             initials={initials}
           />
        )}
      </div>

      {/* Floating Live Support AI Button */}
      <Link
        href="/ai-tools/support-bot"
        className="fixed bottom-24 lg:bottom-10 right-6 sm:right-10 z-[90] w-14 h-14 bg-orange-500 text-white rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-orange-600 transition-all group active:scale-95 border-2 border-orange-400/20"
      >
        <MessageSquare size={28} />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></div>
        <span className="absolute right-full mr-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
           Live AI Support
        </span>
      </Link>

      <footer className="py-12 border-t border-slate-200 mb-20 lg:mb-0">
        <div className="max-w-7xl mx-auto px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">© 2026 ScholarshipConnectBD</p>
           <div className="flex gap-10">
             <Link href="/privacy" className="text-slate-400 hover:text-primary text-[10px] font-black uppercase tracking-[0.2em] transition-colors">Privacy</Link>
             <Link href="/terms" className="text-slate-400 hover:text-primary text-[10px] font-black uppercase tracking-[0.2em] transition-colors">Terms</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}
