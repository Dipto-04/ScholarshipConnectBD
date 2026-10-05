"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowLeft,
  Briefcase,
  User,
  Phone,
  Mail,
  GraduationCap,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MessageSquare
} from 'lucide-react';

export default function AgencyApplyPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const scholarshipTitle = searchParams.get('title') || 'Scholarship';
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [agencyAdminId, setAgencyAdminId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    university: '',
    cgpa: '',
    ielts: '',
    academicLevel: '',
    sop: 'I am requesting agency processing for this application. Please contact me for further details and document collection.',
  });

  const [vaultDocs, setVaultDocs] = useState<any[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');

    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.full_name || '',
        email: user.email || '',
      }));

      const loadProfileAndDocs = async () => {
        try {
          const [profileRes, docRes] = await Promise.all([
            apiService.getProfile(),
            apiService.getDocuments()
          ]);

          if (profileRes.ok) {
            const p = profileRes.data;
            setFormData(prev => ({
              ...prev,
              phone: p.phone_number || '',
              university: p.university || '',
              cgpa: p.cgpa ? p.cgpa.toString() : '',
              ielts: p.ielts_score ? p.ielts_score.toString() : '',
              academicLevel: p.academic_level || '',
            }));
          }

          if (docRes.ok) {
            setVaultDocs(docRes.data || []);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setDocsLoading(false);
        }
      };
      loadProfileAndDocs();
    }
  }, [user, authLoading]);

  const hasCV = vaultDocs.some(d => d.doc_type === 'CV' || d.name.toLowerCase().includes('cv') || d.name.toLowerCase().includes('resume'));
  const hasTranscript = vaultDocs.some(d => d.doc_type === 'Transcript' || d.name.toLowerCase().includes('transcript'));
  const hasPassport = vaultDocs.some(d => d.doc_type === 'Passport' || d.name.toLowerCase().includes('passport'));
  const hasAllRequired = hasCV && hasTranscript && hasPassport;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone) {
      alert('Please fill in required contact information.');
      return;
    }

    if (!hasAllRequired) {
      alert('Missing required documents in the Vault.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        scholarship: id,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        university: formData.university,
        cgpa: formData.cgpa || null,
        ielts_score: formData.ielts || null,
        academic_level: formData.academicLevel,
        sop: formData.sop,
        application_type: 'Agency',
        documents: vaultDocs.map(d => d.id),
      };

      const res = await apiService.applyForScholarship(payload);
      if (res.ok) {
        if (res.data?.agency_admin_id) {
          setAgencyAdminId(res.data.agency_admin_id);
        }
        setSuccess(true);
      } else {
        alert(res.data?.error || 'Failed to submit agency request.');
      }
    } catch (error) {
      alert('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 border border-emerald-100">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Request Received!</h1>
        <p className="text-slate-500 max-w-md mb-10 leading-relaxed font-medium">
          Your request for Premium Agency Processing has been submitted successfully.
          Our expert consultants have been notified and a chat thread has been created for you.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          {agencyAdminId && (
            <button
              onClick={() => router.replace(`/messages/${agencyAdminId}`)}
              className="flex-1 bg-purple-600 text-white py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition-all shadow-xl shadow-purple-100"
            >
              <MessageSquare size={20} />
              Chat with Agent
            </button>
          )}
          <button
            onClick={() => router.replace('/profile/applications')}
            className="flex-1 bg-slate-900 text-white py-4 rounded-lg font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-100"
          >
            My Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-10 lg:py-16">
        <div className="bg-white border border-slate-200 rounded-sm p-8 md:p-12 shadow-sm">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-black uppercase tracking-widest mb-10"
          >
            <ArrowLeft size={16} />
            Back to Scholarship
          </button>

          <header className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center border border-purple-100 shadow-sm">
                <Briefcase size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Expert Agency Service</h1>
                <p className="text-slate-500 text-sm font-medium">Professional submission & document verification.</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-6 rounded-lg">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Target Scholarship</span>
               <h2 className="text-lg font-bold text-slate-900">{scholarshipTitle}</h2>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 ml-1">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text" required
                      className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 ml-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email" required
                      className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 ml-1">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                    <input
                      type="tel" required
                      placeholder="e.g. +8801700000000"
                      className="w-full pl-12 pr-4 py-4 border border-primary/30 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Info */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">Academic Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 ml-1">CGPA</label>
                  <input
                    type="number" step="0.01"
                    className="w-full p-4 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                    value={formData.cgpa}
                    onChange={(e) => setFormData({...formData, cgpa: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 ml-1">IELTS/TOEFL</label>
                  <input
                    type="number" step="0.1"
                    className="w-full p-4 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                    value={formData.ielts}
                    onChange={(e) => setFormData({...formData, ielts: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 ml-1">Level</label>
                  <input
                    type="text"
                    className="w-full p-4 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                    value={formData.academicLevel}
                    onChange={(e) => setFormData({...formData, academicLevel: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* SOP Draft */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-3 mb-6">Initial Draft / Message</h3>
              <textarea
                rows={5}
                className="w-full p-6 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium resize-none"
                placeholder="Any specific requests for our experts?"
                value={formData.sop}
                onChange={(e) => setFormData({...formData, sop: e.target.value})}
              />
            </div>

            {/* Document Check */}
            <div className={`p-8 rounded-lg border transition-all ${
              hasAllRequired ? 'bg-emerald-50/30 border-emerald-100' : 'bg-red-50/30 border-red-100'
            }`}>
              <div className="flex items-start gap-5">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border ${
                  hasAllRequired ? 'bg-white text-emerald-500 border-emerald-100' : 'bg-white text-red-500 border-red-100'
                }`}>
                  <ShieldCheck size={24} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold text-lg mb-2 ${hasAllRequired ? 'text-emerald-700' : 'text-red-700'}`}>
                    {hasAllRequired ? 'Required Documents Ready' : 'Required Documents Missing'}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
                    To submit an agency request, you must have the following uploaded in your <span className="font-bold text-slate-900">Document Vault</span>:
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {hasCV ? <CheckCircle2 className="text-emerald-500" size={18} /> : <XCircle className="text-red-500" size={18} />}
                      <span className="text-xs font-bold text-slate-700">CV / Resume</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {hasTranscript ? <CheckCircle2 className="text-emerald-500" size={18} /> : <XCircle className="text-red-500" size={18} />}
                      <span className="text-xs font-bold text-slate-700">Academic Transcript</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {hasPassport ? <CheckCircle2 className="text-emerald-500" size={18} /> : <XCircle className="text-red-500" size={18} />}
                      <span className="text-xs font-bold text-slate-700">Passport Copy</span>
                    </div>
                  </div>

                  {!hasAllRequired && (
                    <button
                      type="button"
                      onClick={() => router.push('/profile/documents')}
                      className="mt-8 px-6 py-3 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-100"
                    >
                      Go to Document Vault
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-slate-100 space-y-6">
              <button
                type="submit"
                disabled={loading || !hasAllRequired}
                className="w-full py-5 bg-purple-600 text-white rounded-lg font-black text-xs uppercase tracking-[0.2em] hover:bg-purple-700 transition-all shadow-2xl shadow-purple-200 disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none flex items-center justify-center gap-3"
              >
                {loading ? 'Submitting Request...' : 'Submit Request to Agency'}
                <ShieldCheck size={20} />
              </button>

              <div className="flex items-start gap-3 text-[10px] text-slate-400 font-medium leading-relaxed text-center px-10">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <p>
                  By submitting this request, you agree that our consultants can contact you regarding your application.
                  A service fee will be discussed before any official processing begins.
                </p>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
