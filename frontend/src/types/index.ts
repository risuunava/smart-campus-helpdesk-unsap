// ============================================
// USER TYPES
// ============================================
export interface User {
  id: number;
  name: string;
  email: string;
  nim?: string;
  faculty?: string;
  study_program?: string;
  semester?: number;
  role: "mahasiswa" | "admin" | "master_admin";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    token_type: string;
  };
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// ============================================
// TICKET TYPES
// ============================================
export interface Ticket {
  id: number;
  ticket_code: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  priority_source: "ml_prediction" | "manual" | "keyword_override";
  status: TicketStatus;
  is_anonymous: boolean;
  anonymous_code?: string;
  attachment_path?: string;
  attachment_type?: string;
  user: User;
  assigned_to?: number;
  assigned_admin?: User;
  resolved_by?: number;
  resolved_at?: string;
  closed_at?: string;
  resolution_note?: string;
  ml_confidence_score?: number;
  chats?: Chat[];
  created_at: string;
  updated_at: string;
}

export type TicketCategory =
  | "akademik"
  | "keuangan"
  | "fasilitas"
  | "teknologi"
  | "administrasi"
  | "kesejahteraan"
  | "lainnya";

export type TicketPriority = "low" | "normal" | "urgent";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface CreateTicketForm {
  title: string;
  description: string;
  category: TicketCategory;
  is_anonymous: boolean;
  attachment?: File;
}

export interface TicketListResponse {
  success: boolean;
  data: {
    data: Ticket[];
    current_page: number;
    last_page: number;
    total: number;
  };
  message: string;
}

// ============================================
// CHAT TYPES
// ============================================
export interface Chat {
  id: number;
  ticket_id: number;
  sender_id: number;
  message: string;
  sender_type: "mahasiswa" | "admin" | "system";
  sender: User;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface ChatMessage {
  ticket_id: number;
  message: string;
}

// ============================================
// FAQ TYPES
// ============================================
export interface FAQ {
  id: number;
  title: string;
  content: string;
  category: string;
  keywords: string[];
  view_count: number;
  helpful_count: number;
  is_active: boolean;
}

export interface FAQSuggestion {
  matches: FAQ[];
  similarity_score?: number;
}

// ============================================
// DASHBOARD TYPES
// ============================================
export interface DashboardStats {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  resolved_tickets: number;
  closed_tickets: number;
  urgent_tickets: number;
  average_response_time: number;
  tickets_today: number;
  tickets_this_week: number;
  tickets_this_month: number;
  sla_compliance: number;
}

export interface TrendData {
  date?: string;
  week?: string;
  month?: string;
  total: number;
  urgent: number;
  resolved: number;
}

export interface CampusMood {
  month: string;
  urgent: number;
  normal: number;
  low: number;
  total: number;
  sentiment_score: number;
}

export interface CategoryDistribution {
  category: string;
  total: number;
}