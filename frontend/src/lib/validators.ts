import { z } from "zod";

/**
 * Validator untuk form login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter"),
});

/**
 * Validator untuk form pelaporan tiket
 */
export const ticketFormSchema = z.object({
  title: z
    .string()
    .min(10, "Judul minimal 10 karakter")
    .max(255, "Judul maksimal 255 karakter"),
  description: z
    .string()
    .min(20, "Deskripsi minimal 20 karakter")
    .max(5000, "Deskripsi maksimal 5000 karakter"),
  category: z.union([
    z.literal("akademik"),
    z.literal("keuangan"),
    z.literal("fasilitas"),
    z.literal("teknologi"),
    z.literal("administrasi"),
    z.literal("kesejahteraan"),
    z.literal("lainnya"),
  ]),
  is_anonymous: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type TicketFormData = z.infer<typeof ticketFormSchema>;

/**
 * Validasi file attachment
 */
export function validateFile(file: File): string | null {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (!allowedTypes.includes(file.type)) {
    return "File harus berupa JPG, PNG, atau PDF";
  }

  if (file.size > maxSize) {
    return "Ukuran file maksimal 2MB";
  }

  return null;
}