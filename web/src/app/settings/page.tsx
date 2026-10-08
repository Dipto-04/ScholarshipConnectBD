"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import {
  Bell,
  Lock,
  User,
  Globe,
  Shield,
  Moon,
  ChevronRight,
  LogOut,
  Mail,
  Smartphone,
  CreditCard,
  Zap,
  Info,
  ExternalLink,
  HelpCircle,
  AlertTriangle,
  Award,
  Bookmark
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';

export default function SettingsPage() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
       await apiService.logout();
       router.push('/');
    }
  };

  const toggleMentorStatus = async (value: boolean) => {
    setUpdating(true);
    const res = await apiService.updateProfile({ is_mentor: value });
    if (res.ok) {
      await refreshProfile();
      alert(value ? 'You are now a Mentor!' : 'Mentor status disabled.');
    } else {
      alert('Failed to update status.');
    }
    setUpdating(false);
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-500 text-sm font-medium">Manage your account preferences and security.</p>
        </header>

        {/* Premium Banner */}
        <div
          onClick={() => router.push('/upgrade-pro')}
          className="mb-12 bg-slate-900 rounded-[32px] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer hover:shadow-2xl hover:shadow-primary/20 transition-all border border-white/10 group"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-primary/20 rounded-3xl flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform">
              <Zap size={32} className="fill-current" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">{user.is_pro ? 'You are a Pro Member' : 'Upgrade to ScholarConnect Pro'}</h2>
              <p className="text-white/60 text-sm font-medium">
                {user.is_pro
                  ? 'Accessing all premium features and AI tools'
                  : `Use ${user.scholar_points || 0}/200 points to unlock lifetime access`}
              </p>
            </div>
          </div>
          <button className="bg-white text-slate-900 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
            {user.is_pro ? 'Manage' : 'Upgrade Now'}
          </button>
        </div>

        <div className="space-y-12">
           {/* Account Section */}
           <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Account & Security</h3>
              <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden divide-y divide-slate-50 shadow-sm">
                 <div onClick={() => router.push('/profile')} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                          <User size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900">Personal Details</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Email, phone, and academic scores</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400">{user.email}</span>
                      <ChevronRight size={18} className="text-slate-300" />
                    </div>
                 </div>

                 <div className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                          <Lock size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900">Security Password</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Update your login credentials</p>
                       </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                 </div>

                 <div className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                          <Smartphone size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900">Linked Accounts</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Firebase & Social Auth</p>
                       </div>
                    </div>
                    <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full font-bold text-slate-500 uppercase">Verified</span>
                 </div>
              </div>
           </section>

           {/* Subscription */}
           <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Subscription & Billing</h3>
              <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden divide-y divide-slate-50 shadow-sm">
                 <div className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center">
                          <CreditCard size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900">Payment Methods</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manage your cards and billing info</p>
                       </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                 </div>
              </div>
           </section>

           {/* Academic & Tools */}
           <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Academic & Tools</h3>
              <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden divide-y divide-slate-50 shadow-sm">
                 <div onClick={() => router.push('/ai-tools/matchmaker')} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                          <Zap size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900">AI Matchmaker</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Configure matching preferences</p>
                       </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                 </div>

                 <div onClick={() => router.push('/profile/applications')} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                          <Bookmark size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900">Application Tracker</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Monitor your submission status</p>
                       </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                 </div>
              </div>
           </section>

           {/* Notifications */}
           <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Notifications</h3>
              <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden divide-y divide-slate-50 shadow-sm">
                 <div className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <Bell size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900">Email Notifications</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Scholarship alerts & news</p>
                       </div>
                    </div>
                    <button className="w-12 h-6 rounded-full relative transition-all bg-primary">
                       <div className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all right-1"></div>
                    </button>
                 </div>

                 <div className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                          <Mail size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900">Newsletter</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Weekly digest of opportunities</p>
                       </div>
                    </div>
                    <button className="w-12 h-6 rounded-full relative transition-all bg-slate-200">
                       <div className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all left-1"></div>
                    </button>
                 </div>
              </div>
           </section>

           {/* App Preferences */}
           <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">App Preferences</h3>
              <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden divide-y divide-slate-50 shadow-sm">
                 <div className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                          <Moon size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900">Dark Mode</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Toggle appearance theme</p>
                       </div>
                    </div>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={`w-12 h-6 rounded-full relative transition-all ${darkMode ? 'bg-primary' : 'bg-slate-200'}`}
                    >
                       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${darkMode ? 'right-1' : 'left-1'}`}></div>
                    </button>
                 </div>

                 <div className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center">
                          <Globe size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900">Language</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Bengali / English</p>
                       </div>
                    </div>
                    <select className="text-[10px] font-bold bg-slate-50 border-none outline-none px-3 py-1 rounded-lg uppercase tracking-widest">
                       <option>English</option>
                       <option>Bengali</option>
                    </select>
                 </div>
              </div>
           </section>

           {/* Mentorship & Community */}
           <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Mentorship & Community</h3>
              <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden divide-y divide-slate-50 shadow-sm">
                 <div className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                          <Award size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900">Become a Mentor</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Help others with their journey</p>
                       </div>
                    </div>
                    <button
                      disabled={updating}
                      onClick={() => toggleMentorStatus(!user.is_mentor)}
                      className={`w-12 h-6 rounded-full relative transition-all ${user.is_mentor ? 'bg-primary' : 'bg-slate-200'} ${updating ? 'opacity-50' : ''}`}
                    >
                       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${user.is_mentor ? 'right-1' : 'left-1'}`}></div>
                    </button>
                 </div>

                 {user.is_mentor && (
                   <div onClick={() => router.push('/profile')} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center">
                            <Info size={20} />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-900">Mentorship Bio & Expertise</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Setup your mentor profile</p>
                         </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300" />
                   </div>
                 )}
              </div>
           </section>

           {/* Support & Legal */}
           <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Support & Legal</h3>
              <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden divide-y divide-slate-50 shadow-sm">
                 <div className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center">
                          <HelpCircle size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900">User Manual</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">How to use the platform</p>
                       </div>
                    </div>
                    <ExternalLink size={16} className="text-slate-300" />
                 </div>

                 <div onClick={() => router.push('/privacy')} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center">
                          <Shield size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900">Privacy Policy</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">How we handle your data</p>
                       </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                 </div>

                 <div className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                          <AlertTriangle size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900">Report a Bug</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Help us improve</p>
                       </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                 </div>
              </div>
           </section>

                 <div className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                          <AlertTriangle size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900">Report a Bug</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Help us improve</p>
                       </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                 </div>
              </div>
           </section>

           {/* Admin Portal */}
           {user.is_staff && (
             <section>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Admin Dashboard</h3>
                <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden divide-y divide-slate-50 shadow-sm">
                   <div onClick={() => router.push('/admin')} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                            <Shield size={20} />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-900">Scholarship Management</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Review & verify submissions</p>
                         </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300" />
                   </div>
                </div>
             </section>
           )}

           {/* Danger Zone */}
           <section className="pt-6 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 p-8 border border-red-100 bg-red-50/30 rounded-[32px] text-red-600 hover:bg-red-50 transition-all group"
              >
                 <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                    <LogOut size={24} />
                 </div>
                 <div className="text-left">
                    <p className="text-sm font-black uppercase tracking-widest">Sign Out</p>
                    <p className="text-[10px] font-bold opacity-70">Exit your session securely</p>
                 </div>
              </button>
           </section>
        </div>

        <div className="mt-12 text-center">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">ScholarshipConnect BD — Version 1.2.0</p>
        </div>
      </main>
    </div>
  );
}
