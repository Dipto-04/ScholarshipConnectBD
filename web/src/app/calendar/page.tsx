"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const res = await apiService.getScholarships();
      if (res.ok) {
        setScholarships((res.data as any[]).filter(s => s.deadline));
      }
      setLoading(false);
    };
    if (user) loadData();
  }, [user]);

  if (authLoading || !user) return null;

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  // Get scholarships for a specific day
  const getScholarshipsForDay = (day: number) => {
    return scholarships.filter(s => {
      const d = new Date(s.deadline);
      return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Scholarship Deadlines</h1>
            <p className="text-slate-500 text-sm">Never miss an application deadline again.</p>
          </div>

          <div className="flex items-center gap-6 bg-white py-2 px-4 rounded-xl border border-slate-200 shadow-sm">
             <button onClick={prevMonth} className="p-1 hover:bg-slate-50 rounded-lg transition-all text-slate-900"><ChevronLeft size={18} /></button>
             <h2 className="text-[12px] font-extrabold uppercase tracking-[0.2em] min-w-[160px] text-center text-slate-800">{monthName} {year}</h2>
             <button onClick={nextMonth} className="p-1 hover:bg-slate-50 rounded-lg transition-all text-slate-900"><ChevronRight size={18} /></button>
          </div>
        </header>

        <div className="grid lg:grid-cols-7 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-5 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
             <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">{day}</div>
                ))}
             </div>
             <div className="grid grid-cols-7">
                {Array.from({ length: 42 }).map((_, i) => {
                  const day = i - firstDayOfMonth + 1;
                  const isCurrentMonth = day > 0 && day <= daysInMonth;
                  const dayScholarships = isCurrentMonth ? getScholarshipsForDay(day) : [];
                  const isToday = isCurrentMonth && day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();

                  return (
                    <div key={i} className={`min-h-[85px] p-1.5 border-r border-b border-slate-100 transition-colors ${!isCurrentMonth ? 'bg-slate-50/40 text-slate-300' : 'hover:bg-slate-50/30'}`}>
                       {isCurrentMonth && (
                         <div className="h-full flex flex-col justify-between">
                            <span className={`text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-md ${isToday ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-500'}`}>
                               {day}
                            </span>
                            <div className="space-y-0.5 mt-1">
                               {dayScholarships.map(s => (
                                 <div key={s.id} className="text-[8px] font-bold text-red-600 bg-red-50/80 px-1 py-0.5 rounded border border-red-100 truncate cursor-pointer hover:bg-red-100 transition-colors" title={s.title}>
                                    {s.title}
                                 </div>
                               ))}
                            </div>
                         </div>
                       )}
                    </div>
                  );
                })}
             </div>
          </div>

          {/* Upcoming Deadlines Sidebar */}
          <div className="lg:col-span-2 space-y-8">
             <section className="border border-slate-200 rounded-2xl p-6 bg-white shadow-sm">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                   <Clock size={16} />
                   Upcoming Deadlines
                </h3>

                {loading ? (
                   <div className="space-y-4">
                      {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse"></div>)}
                   </div>
                ) : scholarships.length === 0 ? (
                   <p className="text-xs text-slate-400 font-bold italic py-4">No deadlines set for this period.</p>
                ) : (
                   <div className="space-y-4">
                      {scholarships
                        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                        .filter(s => new Date(s.deadline) >= new Date())
                        .slice(0, 5)
                        .map(s => (
                           <Link key={s.id} href={`/scholarships/${s.id}`} className="block group p-4 border border-slate-100 rounded-xl hover:border-primary/20 transition-all hover:bg-slate-50">
                              <h4 className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1 mb-1">{s.title}</h4>
                              <div className="flex justify-between items-center">
                                 <span className="text-[9px] font-bold text-red-500">{new Date(s.deadline).toLocaleDateString()}</span>
                                 <ArrowRight size={12} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                              </div>
                           </Link>
                        ))
                      }
                   </div>
                )}
             </section>

             <div className="border border-slate-200 rounded-2xl p-8 text-slate-900 text-center relative overflow-hidden bg-white shadow-sm">
                <div className="relative z-10">
                   <AlertCircle className="text-red-500 mx-auto mb-4" size={32} />
                   <h4 className="font-bold text-sm mb-2">Reminder System</h4>
                   <p className="text-slate-500 text-[10px] leading-relaxed mb-6">
                      Get email and browser alerts 48 hours before your saved scholarship deadlines.
                   </p>
                   <button className="w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors uppercase tracking-widest">
                      Enable Alerts
                   </button>
                </div>
                <CalendarIcon size={120} className="absolute -bottom-10 -right-10 text-slate-50 rotate-12" />
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
