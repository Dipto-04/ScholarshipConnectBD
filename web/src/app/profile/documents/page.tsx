"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import { BookOpen, FileText, Upload, Trash2, ShieldCheck, Plus, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function DocVaultPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [docs, setDocs] = useState([
    { id: 1, name: 'Passport_Copy.pdf', type: 'Identification', date: '2024-05-20', size: '1.2 MB' },
    { id: 2, name: 'IELTS_Certificate.pdf', type: 'Language', date: '2024-06-15', size: '0.8 MB' },
    { id: 3, name: 'Undergrad_Transcript.pdf', type: 'Academic', date: '2024-03-10', size: '2.5 MB' },
  ]);

  if (authLoading) return null;
  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-white border border-slate-200 rounded-sm p-8 md:p-12 shadow-sm">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Document Vault</h1>
            <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
               <ShieldCheck size={16} className="text-emerald-500" />
               Your documents are encrypted and secure.
            </p>
          </div>
          <button className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 text-sm">
             <Plus size={20} />
             Upload New
          </button>
        </header>

        {/* Stats & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-10">
           <div className="sm:col-span-3 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search documents..."
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium bg-slate-50/50"
              />
           </div>
           <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col items-center justify-center">
              <span className="text-slate-900 font-bold text-lg">{docs.length} / 20</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Storage Used</span>
           </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {docs.map((doc) => (
             <div key={doc.id} className="group border border-slate-200 rounded-lg p-6 hover:border-primary/50 transition-all hover:shadow-sm bg-white relative">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary-light transition-colors">
                   <FileText size={24} className="text-slate-400 group-hover:text-primary" />
                </div>

                <h4 className="font-bold text-slate-900 truncate mb-1">{doc.name}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{doc.type}</p>

                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                   <div className="text-[10px] font-bold text-slate-500">
                      <p>{doc.date}</p>
                      <p className="opacity-60">{doc.size}</p>
                   </div>
                   <button className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                   </button>
                </div>
             </div>
           ))}

           {/* Upload Placeholder */}
           <button className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center gap-3 hover:bg-slate-50 hover:border-primary/30 transition-all text-slate-400 hover:text-primary group">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center border border-slate-200 group-hover:border-primary/30">
                 <Upload size={24} />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">Add Document</span>
           </button>
        </div>

        {/* Security Notice */}
        <div className="mt-20 p-8 border border-slate-100 rounded-lg bg-slate-50 flex items-start gap-6">
           <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shrink-0 border border-slate-100">
              <ShieldCheck size={24} className="text-emerald-500" />
           </div>
           <div>
              <h4 className="font-bold text-slate-900 mb-1">Privacy First Storage</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                 All documents uploaded to the Vault are encrypted using AES-256. ScholarshipConnectBD employees cannot access your private files. They are only shared with institutions when you explicitly click "Apply".
              </p>
           </div>
        </div>
      </div>
      </main>
    </div>
  );
}
