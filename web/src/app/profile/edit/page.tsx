"use client";

// Force refresh for routing
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { ArrowLeft, Save, Loader2, User, Phone, BookOpen, GraduationCap, MapPin, Globe, Star, Award } from 'lucide-react';

export default function EditProfilePage() {
  const { user, refreshProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    phone_number: '',
    university: '',
    current_level: 'Undergraduate',
    cgpa: '',
    current_location: 'Bangladesh',
    skills: '',
    target_countries: '',
    research_interests: '',
    ielts_score: '',
    gre_score: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        bio: (user as any).bio || '',
        phone_number: (user as any).phone_number || '',
        university: (user as any).university || '',
        current_level: (user as any).current_level || 'Undergraduate',
        cgpa: (user as any).cgpa || '',
        current_location: (user as any).current_location || 'Bangladesh',
        skills: (user as any).skills || '',
        target_countries: (user as any).target_countries || '',
        research_interests: (user as any).research_interests || '',
        ielts_score: (user as any).ielts_score || '',
        gre_score: (user as any).gre_score || '',
      });
    }
  }, [user, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await apiService.updateProfile(formData);
      if (res.ok) {
        await refreshProfile();
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => router.push('/profile'), 1500);
      } else {
        setMessage({ type: 'error', text: res.data?.message || 'Failed to update profile.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-8 font-bold text-sm"
        >
          <ArrowLeft size={16} />
          Back to Profile
        </button>

        <div className="bg-white rounded-lg border border-black/5 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Edit Your Profile</h1>
              <p className="text-text-secondary text-sm">Update your information to get better scholarship matches.</p>
            </div>
            <User className="text-primary/20" size={40} />
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            {message.text && (
              <div className={`p-4 rounded-xl text-sm font-bold border ${
                message.type === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
              }`}>
                {message.text}
              </div>
            )}

            {/* Basic Info */}
            <section>
              <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                <User size={16} /> Basic Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    value={formData.full_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone_number"
                    placeholder="+880 1XXX-XXXXXX"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    value={formData.phone_number}
                    onChange={handleChange}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Short Bio</label>
                  <textarea
                    name="bio"
                    rows={3}
                    placeholder="Tell us about yourself..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium resize-none"
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            {/* Academic Info */}
            <section>
              <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                <GraduationCap size={16} /> Academic Background
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">University/Institution</label>
                  <input
                    type="text"
                    name="university"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    value={formData.university}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Current Degree Level</label>
                  <select
                    name="current_level"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium appearance-none"
                    value={formData.current_level}
                    onChange={handleChange}
                  >
                    <option>HSC/A-Level</option>
                    <option>Undergraduate</option>
                    <option>Postgraduate</option>
                    <option>PhD</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Current CGPA</label>
                  <input
                    type="text"
                    name="cgpa"
                    placeholder="e.g. 3.85"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    value={formData.cgpa}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Location (City)</label>
                  <input
                    type="text"
                    name="current_location"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    value={formData.current_location}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            {/* Test Scores */}
            <section>
              <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                <Award size={16} /> Test Scores
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">IELTS Band</label>
                  <input
                    type="text"
                    name="ielts_score"
                    placeholder="e.g. 7.5"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    value={formData.ielts_score}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">GRE Score</label>
                  <input
                    type="text"
                    name="gre_score"
                    placeholder="e.g. 320"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    value={formData.gre_score}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            {/* Matchmaker Preferences */}
            <section>
              <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                <Star size={16} /> Matchmaker Preferences
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Target Countries (comma separated)</label>
                  <input
                    type="text"
                    name="target_countries"
                    placeholder="USA, Germany, Canada, UK"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    value={formData.target_countries}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Research Interests / Subjects</label>
                  <input
                    type="text"
                    name="research_interests"
                    placeholder="AI, Renewable Energy, Economics"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    value={formData.research_interests}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Skills (comma separated)</label>
                  <input
                    type="text"
                    name="skills"
                    placeholder="Python, Public Speaking, Writing"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    value={formData.skills}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            <div className="pt-8 border-t border-gray-50 flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-white py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save Changes</>}
              </button>
              <button
                type="button"
                onClick={() => router.push('/profile')}
                className="px-8 py-4 bg-white border border-gray-200 text-gray-500 rounded-lg font-bold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
