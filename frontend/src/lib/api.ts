import {
  User,
  AuthResponse,
  LoginCredentials,
  CreateTicketForm,
  TicketListResponse,
  Ticket,
  DashboardStats,
  TrendData,
  FAQ,
  FAQSuggestion,
  CategoryDistribution,
  CampusMood,
  Chat,
  Notification,
  NotificationListResponse,
} from "@/types";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ============================================
// API CLIENT CLASS
// ============================================
class ApiClient {
  private token: string | null = null;

  constructor() {
    // Load token dari cookie
    if (typeof window !== "undefined") {
      this.token = Cookies.get("auth_token") || null;
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      Cookies.set("auth_token", token, { expires: 7, path: "/" });
    } else {
      Cookies.remove("auth_token", { path: "/" });
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)["Authorization"] =
        `Bearer ${this.token}`;
    }

    // Timeout 30 detik agar tidak hang selamanya di dev server single-threaded
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      if (response.status === 401) {
        this.setToken(null);
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new Error("Unauthorized");
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Request failed");
      }

      return response.json();
    } catch (err: any) {
      if (err.name === "AbortError") {
        throw new Error(
          "Koneksi ke server timeout. Pastikan backend berjalan di http://localhost:8000",
        );
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ============================================
  // AUTH ENDPOINTS
  // ============================================
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    this.setToken(response.data.token);
    return response;
  }

  async logout(): Promise<void> {
    await this.request("/auth/logout", { method: "POST" });
    this.setToken(null);
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(data: {
    email: string;
    token: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ success: boolean; message: string }> {
    return this.request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getUser(): Promise<User> {
    const response = await this.request<{ success: boolean; data: User }>(
      "/auth/user",
      {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      },
    );
    return response.data;
  }

  async updateProfile(data: {
    name: string;
    email: string;
    nim?: string;
    faculty?: string;
    study_program?: string;
    semester?: string | number;
  }): Promise<{ success: boolean; data: User; message: string }> {
    const response = await this.request<{
      success: boolean;
      data: User;
      message: string;
    }>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    Cookies.set("cached_user", JSON.stringify(response.data), {
      expires: 7,
      path: "/",
    });
    return response;
  }

  async updatePassword(data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ success: boolean; message: string }> {
    return this.request("/auth/password", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async requestPasswordChangeOtp(data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ success: boolean; message: string }> {
    return this.request("/auth/password/request-otp", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async verifyPasswordChangeOtp(data: {
    otp: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ success: boolean; message: string }> {
    return this.request("/auth/password/verify-otp", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAvatar(
    file: File,
  ): Promise<{ success: boolean; data: User; message: string }> {
    const formData = new FormData();
    formData.append("avatar", file);

    const headers: HeadersInit = {};
    if (this.token) {
      (headers as Record<string, string>)["Authorization"] =
        `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}/auth/avatar`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...headers,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to update avatar");
    }

    const result = await response.json();
    Cookies.set("cached_user", JSON.stringify(result.data), {
      expires: 7,
      path: "/",
    });
    return result;
  }

  // ============================================
  // TICKET ENDPOINTS
  // ============================================
  async getTickets(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<TicketListResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value.toString());
      });
    }

    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return this.request<TicketListResponse>(`/tickets${query}`);
  }

  async getTicket(id: number): Promise<{ success: boolean; data: Ticket }> {
    return this.request(`/tickets/${id}`);
  }

  async createTicket(
    formData: FormData,
  ): Promise<{ success: boolean; data: Ticket; message: string }> {
    const headers: HeadersInit = {};
    // Jangan set Content-Type, biarkan browser set multipart/form-data
    if (this.token) {
      (headers as Record<string, string>)["Authorization"] =
        `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}/tickets`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...headers,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to create ticket");
    }

    return response.json();
  }

  async updateTicket(
    id: number,
    data: Partial<Ticket>,
  ): Promise<{ success: boolean; data: Ticket }> {
    return this.request(`/tickets/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async updateAttachment(
    id: number,
    file: File,
  ): Promise<{ success: boolean; data: Ticket; message: string }> {
    const formData = new FormData();
    formData.append("attachment", file);

    const headers: HeadersInit = {};
    if (this.token) {
      (headers as Record<string, string>)["Authorization"] =
        `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}/tickets/${id}/attachment`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...headers,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to update attachment");
    }

    return response.json();
  }

  async deleteAttachment(
    id: number,
  ): Promise<{ success: boolean; data: Ticket; message: string }> {
    return this.request(`/tickets/${id}/attachment`, {
      method: "DELETE",
    });
  }

  async rateTicket(
    id: number,
    data: { rating: number; rating_comment?: string },
  ): Promise<{ success: boolean; data: Ticket; message: string }> {
    return this.request(`/tickets/${id}/rate`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async correctMLLabel(
    ticketId: number,
    correctPriority: string,
    correctionNote?: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.request(`/tickets/${ticketId}/correct-ml`, {
      method: "POST",
      body: JSON.stringify({
        correct_priority: correctPriority,
        correction_note: correctionNote,
      }),
    });
  }

  // ============================================
  // FAQ ENDPOINTS
  // ============================================
  async getFAQSuggestions(
    query: string,
  ): Promise<{ success: boolean; data: FAQSuggestion[] }> {
    return this.request("/tickets/faq-suggestion", {
      method: "POST",
      body: JSON.stringify({ query }),
    });
  }

  // ============================================
  // DASHBOARD ENDPOINTS
  // ============================================
  async getDashboardStats(): Promise<{
    success: boolean;
    data: DashboardStats;
  }> {
    return this.request("/dashboard/stats");
  }

  async getDashboardTrend(
    period: string = "monthly",
  ): Promise<{ success: boolean; data: TrendData[] }> {
    return this.request(`/dashboard/trend?period=${period}`);
  }

  async getCategoryDistribution(): Promise<{
    success: boolean;
    data: CategoryDistribution[];
  }> {
    return this.request("/dashboard/category-distribution");
  }

  async getCampusMood(
    period: string = "6_months",
  ): Promise<{ success: boolean; data: CampusMood[] }> {
    return this.request(`/dashboard/campus-mood?period=${period}`);
  }

  // ============================================
  // CHAT ENDPOINTS
  // ============================================
  async getChats(
    ticketId: number,
  ): Promise<{ success: boolean; data: Chat[] }> {
    return this.request(`/tickets/${ticketId}/chats`);
  }

  async sendMessage(
    ticketId: number,
    message: string,
  ): Promise<{ success: boolean; data: Chat }> {
    return this.request(`/tickets/${ticketId}/chats`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  }

  // ============================================
  // EXPORT ENDPOINTS
  // ============================================
  async exportTickets(params?: {
    format?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<{
    success: boolean;
    data: { filename: string; url: string; total_records: number };
    message: string;
  }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return this.request(`/tickets/export${query}`);
  }

  // ============================================
  // NOTIFICATION ENDPOINTS
  // ============================================
  async getNotifications(): Promise<NotificationListResponse> {
    return this.request("/notifications");
  }

  async getUnreadCount(): Promise<{
    success: boolean;
    data: { unread_count: number };
  }> {
    return this.request("/notifications/unread-count");
  }

  async markNotificationRead(
    id: number,
  ): Promise<{ success: boolean; message: string }> {
    return this.request(`/notifications/${id}/read`, { method: "PUT" });
  }

  async markAllNotificationsRead(): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request("/notifications/read-all", { method: "PUT" });
  }

  async deleteNotification(
    id: number,
  ): Promise<{ success: boolean; message: string }> {
    return this.request(`/notifications/${id}`, { method: "DELETE" });
  }

  async clearReadNotifications(): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request("/notifications/clear-read", { method: "DELETE" });
  }
}

// Singleton instance
export const api = new ApiClient();
