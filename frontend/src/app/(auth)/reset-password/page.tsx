"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, { message: "Kata sandi minimal 6 karakter" }),
    password_confirmation: z.string().min(6, { message: "Konfirmasi kata sandi minimal 6 karakter" }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["password_confirmation"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

function ResetPasswordFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setError("Link reset password tidak valid atau tidak lengkap.");
    }
  }, [token, email]);

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  });

  async function onSubmit(data: ResetPasswordForm) {
    if (!token || !email) {
      setError("Link reset password tidak valid. Silakan request link baru.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      
      await api.resetPassword({
        email: email,
        token: token,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Gagal mereset kata sandi. Link mungkin telah kedaluwarsa.");
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

            <h1 className="text-[30px] leading-[1.15] font-bold text-white tracking-tight drop-shadow-sm mb-2">
              Buat <span className="text-[#1ed760]">Password</span> Baru
            </h1>
            <p className="text-white/60 text-sm">
              Untuk email: <br/> <span className="text-white font-medium">{email || "Tidak valid"}</span>
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-[#181818] rounded-t-[40px] -mt-8 relative z-10 p-10 pt-10 shadow-[0_-15px_35px_rgba(0,0,0,0.4)] border-t border-white/[0.05]">
          
          {success ? (
            <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in-95 fade-in duration-500">
              <div className="w-16 h-16 bg-[#1ed760]/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-[#1ed760]" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2 text-center">Password Berhasil Diubah!</h3>
              <p className="text-[#888888] text-center text-sm mb-8 leading-relaxed">
                Anda sudah dapat login menggunakan kata sandi baru Anda.
              </p>
              
              <Link href="/login" className="w-full">
                <button
                  className="group relative w-full h-14 bg-[#1ed760] hover:bg-[#1fdf64] text-black font-bold tracking-[2px] text-[13px] uppercase rounded-full transition-all active:scale-[0.98] flex items-center justify-center shadow-lg shadow-[#1ed760]/10 overflow-hidden"
                >
                  <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 -translate-x-[150%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-in-out" />
                  KEMBALI KE LOGIN
                </button>
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-[#f3727f]/10 border border-[#f3727f]/20 rounded-2xl animate-in slide-in-from-top-2">
                  <p className="text-[11px] text-[#f3727f] font-bold text-center tracking-wide uppercase">{error}</p>
                </div>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative group">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Kata Sandi Baru"
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
                              placeholder="Konfirmasi Kata Sandi"
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

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading || !token || !email}
                      className="group relative w-full h-14 bg-[#1ed760] hover:bg-[#1fdf64] text-black font-bold tracking-[2px] text-[13px] uppercase rounded-full transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center shadow-lg shadow-[#1ed760]/10 overflow-hidden"
                    >
                      <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 -translate-x-[150%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-in-out" />
                      
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        "SIMPAN PASSWORD"
                      )}
                    </button>
                  </div>
                </form>
              </Form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="h-8 w-8 text-[#1ed760] animate-spin" /></div>}>
      <ResetPasswordFormContent />
    </Suspense>
  );
}
