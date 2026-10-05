import { auth } from './firebase';
import { ApiResponse } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://scholarshipconnectbd.onrender.com/api";

const handleResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type");
  const text = await response.text();
  let data;

  try {
    if (contentType && contentType.includes("application/json")) {
      data = text ? JSON.parse(text) : {};
    } else {
      data = text ? { message: text } : {};
    }
  } catch (e) {
    data = { error: 'Invalid response format', details: text };
  }

  // Handle Django paginated responses automatically
  if (data && typeof data === 'object' && data.results && Array.isArray(data.results)) {
    const results = data.results;
    Object.defineProperty(results, '_pagination', {
      value: { count: data.count, next: data.next, previous: data.previous },
      enumerable: false
    });
    data = results;
  }

  return { ok: response.ok, status: response.status, data };
};

const getHeaders = async (includeToken = true) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (includeToken) {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      } catch (err) {
        console.warn('[API] Token fetch error, retrying fresh token:', err);
        try {
          const freshToken = await user.getIdToken(true);
          headers['Authorization'] = `Bearer ${freshToken}`;
        } catch (e) {
          console.error('[API] Auth token error:', e);
        }
      }
    }
  }

  return headers;
};

export const apiService = {
  // --- System ---
  async getHealth() {
    const response = await fetch(`${API_URL}/health/`, {
      method: 'GET',
      headers: await getHeaders(false),
    });
    return await handleResponse(response);
  },

  // --- Auth & Profile ---
  async getProfile() {
    const response = await fetch(`${API_URL}/accounts/profile/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async getAutocomplete(type: string, q = '') {
    const response = await fetch(`${API_URL}/accounts/autocomplete/?type=${type}&q=${encodeURIComponent(q)}`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async updateProfile(profileData: any) {
    const response = await fetch(`${API_URL}/accounts/profile/`, {
      method: 'PATCH',
      headers: await getHeaders(true),
      body: JSON.stringify(profileData),
    });
    return await handleResponse(response);
  },

  // --- Scholarships ---
  async getScholarships(params = '') {
    const url = `${API_URL}/scholarships/${params ? '?' + params : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async getScholarshipDetail(id: number | string) {
    const response = await fetch(`${API_URL}/scholarships/${id}/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async saveScholarship(scholarshipId: number) {
    const response = await fetch(`${API_URL}/applications/saved/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ scholarship: scholarshipId }),
    });
    return await handleResponse(response);
  },

  async unsaveScholarship(saveId: number) {
    const response = await fetch(`${API_URL}/applications/saved/${saveId}/`, {
      method: 'DELETE',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async addScholarship(formData: FormData) {
    const user = auth.currentUser;
    const headers: Record<string, string> = {};
    if (user) {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/scholarships/`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return await handleResponse(response);
  },

  // --- Community ---
  async getDiscussions(params = '') {
    const response = await fetch(`${API_URL}/community/${params ? '?' + params : ''}`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async getMentors() {
    const response = await fetch(`${API_URL}/community/mentors/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async getLeaderboard() {
    const response = await fetch(`${API_URL}/community/leaderboard/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  // --- Blog ---
  async getBlogPosts(type = '') {
    const response = await fetch(`${API_URL}/blog/${type ? '?type=' + type : ''}`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  // --- AI Assistant ---
  async getScholarshipMatches() {
    const response = await fetch(`${API_URL}/ai/matchmaker/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async getApplications() {
    const response = await fetch(`${API_URL}/applications/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async getSavedScholarships() {
    const response = await fetch(`${API_URL}/applications/saved/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async searchLiveScholarships(query: string = '') {
    const response = await fetch(`${API_URL}/scholarships/live-search/${query ? '?q=' + query : ''}`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async applyForScholarship(applicationData: any) {
    const response = await fetch(`${API_URL}/applications/apply/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify(applicationData),
    });
    return await handleResponse(response);
  },

  async upgradeWithPoints() {
    const response = await fetch(`${API_URL}/accounts/upgrade-pro/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ method: 'points' }),
    });
    return await handleResponse(response);
  },

  async getNotifications() {
    const response = await fetch(`${API_URL}/accounts/notifications/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async getMentorships() {
    const response = await fetch(`${API_URL}/community/mentorships/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async getDocuments() {
    const response = await fetch(`${API_URL}/applications/documents/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async updateMentorshipStatus(id: number, status: string) {
    const response = await fetch(`${API_URL}/community/mentorships/${id}/`, {
      method: 'PATCH',
      headers: await getHeaders(true),
      body: JSON.stringify({ status }),
    });
    return await handleResponse(response);
  },

  async aiWriteSOP(scholarshipId: number) {
    const response = await fetch(`${API_URL}/ai/write-sop/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ scholarship_id: scholarshipId }),
    });
    return await handleResponse(response);
  },

  async aiCheckEligibility(scholarshipId: number) {
    const response = await fetch(`${API_URL}/ai/check-eligibility/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ scholarship_id: scholarshipId }),
    });
    return await handleResponse(response);
  },

  async aiLiveSupport(message: string, history: string[] = []) {
    const response = await fetch(`${API_URL}/ai/live-support/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ message, history }),
    });
    return await handleResponse(response);
  },

  async getAIChatHistory() {
    const response = await fetch(`${API_URL}/ai/chat-history/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  // --- Admin ---
  async adminLogin(username: string, password: string) {
    const response = await fetch(`${API_URL}/accounts/admin-login/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ username, password }),
    });
    return await handleResponse(response);
  },

  async getUsers(params = '') {
    const response = await fetch(`${API_URL}/accounts/users/${params ? '?' + params : ''}`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async getAdminStats() {
    const response = await fetch(`${API_URL}/scholarships/admin-stats/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async getAdminLogs() {
    const response = await fetch(`${API_URL}/accounts/admin/logs/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async getAdminBroadcasts() {
    const response = await fetch(`${API_URL}/notifications/broadcast/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async sendBroadcast(title: string, message: string) {
    const response = await fetch(`${API_URL}/notifications/broadcast/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ title, message }),
    });
    return await handleResponse(response);
  },

  async getModerationReports() {
    const response = await fetch(`${API_URL}/community/reports/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async resolveReport(reportId: number, status: string) {
    const response = await fetch(`${API_URL}/community/reports/${reportId}/`, {
      method: 'PATCH',
      headers: await getHeaders(true),
      body: JSON.stringify({ status }),
    });
    return await handleResponse(response);
  },

  async getMentorApplications() {
    const response = await fetch(`${API_URL}/community/mentor-applications/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async approveMentor(id: number, status: string) {
    const response = await fetch(`${API_URL}/community/mentor-applications/${id}/`, {
      method: 'PATCH',
      headers: await getHeaders(true),
      body: JSON.stringify({ status }),
    });
    return await handleResponse(response);
  },

  async updateScholarship(id: number | string, data: any) {
    const isFormData = data instanceof FormData;
    const headers = await getHeaders(true);
    if (isFormData) {
      delete headers['Content-Type'];
    }

    const response = await fetch(`${API_URL}/scholarships/${id}/`, {
      method: 'PATCH',
      headers: headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    return await handleResponse(response);
  },

  async approveScholarship(id: number | string, action: string, note = '') {
    const response = await fetch(`${API_URL}/scholarships/${id}/approve/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ action, note }),
    });
    return await handleResponse(response);
  },

  async logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_verified');
    }
    await auth.signOut();
  }
};
