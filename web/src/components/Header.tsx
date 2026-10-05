"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useMentorMode } from '@/context/MentorModeContext';
import { usePathname } from 'next/navigation';
import {
  Users,
  GraduationCap,
  MessageSquare,
  Home as HomeIcon,
  Calendar,
  Bookmark,
  Bell,
  Menu,
  X,
  Briefcase,
  Search,
  Grid,
  Settings,
  ShieldCheck,
  Send,
  FileText,
  Star,
  LineChart,
  History,
  Info,
  Lock,
  ArrowRight,
  Trophy,
  LayoutDashboard,
  UserCheck,
  Radio,
  Activity
} from 'lucide-react';

export default function Header() {
  const { user, loading } = useAuth();
  const { isMentorMode, toggleMentorMode } = useMentorMode();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const studentNav = [
    { name: 'Scholarships', href: '/scholarships', icon: GraduationCap },
    { name: 'Deadlines', href: '/calendar', icon: Calendar },
    { name: 'Home', href: '/home', icon: HomeIcon },
    { name: 'Application', href: '/profile/applications', icon: Bookmark },
    { name: 'Community', href: '/community', icon: MessageSquare },
  ];

  const mentorNav = [
    { name: 'Sessions', href: '/mentorship/sessions', icon: Briefcase },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Home', href: '/home', icon: HomeIcon },
    { name: 'Community', href: '/community', icon: Users },
  ];

  const adminNav = [
    { name: 'Console', href: '/admin', icon: LayoutDashboard },
    { name: 'Scholarships', href: '/admin/scholarships', icon: GraduationCap },
    { name: 'Applications', href: '/admin/applications', icon: FileText },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Mentors', href: '/admin/mentors', icon: UserCheck },
  ];

  const adminSubNav = [
    { name: 'Console', href: '/admin', icon: LayoutDashboard },
    { name: 'Scholarships', href: '/admin/scholarships', icon: GraduationCap },
    { name: 'Applications', href: '/admin/applications', icon: FileText },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Mentors', href: '/admin/mentors', icon: UserCheck },
    { name: 'Broadcast', href: '/admin/broadcast', icon: Radio },
    { name: 'Moderation', href: '/admin/moderation', icon: ShieldCheck },
    { name: 'Analytics', href: '/admin/analytics', icon: Activity },
    { name: 'Logs', href: '/admin/logs', icon: History },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const isAdminPath = pathname.startsWith('/admin');
  const currentNav = (isMentorMode && user?.is_mentor && user?.is_staff)
    ? mentorNav
    : studentNav;

  if (isAdminPath && user?.is_staff) {
    return (
      <header className="bg-white sticky top-0 z-50 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Admin Header Top Bar */}
          <div className="flex justify-between items-center h-16 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-slate-900 text-white rounded-none flex items-center justify-center font-black text-base shadow-md">
                  S
                </div>
                <div className="flex flex-col">
                  <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 leading-none">
                    ScholarshipConnect<span className="text-primary">BD</span>
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Admin Console
                  </span>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/home"
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-none text-xs font-bold transition-all border border-slate-200 shadow-sm"
              >
                <ArrowRight size={14} className="rotate-180 text-slate-500" />
                <span className="hidden sm:inline">Exit to Main App</span>
                <span className="sm:hidden">Exit</span>
              </Link>

              <Link href="/profile" className="flex items-center gap-2 pl-2 border-l border-slate-100">
                <div className="w-8 h-8 bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 overflow-hidden rounded-none">
                  {(user.avatar || (user as any).avatar_url) ? (
                    <img src={user.avatar || (user as any).avatar_url} className="w-full h-full object-cover rounded-none" alt="" />
                  ) : user.full_name?.charAt(0) || 'A'}
                </div>
              </Link>
            </div>
          </div>

          {/* Admin Navigation Links */}
          <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto scrollbar-hide">
            {adminSubNav.map((sub) => {
              const isSubActive = sub.href === '/admin' ? pathname === '/admin' : pathname.startsWith(sub.href);
              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap rounded-none ${
                    isSubActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <sub.icon size={15} />
                  <span>{sub.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="bg-white sticky top-0 z-50 border-b border-slate-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Search Bar */}
            <div className="flex items-center gap-3 flex-1 max-w-md mr-4">
              <Link href={isAdminPath ? "/admin" : (user ? "/home" : "/")} className="flex items-center gap-2 shrink-0">
                <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  <img src="/logo.png" className="w-full h-full object-cover" alt="ScholarshipConnectBD Logo" onError={(e) => {
                    // Fallback to text if image not found yet
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }} />
                  <div style={{ display: 'none' }} className="w-full h-full bg-primary flex items-center justify-center text-white font-bold">S</div>
                </div>
                <span className="text-base font-black text-slate-900 tracking-tight hidden md:block">ScholarshipConnect<span className="text-primary">BD</span></span>
                {isAdminPath && (
                  <span className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border border-slate-700 ml-1">
                    Admin
                  </span>
                )}
              </Link>

              {!isAdminPath && user && (
                <div className="hidden sm:block relative w-full max-w-[280px]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full bg-slate-100 border border-transparent rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              )}
            </div>

            {/* COMMENTED OUT FOR FUTURE USE: Desktop Navigation Bar */}
            {/*
            {!isAdminPath && (
              <div className="hidden lg:flex items-center h-full gap-1">
                {user && currentNav.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`h-full flex flex-col items-center justify-center px-4 relative min-w-[85px] transition-all border-b-2 ${
                        isActive
                          ? 'border-primary text-primary font-semibold'
                          : 'border-transparent text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      <item.icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                      <span className="text-[11px] mt-1 font-medium tracking-wide">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
            */}

            {/* User Actions & Mobile Hamburger */}
            <div className="flex items-center gap-2 sm:gap-4">
              {isAdminPath && (
                <Link
                  href="/home"
                  className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                >
                  <ArrowRight size={14} className="rotate-180" />
                  Exit Admin
                </Link>
              )}

              {/* COMMENTED OUT FOR FUTURE USE: Grid Menu Button
              {user && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all mr-1"
                  title="Menu"
                >
                  <Grid size={22} strokeWidth={1.8} />
                </button>
              )}
              */}

              {!loading && user ? (
                <>
                  <Link href="/notifications" className="text-slate-400 hover:text-primary transition-colors relative p-1">
                     <Bell size={20} />
                     <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
                  </Link>

                  {!isAdminPath && user.is_mentor && user.is_staff && (
                    <button
                      onClick={toggleMentorMode}
                      className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors border-l border-slate-100 pl-4"
                    >
                       {isMentorMode ? 'Student Mode' : 'Mentor Mode'}
                    </button>
                  )}

                  <Link href="/profile" className="flex items-center gap-2 border-l border-slate-100 pl-2 sm:pl-4">
                    <div className="w-9 h-9 bg-gray-50 border border-black/5 rounded-xl flex items-center justify-center text-primary text-sm font-bold hover:shadow-md transition-all overflow-hidden">
                      {(user.avatar || (user as any).avatar_url || (user as any).profile_picture_url) ? (
                        <img src={user.avatar || (user as any).avatar_url || (user as any).profile_picture_url} className="w-full h-full object-cover rounded-xl" alt="avatar" />
                      ) : user.full_name?.charAt(0)}
                    </div>
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/login" className="text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">Login</Link>
                  <Link href="/register" className="bg-primary text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all">Join</Link>
                </div>
              )}
            </div>
          </div>
        </nav>

        {isAdminPath && user?.is_staff && (
          <div className="bg-slate-900 text-white text-xs border-t border-slate-800 px-4 sm:px-6 py-2.5">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 shrink-0 pr-3 sm:pr-4 border-r border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-black text-[10px] tracking-widest uppercase text-slate-300">Admin Portal</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide py-0.5">
                {adminSubNav.map((sub) => {
                  const isSubActive = sub.href === '/admin' ? pathname === '/admin' : pathname.startsWith(sub.href);
                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${
                        isSubActive
                          ? 'bg-primary text-white shadow-md shadow-primary/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <sub.icon size={14} />
                      <span>{sub.name}</span>
                    </Link>
                  );
                })}
              </div>
              <Link
                href="/home"
                className="hidden md:flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors shrink-0 pl-4 border-l border-slate-800"
              >
                <ArrowRight size={12} className="rotate-180" />
                User App
              </Link>
            </div>
          </div>
        )}

        {/* COMMENTED OUT FOR FUTURE USE: Apps Dropdown Menu
        {mobileMenuOpen && user && (
          <div className="absolute top-16 right-4 sm:right-8 w-[300px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-[60] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 border border-slate-200 text-primary rounded-lg flex items-center justify-center font-bold text-xs overflow-hidden">
                  {(user as any).avatar || (user as any).avatar_url || (user as any).profile_picture_url ? (
                    <img src={(user as any).avatar || (user as any).avatar_url || (user as any).profile_picture_url} className="w-full h-full object-cover" alt="" />
                  ) : user.full_name?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{user.full_name}</h4>
                  <p className="text-[9px] font-bold text-primary uppercase tracking-wider">Scholar Pro</p>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[350px] overflow-y-auto p-2 space-y-0.5">
              {[
                { name: 'Dashboard', icon: Trophy, href: '/profile' },
                ...((user as any).is_staff ? [{ name: 'Admin Console', icon: ShieldCheck, href: '/admin' }] : []),
                { name: 'My Applications', icon: Send, href: '/profile/applications' },
                { name: 'Document Vault', icon: FileText, href: '/profile/documents' },
                { name: 'Saved Scholarships', icon: Bookmark, href: '/scholarships?filter=saved' },
                { name: 'Leaderboard', icon: Star, href: '/community/leaderboard' },
                { name: 'My Insights', icon: LineChart, href: '/profile/progress' },
                { name: 'History & Activity', icon: History, href: '/profile/activity' },
                { name: 'Find Mentors', icon: Users, href: '/mentorship' },
                { name: 'Notifications', icon: Bell, href: '/notifications' },
                { name: 'Account Settings', icon: Settings, href: '/profile/settings' },
                { name: 'Privacy Policy', icon: Lock, href: '/privacy' },
              ].map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
                    }`}
                  >
                    <item.icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {user.is_mentor && (
              <div className="p-2 bg-slate-50 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => {
                     toggleMentorMode();
                     setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-wider text-slate-700 hover:bg-slate-100 transition-all"
                >
                  {isMentorMode ? 'Student' : 'Mentor'} Mode
                </button>
              </div>
            )}
          </div>
        )}
        */}
      </header>

      {/* COMMENTED OUT FOR FUTURE USE: Bottom Navigation Bar */}
      {/*
      {!isAdminPath && user && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 z-[100] px-2 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] flex justify-around items-center h-20">
          {currentNav.map((item) => {
            const isActive = pathname === item.href;
            const isCenterHome = item.name === 'Home';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 transition-all relative ${
                  isActive ? 'text-teal-600' : 'text-slate-400'
                }`}
              >
                <div className={`flex items-center justify-center transition-all ${
                  isCenterHome
                    ? 'w-14 h-14 bg-white rounded-full border border-slate-100 -mt-10 shadow-lg text-slate-700'
                    : 'w-7 h-7'
                } ${isActive && !isCenterHome ? 'scale-110' : ''} ${isActive && isCenterHome ? 'text-teal-600 border-teal-100' : ''}`}>
                  <item.icon size={isCenterHome ? 26 : 22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-bold tracking-tight mt-1.5 transition-colors ${
                  isActive ? 'text-teal-600' : 'text-slate-400'
                }`}>
                  {item.name}
                </span>
                {isActive && !isCenterHome && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-teal-600 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </div>
      )}
      */}
    </>
  );
}
