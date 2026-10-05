export interface Scholarship {
  id: number;
  title: string;
  provider: string;
  country: string;
  level: string;
  field?: string;
  category?: string;
  min_cgpa?: number;
  description?: string;
  eligibility?: string;
  deadline?: string;
  amount?: string;
  image?: string;
  image_url?: string;
  official_link?: string;
  is_saved?: boolean;
  save_id?: number;
  is_applied?: boolean;
  application_status?: string;
}

export interface Recommendation {
  scholarship: Scholarship;
  match_score: number;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_pro: boolean;
  avatar?: string;
  is_staff?: boolean;
  is_mentor?: boolean;
  scholar_points?: number;
  bio?: string;
  university?: string;
  current_location?: string;
  current_level?: string;
  cgpa?: number;
  ielts_score?: number;
  gre_score?: number;
  skills?: string;
  research_interests?: string;
  linkedin_url?: string;
  github_url?: string;
  facebook_url?: string;
  google_scholar_url?: string;
  department?: string;
  major_course?: string;
  date_of_birth?: string;
  achievements?: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  status: number;
  data: T;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
