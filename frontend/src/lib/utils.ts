import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Menggabungkan class names dengan dukungan Tailwind CSS
 * Digunakan oleh komponen shadcn/ui
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format tanggal ke format Indonesia
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return new Intl.DateTimeFormat("id-ID", options || defaultOptions).format(
    new Date(date)
  );
}

/**
 * Format relative time (contoh: "2 jam yang lalu")
 */
export function timeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} hari yang lalu`;
  if (hours > 0) return `${hours} jam yang lalu`;
  if (minutes > 0) return `${minutes} menit yang lalu`;
  return "Baru saja";
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Generate random ID untuk optimistic UI
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Truncate text dengan ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/**
 * Mendapatkan warna prioritas untuk badge
 */
export function getPriorityColor(priority: "low" | "normal" | "urgent") {
  const colors = {
    urgent: {
      bg: "bg-red-500/15",
      text: "text-[#f3727f]",
      border: "border-red-500/25",
      icon: "•",
    },
    normal: {
      bg: "bg-amber-500/15",
      text: "text-[#ffa42b]",
      border: "border-amber-500/25",
      icon: "•",
    },
    low: {
      bg: "bg-[#b3b3b3]/10",
      text: "text-[#b3b3b3]",
      border: "border-[#b3b3b3]/20",
      icon: "•",
    },
  };

  return colors[priority];
}

/**
 * Mendapatkan warna status untuk badge
 */
export function getStatusColor(status: "open" | "in_progress" | "resolved" | "closed") {
  const colors = {
    open: {
      bg: "bg-[#539df5]/15",
      text: "text-[#539df5]",
      border: "border-[#539df5]/25",
      label: "Terbuka",
    },
    in_progress: {
      bg: "bg-purple-500/15",
      text: "text-purple-400",
      border: "border-purple-500/25",
      label: "Diproses",
    },
    resolved: {
      bg: "bg-[#1ed760]/15",
      text: "text-[#1ed760]",
      border: "border-[#1ed760]/25",
      label: "Selesai",
    },
    closed: {
      bg: "bg-[#4d4d4d]/30",
      text: "text-[#b3b3b3]",
      border: "border-[#4d4d4d]/40",
      label: "Ditutup",
    },
  };

  return colors[status];
}

/**
 * Validasi tipe file yang diizinkan
 */
export function isAllowedFileType(file: File): boolean {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
  return allowedTypes.includes(file.type);
}

/**
 * Validasi ukuran file (max 2MB)
 */
export function isValidFileSize(file: File): boolean {
  const maxSize = 2 * 1024 * 1024; // 2MB
  return file.size <= maxSize;
}