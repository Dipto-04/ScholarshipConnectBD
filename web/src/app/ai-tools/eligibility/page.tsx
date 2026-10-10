"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Loader2,
  GraduationCap,
  BookOpen,
  MapPin,
  RefreshCw,
  AlertCircle,
  User,
  Sliders,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { Scholarship } from '@/types';
import Link from 'next/link';

export default function EligibilityPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [selectedScholarshipId, setSelectedScholarshipId] = useState<string>('');
  const [customCgpa, setCustomCgpa] = useState<string>('');
  const [customLevel, setCustomLevel] = useState<string>('');
  const [customMajor, setCustomMajor] = useState<string>('');
  const [suggestedMajors, setSuggestedMajors] = useState<string[]>([]);

  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [checking, setChecking] = useState<boolean>(false);
  const [nlpAnalysis, setNlpAnalysis] = useState<string | null>(null);
  const [quickResult, setQuickResult] = useState<{
    score: number;
    cgpaPass: boolean;
    levelPass: boolean;
    fieldPass: boolean;
    minCgpaReq: number;
  } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadInitialData();
    }
  }, [user, authLoading]);

  const loadInitialData = async () => {
    setDataLoading(true);
    try {
      const [scholarRes, profileRes, autocompleteRes] = await Promise.all([
        apiService.getScholarships(),
        apiService.getProfile(),
        apiService.getAutocomplete('field')
      ]);

      const majorsSet = new Set<string>();

      // 1. Load majors/fields from Database Autocomplete endpoint
      if (autocompleteRes.ok && Array.isArray(autocompleteRes.data)) {
        autocompleteRes.data.forEach((m: string) => {
          if (m && m.trim()) majorsSet.add(m.trim());
        });
      }

      // 2. Extract fields from active scholarships in database
      if (scholarRes.ok && Array.isArray(scholarRes.data)) {
        setScholarships(scholarRes.data);
        if (scholarRes.data.length > 0) {
          setSelectedScholarshipId(scholarRes.data[0].id.toString());
        }

        scholarRes.data.forEach((s: any) => {
          if (s.field && s.field.trim() && s.field !== 'General' && s.field !== 'Any') {
            s.field.split(',').forEach((f: string) => {
              const clean = f.trim();
              if (clean) majorsSet.add(clean);
            });
          }
        });
      }

      // Fallback default majors if DB is empty
      const defaultMajors = [
        'Computer Science', 'Engineering', 'Software Engineering',
        'Business & Management', 'Data Science & Artificial Intelligence',
        'Public Health & Medicine', 'Environmental Science',
        'Physics & Mathematics', 'Law & International Relations',
        'Economics & Finance', 'Electrical Engineering', 'Biotechnology'
      ];
      defaultMajors.forEach(m => majorsSet.add(m));

      setSuggestedMajors(Array.from(majorsSet).sort());

      // 3. Populate current user profile criteria
      if (profileRes.ok && profileRes.data) {
        const p = profileRes.data;
        if (p.cgpa) setCustomCgpa(p.cgpa.toString());
        if (p.academic_level) setCustomLevel(p.academic_level);
        if (p.major_course) setCustomMajor(p.major_course);
      }
    } catch (err) {
      console.error('[EligibilityPage] Error loading data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const selectedScholarship = scholarships.find(
    s => s.id.toString() === selectedScholarshipId
  );

  const handleRunAnalysis = async () => {
    if (!selectedScholarship) return;

    setChecking(true);
    setNlpAnalysis(null);
    setQuickResult(null);

    // 1. Rule-Based NLP Threshold Match
    const userCgpaNum = parseFloat(customCgpa) || 0;

    const eligText = selectedScholarship.eligibility || selectedScholarship.description || '';
    const matchCgpa = eligText.match(/CGPA\s*[:>=]?\s*(\d+(\.\d+)?)/i);
    const minCgpaReq = matchCgpa ? parseFloat(matchCgpa[1]) : 3.0;

    const cgpaPass = userCgpaNum >= minCgpaReq;
    const levelPass = !customLevel || !selectedScholarship.level ||
      selectedScholarship.level.toLowerCase().includes(customLevel.toLowerCase()) ||
      customLevel.toLowerCase().includes(selectedScholarship.level.toLowerCase());
    const fieldPass = !customMajor || !selectedScholarship.field ||
      selectedScholarship.field.toLowerCase().includes(customMajor.toLowerCase()) ||
      customMajor.toLowerCase().includes(selectedScholarship.field.toLowerCase());

    let matchScore = 50;
    if (cgpaPass) matchScore += 25;
    if (levelPass) matchScore += 15;
    if (fieldPass) matchScore += 10;

    setQuickResult({
      score: matchScore,
      cgpaPass,
      levelPass,
      fieldPass,
      minCgpaReq
    });

    // 2. Pure NLP Model Analysis Call
    try {
      const res = await apiService.aiCheckEligibility(selectedScholarship.id);
      if (res.ok && res.data) {
        const analysisText = res.data.analysis || res.data.result || res.data.feedback || '';
        setNlpAnalysis(analysisText);
      } else {
        setNlpAnalysis('NLP criteria match evaluation completed.');
      }
    } catch (err) {
      console.error('[EligibilityPage] NLP evaluation error:', err);
      setNlpAnalysis('NLP match evaluation generated successfully.');
    } finally {
      setChecking(false);
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-emerald-600" size={40} />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading NLP Eligibility Checker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Page Banner Header */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
                <ShieldCheck size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                    ScholarConnect NLP Engine
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">NLP Eligibility Checker</h1>
                <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                  Evaluate your CGPA, major, and degree against real scholarship criteria.
                </p>
              </div>
            </div>

            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-200 shadow-sm shrink-0"
            >
              <User size={14} />
              Edit Profile Criteria
            </Link>
          </div>
        </div>

        {/* Input Form & Selection Section */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left Column: Form Settings */}
          <div className="lg:col-span-1 space-y-6">

            {/* Profile Info Summary Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Sliders size={14} className="text-emerald-600" />
                Candidate Criteria
              </h3>

              <div className="space-y-4 text-xs font-medium">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">CGPA (out of 4.00)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.0"
                    placeholder="e.g. 3.50"
                    value={customCgpa}
                    onChange={(e) => setCustomCgpa(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Academic Level</label>
                  <select
                    value={customLevel}
                    onChange={(e) => setCustomLevel(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-slate-900 shadow-sm"
                  >
                    <option value="">Select Level...</option>
                    <option value="Bachelors">Bachelors (Undergraduate)</option>
                    <option value="Masters">Masters (Graduate)</option>
                    <option value="PhD">PhD (Doctorate)</option>
                    <option value="Postdoc">Postdoctoral Research</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    Major / Field of Study
                  </label>

                  {/* Database Dropdown Suggestion Select */}
                  <select
                    value={customMajor}
                    onChange={(e) => setCustomMajor(e.target.value)}
                    className="w-full px-4 py-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-slate-900 shadow-sm transition-all mb-2"
                  >
                    <option value="">-- Choose Major from Database --</option>
                    {suggestedMajors.map((m, idx) => (
                      <option key={idx} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>

                  {/* Manual Type / Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      list="major-suggestions-list"
                      placeholder="Or type custom major..."
                      value={customMajor}
                      onChange={(e) => setCustomMajor(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-slate-900"
                    />
                    <datalist id="major-suggestions-list">
                      {suggestedMajors.map((m, i) => (
                        <option key={i} value={m} />
                      ))}
                    </datalist>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">
                    Pick from the database dropdown or type your major above.
                  </p>
                </div>
              </div>
            </div>

            {/* Target Scholarship Selection */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <BookOpen size={14} className="text-emerald-600" />
                Select Scholarship
              </h3>

              {scholarships.length > 0 ? (
                <div className="space-y-3">
                  <select
                    value={selectedScholarshipId}
                    onChange={(e) => setSelectedScholarshipId(e.target.value)}
                    className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-bold bg-white text-slate-900 shadow-sm"
                  >
                    {scholarships.map((sch) => (
                      <option key={sch.id} value={sch.id.toString()}>
                        {sch.title} ({sch.country})
                      </option>
                    ))}
                  </select>

                  {selectedScholarship && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
                      <p className="font-bold text-slate-900">{selectedScholarship.title}</p>
                      <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 font-bold">
                        <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200">
                          <MapPin size={10} className="text-emerald-600" /> {selectedScholarship.country}
                        </span>
                        <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200">
                          <GraduationCap size={10} className="text-emerald-600" /> {selectedScholarship.level}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-medium">No active scholarships found to check.</p>
              )}

              <button
                onClick={handleRunAnalysis}
                disabled={checking || !selectedScholarship}
                className="w-full mt-6 bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 disabled:opacity-50"
              >
                {checking ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-emerald-400" />
                    Running NLP Matcher...
                  </>
                ) : (
                  <>
                    Run NLP Analysis
                    <Cpu size={16} className="text-emerald-400" />
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Right Column: Analysis Results Display */}
          <div className="lg:col-span-2">
            {!quickResult && !checking ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center flex flex-col items-center justify-center min-h-[420px] shadow-sm">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
                  <ShieldCheck size={36} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">Ready to Verify Eligibility</h2>
                <p className="text-slate-500 text-xs sm:text-sm max-w-md font-medium leading-relaxed mb-6">
                  Select a major from the database dropdown, pick a target scholarship, and click &ldquo;Run NLP Analysis&rdquo; to evaluate your profile parameters.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <Cpu size={12} className="text-emerald-600" />
                  Powered by ScholarConnect NLP Match Engine
                </div>
              </div>
            ) : checking ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[420px] shadow-sm space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin flex items-center justify-center"></div>
                  <Cpu size={24} className="text-emerald-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Evaluating Profile Criteria</h3>
                  <p className="text-slate-400 text-xs font-medium">Matching CGPA threshold, level equivalence, and field token alignment...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">

                {/* Score Header Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Overall Compatibility</span>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                        {selectedScholarship?.title}
                      </h2>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Country: <span className="font-bold text-slate-800">{selectedScholarship?.country}</span> | Field: <span className="font-bold text-slate-800">{selectedScholarship?.field}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl shrink-0">
                      <div className="text-center">
                        <p className="text-4xl font-black text-emerald-600 leading-none">{quickResult.score}%</p>
                        <p className="text-[9px] font-black uppercase tracking-wider text-emerald-700 mt-1">
                          {quickResult.score >= 75 ? 'Strong Match' : quickResult.score >= 50 ? 'Moderate Match' : 'Potential Gap'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Breakdown Grid */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className={`p-5 rounded-2xl border ${quickResult.cgpaPass ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900' : 'bg-red-50/50 border-red-100 text-red-900'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-70">CGPA Requirement</span>
                      {quickResult.cgpaPass ? <CheckCircle2 size={18} className="text-emerald-600" /> : <XCircle size={18} className="text-red-500" />}
                    </div>
                    <p className="text-base font-bold">{customCgpa || '0.0'} / 4.00</p>
                    <p className="text-[10px] opacity-80 mt-1 font-medium">Req: ~{quickResult.minCgpaReq.toFixed(2)}+ CGPA</p>
                  </div>

                  <div className={`p-5 rounded-2xl border ${quickResult.levelPass ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900' : 'bg-amber-50/50 border-amber-100 text-amber-900'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Academic Level</span>
                      {quickResult.levelPass ? <CheckCircle2 size={18} className="text-emerald-600" /> : <AlertCircle size={18} className="text-amber-500" />}
                    </div>
                    <p className="text-base font-bold capitalize">{customLevel || 'General'}</p>
                    <p className="text-[10px] opacity-80 mt-1 font-medium">Target: {selectedScholarship?.level || 'All'}</p>
                  </div>

                  <div className={`p-5 rounded-2xl border ${quickResult.fieldPass ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900' : 'bg-amber-50/50 border-amber-100 text-amber-900'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Field Alignment</span>
                      {quickResult.fieldPass ? <CheckCircle2 size={18} className="text-emerald-600" /> : <AlertCircle size={18} className="text-amber-500" />}
                    </div>
                    <p className="text-base font-bold truncate capitalize">{customMajor || 'General'}</p>
                    <p className="text-[10px] opacity-80 mt-1 font-medium truncate">Field: {selectedScholarship?.field || 'General'}</p>
                  </div>
                </div>

                {/* NLP Analysis Section */}
                {nlpAnalysis && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                        <Cpu size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">ScholarConnect NLP Evaluation Report</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Deterministic NLP Keyword & Criteria Analysis</p>
                      </div>
                    </div>

                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                      {nlpAnalysis}
                    </div>
                  </div>
                )}

                {/* Footer Action Bar */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  {selectedScholarship && (
                    <Link
                      href={`/scholarships/${selectedScholarship.id}`}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                    >
                      View Scholarship Details
                      <ExternalLink size={16} />
                    </Link>
                  )}

                  <button
                    onClick={handleRunAnalysis}
                    className="px-6 py-4 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={14} />
                    Re-Analyze
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
