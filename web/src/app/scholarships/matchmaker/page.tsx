
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiService } from '@/lib/api';
import { Recommendation, User } from '@/types';

// Icons as simple SVG components to avoid external dependency issues for now
const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
);

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);

const GraduationCapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
);

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);

export default function MatchmakerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    const loadMatches = async () => {
      setLoading(true);
      try {
        const [res, profileRes] = await Promise.all([
          apiService.getScholarshipMatches(),
          apiService.getProfile()
        ]);

        if (profileRes.ok) setUser(profileRes.data);
        if (res.ok && res.data) {
          setRecommendations(res.data as unknown as Recommendation[]);
        }
      } catch (e) {
        console.error('[MATCHMAKER] Error:', e);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-text-secondary font-medium">Analyzing your profile with AI...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center">
        <button onClick={() => router.back()} className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeftIcon />
        </button>
        <h1 className="text-xl font-bold text-foreground">AI Matchmaker</h1>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        {/* AI Banner */}
        <div className="flex items-center bg-primary-light p-6 rounded-2xl mb-8 border border-primary/10">
          <div className="text-primary p-3 bg-white rounded-xl shadow-sm">
            <BotIcon />
          </div>
          <div className="ml-4 flex-1">
            <h2 className="text-lg font-bold text-primary">Smart Suggestions</h2>
            {!user?.is_pro ? (
              <Link href="/upgrade-pro" className="text-sm text-red-600 font-bold hover:underline block mt-1">
                PRO FEATURE: Upgrade for 100% precision matching & hidden opportunities.
              </Link>
            ) : (
              <p className="text-sm text-primary/80 block mt-1">NLP model is currently analyzing your deep profile.</p>
            )}
          </div>
        </div>

        <h3 className="text-foreground font-bold mb-4 flex items-center gap-2">
          Top Recommendations
          <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
            {recommendations.length} Found
          </span>
        </h3>

        {recommendations.length > 0 ? (
          <div className="grid gap-4">
            {recommendations.map((item, index) => (
              <div
                key={item.scholarship.id}
                onClick={() => router.push(`/scholarships/${item.scholarship.id}`)}
                className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 hover:border-primary/30 cursor-pointer transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2">
                    <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-lg border border-green-100">
                      {item.match_score}% Match
                    </span>
                    {index === 0 && (
                      <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center">
                        Best Fit
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{item.scholarship.title}</h4>
                    <p className="text-sm text-text-secondary mb-4">{item.scholarship.provider}</p>

                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <MapPinIcon />
                        {item.scholarship.country}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <GraduationCapIcon />
                        {item.scholarship.level}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Match Score Bar */}
                <div className="h-1.5 bg-gray-100 rounded-full mt-6 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-1000 ease-out"
                    style={{ width: `${item.match_score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-20 text-center space-y-4 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="bg-gray-50 p-6 rounded-full">
              <BotIcon />
            </div>
            <div>
              <p className="text-foreground font-bold">No matches found</p>
              <p className="text-text-secondary text-sm max-w-[250px] mt-1">Try updating your profile details to get better AI recommendations.</p>
            </div>
            <button
              onClick={() => router.push('/profile')}
              className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-md active:scale-95"
            >
              Update Profile
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
