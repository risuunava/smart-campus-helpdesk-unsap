"use client";

import { Suspense, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Key, Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, "Password minimal 6 karakter"),
  password_confirmation: z
    .string()
    .min(6, "Konfirmasi password minimal 6 karakter"),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Konfirmasi password tidak cocok",
  path: ["password_confirmation"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  });

  // Validasi parameter token & email
  const isParamsInvalid = !token || !email;

  async function onSubmit(data: ResetPasswordFormData) {
    if (isParamsInvalid) {
      setError("Token verifikasi atau email tidak lengkap.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.resetPassword({
        email: email as string,
        token: token as string,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });

      if (response.success) {
        setSuccess(response.message || "Password berhasil direset.");
        form.reset();
        
        // Redirect ke login setelah 3 detik
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(response.message || "Terjadi kesalahan saat memproses permintaan.");
      }
    } catch (err: any) {
      setError(err.message || "Gagal mereset password. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
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
            <div className="w-11 h-11 flex items-center justify-center shrink-0">
              <Image 
                src="/images/hd-logo.png" 
                alt="UNSAP Logo" 
                width={44} 
                height={44} 
                className="object-contain"
              />
            </div>
            <div className="leading-tight">
              <h1 className="font-bold text-white text-sm tracking-wide">UNSAP</h1>
              <p className="text-[11px] text-white/60">Helpdesk</p>
            </div>
          </div>

          <h1 className="text-[28px] leading-[1.15] font-bold text-white tracking-tight drop-shadow-sm">
            Atur Ulang <span className="text-[#1ed760]">Password</span>
          </h1>
          <p className="text-white/60 text-xs mt-2">
            Silakan masukkan kata sandi baru Anda di bawah ini untuk memperbarui akun.
          </p>
        </div>
      </div>

      {/* Overlapping Form Section */}
      <div className="bg-[#181818] rounded-t-[40px] -mt-8 relative z-10 p-10 pt-10 shadow-[0_-15px_35px_rgba(0,0,0,0.4)] border-t border-white/[0.05]">
        
        {isParamsInvalid && (
          <div className="mb-6 p-5 bg-[#f3727f]/10 border border-[#f3727f]/20 rounded-2xl animate-in slide-in-from-top-2 text-center">
            <AlertTriangle className="h-8 w-8 text-[#f3727f] mx-auto mb-2" />
            <p className="text-[12px] text-white font-bold leading-relaxed">Parameter Tidak Lengkap</p>
            <p className="text-[10px] text-[#888888] mt-2 leading-relaxed">
              Tautan verifikasi tidak valid. Pastikan Anda mengklik link lengkap yang dikirim ke email Gmail Anda.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-[#f3727f]/10 border border-[#f3727f]/20 rounded-2xl animate-in slide-in-from-top-2">
            <p className="text-[11px] text-[#f3727f] font-bold text-center tracking-wide uppercase leading-relaxed">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-5 bg-[#1ed760]/10 border border-[#1ed760]/20 rounded-2xl animate-in slide-in-from-top-2 text-center">
            <CheckCircle className="h-8 w-8 text-[#1ed760] mx-auto mb-2" />
            <p className="text-[12px] text-white font-semibold leading-relaxed">{success}</p>
            <p className="text-[10px] text-[#888888] mt-2">
              Mengarahkan Anda kembali ke halaman Login dalam 3 detik...
            </p>
          </div>
        )}

        {!isParamsInvalid && !success && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Display Target Email securely */}
              <div className="bg-[#2a2a2a]/20 border border-white/5 rounded-2xl p-4 mb-4 text-center">
                <p className="text-[9px] text-[#888888] font-bold uppercase tracking-wider">Mengubah password untuk</p>
                <p className="text-xs text-white font-semibold mt-1 break-all">{email}</p>
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative group">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password Baru"
                          className="bg-[#2a2a2a]/40 border-white/5 text-white placeholder:text-[#666666] rounded-2xl h-14 px-6 pr-12 focus-visible:ring-1 focus-visible:ring-[#1ed760]/50 transition-all text-sm shadow-inner"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] text-[#f3727f] ml-4 font-bold" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password_confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative group">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Konfirmasi Password Baru"
                          className="bg-[#2a2a2a]/40 border-white/5 text-white placeholder:text-[#666666] rounded-2xl h-14 px-6 pr-12 focus-visible:ring-1 focus-visible:ring-[#1ed760]/50 transition-all text-sm shadow-inner"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] text-[#f3727f] ml-4 font-bold" />
                  </FormItem>
                )}
              />

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full h-14 bg-[#1ed760] hover:bg-[#1fdf64] text-black font-bold tracking-[2px] text-[13px] uppercase rounded-full transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center shadow-lg shadow-[#1ed760]/10 overflow-hidden"
                >
                  <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 -translate-x-[150%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-in-out" />
                  
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "SIMPAN PASSWORD BARU"
                  )}
                </button>
              </div>
            </form>
          </Form>
        )}

        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <p className="text-[10px] text-[#666666] font-medium tracking-wide">
            Ingat password Anda? <Link href="/login" className="text-[#1ed760] font-bold hover:underline transition-colors">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 selection:bg-[#1ed760]/30 font-sans overflow-hidden">
      {/* Global Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#1ed760]/10 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#1ed760]/5 rounded-full blur-[120px] opacity-40" />
        <div className="absolute inset-0 bg-[#ffffff] opacity-[0.01] mix-blend-overlay"></div>
      </div>

      <Suspense fallback={
        <div className="w-full max-w-[420px] bg-[#121212] rounded-[40px] p-10 flex flex-col items-center justify-center border border-white/5 relative z-10 text-center">
          <Loader2 className="h-8 w-8 text-[#1ed760] animate-spin mb-4" />
          <p className="text-white/60 text-xs">Memuat halaman reset password...</p>
        </div>
      }>
        <ResetPasswordFormContent />
      </Suspense>
    </div>
  );
}
