"use client";

import React, { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { Scholarship } from '@/types';
import Link from 'next/link';
import { Search, MapPin, ArrowRight, GraduationCap, Plus } from 'lucide-react';
import Header from '@/components/Header';

export default function ScholarshipList() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Undergraduate', 'Postgraduate', 'PhD', 'Fully Funded'];

  useEffect(() => {
    loadScholarships();
  }, []);

  const loadScholarships = async (query = '', category = 'All') => {
    setLoading(true);
    let params = query ? `search=${query}` : '';
    if (category !== 'All') {
      params += (params ? '&' : '') + `level=${category}`;
    }

    const res = await apiService.getScholarships(params);
    if (res.ok) {
      setScholarships(res.data as unknown as Scholarship[]);
    }
    setLoading(false);
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    loadScholarships(search, cat);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10 lg:py-16">
        <div className="bg-white border border-slate-200 rounded-sm p-8 md:p-12 shadow-sm">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Scholarships</h1>
            <p className="text-slate-500 text-sm font-medium">Find and apply for verified international opportunities.</p>
          </div>
          <Link href="/scholarships/add" className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-200">
             <Plus size={16} />
             Add Scholarship
          </Link>
        </header>

          {/* Minimal Search & Filter */}
          <div className="flex flex-col lg:flex-row gap-6 mb-12">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search for scholarships..."
                className="w-full pl-12 pr-4 py-3.5 border border-gray-100 bg-gray-50/50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadScholarships(search, activeCategory)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap shadow-sm ${
                    activeCategory === cat
                      ? 'bg-primary text-white border-primary shadow-primary/20'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-primary/30 hover:text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-28 border border-slate-100 rounded-lg animate-pulse bg-slate-50/30"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {scholarships.length > 0 ? scholarships.map((item) => (
                <Link
                  key={item.id}
                  href={`/scholarships/${item.id}`}
                  className="group border border-slate-100 rounded-lg p-6 flex justify-between items-center hover:border-primary/30 transition-all bg-gray-50/30 shadow-sm"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                       <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors text-lg">{item.title}</h4>
                       {item.amount && <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-lg font-black uppercase tracking-widest border border-emerald-100">{item.amount}</span>}
                       {item.is_applied && (
                         <span className="text-[9px] bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-lg font-black uppercase tracking-widest border border-blue-100 flex items-center gap-0.5">
                           Applied
                         </span>
                       )}
                    </div>
                    <div className="flex gap-6 text-slate-500 text-xs font-bold uppercase tracking-tight opacity-70">
                      <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary" /> {item.country}</span>
                      <span className="flex items-center gap-1.5"><GraduationCap size={14} className="text-primary" /> {item.level}</span>
                      <span className="flex items-center gap-1.5 text-slate-400">Deadline: {item.deadline || 'Ongoing'}</span>
                    </div>
                  </div>
                  <div className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all">
                    <ArrowRight size={20} />
                  </div>
                </Link>
              )) : (
                <div className="text-center py-24 border border-slate-200 rounded-lg border-dashed bg-slate-50/30">
                   <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No scholarships found</p>
                   <button
                     onClick={() => {setSearch(''); handleCategoryChange('All');}}
                     className="mt-6 text-primary font-black text-xs uppercase tracking-[0.2em] hover:underline"
                   >
                     Clear Filters
                   </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="py-12 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
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
