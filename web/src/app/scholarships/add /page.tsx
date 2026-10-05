"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Globe,
  Briefcase,
  GraduationCap,
  Link as LinkIcon,
  ImageIcon,
  CheckCircle2
} from 'lucide-react';

export default function AddScholarshipPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isOngoing, setIsOngoing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    provider: '',
    country: '',
    amount: '',
    category: '',
    level: '',
    field: '',
    min_cgpa: '',
    deadline: '',
    description: '',
    eligibility: '',
    official_link: '',
    image_url: '',
  });

  if (authLoading) return null;
  if (!user) {
    router.push('/login');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      alert('Please fill in the Scholarship Title');
      return;
    }

    if (!isOngoing && !formData.deadline) {
      alert('Please provide a deadline or mark it as Ongoing');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        let value = (formData as any)[key];

        // If it's ongoing, don't send the deadline field at all
        if (key === 'deadline' && isOngoing) return;

        if (value !== '' && value !== null) data.append(key, value);
      });

      if (selectedImage) {
        data.append('image', selectedImage);
      }

      const res = await apiService.addScholarship(data);
      if (res.ok) {
        alert('Scholarship submitted successfully!');
        router.push('/scholarships');
      } else {
        alert('Failed to submit scholarship. Please check all fields.');
      }
    } catch (error) {
      console.error(error);
      alert('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-10 lg:py-16">
        <div className="bg-white border border-slate-200 rounded-sm p-8 md:p-12 shadow-sm">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest mb-10"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>

          <header className="mb-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Submit Scholarship</h1>
            <p className="text-slate-500 text-sm font-medium">Add a new opportunity to the database.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Basic Info */}
            <div className="space-y-6">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">Basic Information</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-700 ml-1">Scholarship Title *</label>
                     <input
                        type="text" name="title" required
                        placeholder="e.g. MEXT Research Scholarship"
                        className="w-full p-4 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                        value={formData.title} onChange={handleInputChange}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-700 ml-1">Provider</label>
                     <input
                        type="text" name="provider"
                        placeholder="e.g. Government of Japan"
                        className="w-full p-4 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                        value={formData.provider} onChange={handleInputChange}
                     />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-700 ml-1">Country</label>
                     <input
                        type="text" name="country"
                        placeholder="e.g. Japan"
                        className="w-full p-4 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                        value={formData.country} onChange={handleInputChange}
                     />
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between items-center ml-1">
                        <label className="text-xs font-bold text-slate-700">Application Deadline *</label>
                        <button
                           type="button"
                           onClick={() => setIsOngoing(!isOngoing)}
                           className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isOngoing ? 'text-primary' : 'text-slate-400'}`}
                        >
                           {isOngoing ? '✓ Marked as Ongoing' : 'No Deadline?'}
                        </button>
                     </div>
                     <div className="relative">
                        <Calendar className={`absolute left-4 top-1/2 -translate-y-1/2 ${isOngoing ? 'text-slate-200' : 'text-slate-400'}`} size={18} />
                        <input
                           type="date" name="deadline"
                           disabled={isOngoing}
                           className={`w-full pl-12 pr-4 py-4 border border-slate-200 rounded-lg outline-none transition-all text-sm font-medium ${isOngoing ? 'bg-slate-50 text-slate-300' : 'bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary'}`}
                           value={isOngoing ? '' : formData.deadline} onChange={handleInputChange}
                        />
                     </div>
                  </div>
               </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">Scholarship Details</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-700 ml-1">Benefit / Amount</label>
                     <input
                        type="text" name="amount"
                        placeholder="e.g. Fully Funded"
                        className="w-full p-4 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                        value={formData.amount} onChange={handleInputChange}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-700 ml-1">Study Level</label>
                     <select
                        name="level"
                        className="w-full p-4 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold bg-white"
                        value={formData.level} onChange={handleInputChange}
                     >
                        <option value="">Select Level</option>
                        <option value="Undergraduate">Undergraduate</option>
                        <option value="Masters">Masters</option>
                        <option value="PhD">PhD</option>
                        <option value="Short Course">Short Course</option>
                     </select>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-700 ml-1">Minimum CGPA Required</label>
                     <input
                        type="number" name="min_cgpa" step="0.01" min="0" max="5"
                        placeholder="e.g. 3.50"
                        className="w-full p-4 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                        value={formData.min_cgpa} onChange={handleInputChange}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-700 ml-1">Official Link</label>
                     <div className="relative">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                           type="url" name="official_link"
                           placeholder="https://..."
                           className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                           value={formData.official_link} onChange={handleInputChange}
                        />
                     </div>
                  </div>
               </div>
            </div>

            {/* Content & Media */}
            <div className="space-y-6">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">Description & Image</h3>
               <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 ml-1">Description</label>
                  <textarea
                     name="description" rows={5}
                     placeholder="Details about the scholarship..."
                     className="w-full p-4 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium resize-none"
                     value={formData.description} onChange={handleInputChange}
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 ml-1">Poster / Banner Image</label>
                  <div className={`relative border-2 border-dashed border-slate-200 rounded-lg p-10 text-center transition-all ${previewUrl ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'}`}>
                     {previewUrl ? (
                        <div className="space-y-4">
                           <img src={previewUrl} className="max-h-64 mx-auto rounded-lg shadow-md border border-white" alt="Preview" />
                           <button type="button" onClick={() => {setSelectedImage(null); setPreviewUrl(null);}} className="text-xs font-bold text-red-500 hover:underline">Remove Image</button>
                        </div>
                     ) : (
                        <div className="space-y-4">
                           <div className="w-14 h-14 bg-primary-light text-primary rounded-xl flex items-center justify-center mx-auto shadow-sm">
                              <ImageIcon size={28} />
                           </div>
                           <div className="space-y-1">
                              <p className="text-sm font-bold text-slate-900">Click to upload scholarship banner</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Supports JPG, PNG up to 5MB</p>
                           </div>
                           <input
                              type="file" accept="image/*"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={handleImageChange}
                           />
                        </div>
                     )}
                  </div>
               </div>
            </div>

            <div className="pt-10 border-t border-slate-100">
               <button
                  type="submit" disabled={loading}
                  className="w-full py-5 bg-slate-900 text-white rounded-lg font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200 disabled:opacity-50"
               >
                  {loading ? 'Submitting...' : 'Submit Scholarship'}
                  <CheckCircle2 size={20} />
               </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
