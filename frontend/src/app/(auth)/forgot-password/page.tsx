"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.forgotPassword(data.email);
      if (response.success) {
        setSuccess(response.message || "Link reset password telah dikirim ke email Anda.");
        form.reset();
      } else {
        setError(response.message || "Terjadi kesalahan saat memproses permintaan Anda.");
      }
    } catch (err: any) {
      setError(err.message || "Gagal mengirim link reset password. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 selection:bg-[#1ed760]/30 font-sans overflow-hidden">
      {/* Global Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#1ed760]/10 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#1ed760]/5 rounded-full blur-[120px] opacity-40" />
        <div className="absolute inset-0 bg-[#ffffff] opacity-[0.01] mix-blend-overlay"></div>
      </div>

      <div className="w-full max-w-[420px] bg-[#121212] rounded-[40px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.7)] border border-white/5 animate-in fade-in zoom-in-95 duration-700 relative z-10">
        
        {/* Top Header Section */}
        <div className="p-10 pb-16 relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/banner.png"
              alt="Background"
              fill
              className="object-cover opacity-70 grayscale-[0.5] brightness-[0.4]"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#1c1c1c]/30 via-[#121212]/40 to-[#121212]" />
            <div className="absolute inset-0 bg-[#121212]/20 mix-blend-multiply" />
          </div>

          <div className="relative z-10">
            <div className="mb-6 flex items-center gap-3">
              <Link href="/login" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="leading-tight">
                <h1 className="font-bold text-white text-sm tracking-wide">UNSAP</h1>
                <p className="text-[11px] text-white/60">Helpdesk</p>
              </div>
            </div>

            <h1 className="text-[28px] leading-[1.15] font-bold text-white tracking-tight drop-shadow-sm">
              Lupa <span className="text-[#1ed760]">Kata Sandi?</span>
            </h1>
            <p className="text-white/60 text-xs mt-2">
              Masukkan alamat email Anda untuk menerima link verifikasi reset password.
            </p>
          </div>
        </div>

        {/* Overlapping Form Section */}
        <div className="bg-[#181818] rounded-t-[40px] -mt-8 relative z-10 p-10 pt-10 shadow-[0_-15px_35px_rgba(0,0,0,0.4)] border-t border-white/[0.05]">
          
          {error && (
            <div className="mb-6 p-4 bg-[#f3727f]/10 border border-[#f3727f]/20 rounded-2xl animate-in slide-in-from-top-2">
              <p className="text-[11px] text-[#f3727f] font-bold text-center tracking-wide uppercase">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-5 bg-[#1ed760]/10 border border-[#1ed760]/20 rounded-2xl animate-in slide-in-from-top-2 text-center">
              <CheckCircle className="h-8 w-8 text-[#1ed760] mx-auto mb-2" />
              <p className="text-[12px] text-white font-semibold leading-relaxed">{success}</p>
              <p className="text-[10px] text-[#888888] mt-2">
                Jangan lupa untuk memeriksa folder Spam jika email tidak masuk ke Kotak Masuk Utama.
              </p>
            </div>
          )}

          {!success && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative group">
                          <Input
                            placeholder="Masukkan Email Gmail Anda"
                            className="bg-[#2a2a2a]/40 border-white/5 text-white placeholder:text-[#666666] rounded-2xl h-14 px-6 pr-12 focus-visible:ring-1 focus-visible:ring-[#1ed760]/50 transition-all text-sm shadow-inner"
                            {...field}
                          />
                          <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-[#666666] h-4 w-4" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] text-[#f3727f] ml-4 font-bold" />
                    </FormItem>
                  )}
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full h-14 bg-[#1ed760] hover:bg-[#1fdf64] text-black font-bold tracking-[2px] text-[13px] uppercase rounded-full transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center shadow-lg shadow-[#1ed760]/10 overflow-hidden"
                >
                  <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 -translate-x-[150%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-in-out" />
                  
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "KIRIM LINK VERIFIKASI"
                  )}
                </button>
              </form>
            </Form>
          )}

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-[10px] text-[#666666] font-medium tracking-wide">
              Kembali ke halaman <Link href="/login" className="text-[#1ed760] font-bold hover:underline transition-colors">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
