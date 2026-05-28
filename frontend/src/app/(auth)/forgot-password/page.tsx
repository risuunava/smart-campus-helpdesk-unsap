"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordForm) {
    try {
      setIsLoading(true);
      setError("");
      setSuccessMessage("");
      
      const response = await api.forgotPassword(data.email);
      setSuccessMessage(response.message || "Link verifikasi telah dikirim ke email Anda.");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mengirim permintaan.");
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
            <Link href="/login" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 text-xs font-medium">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Login
            </Link>

            <h1 className="text-[30px] leading-[1.15] font-bold text-white tracking-tight drop-shadow-sm mb-2">
              Lupa <span className="text-[#1ed760]">Password?</span>
            </h1>
            <p className="text-white/60 text-sm">
              Masukkan email yang terdaftar, kami akan mengirimkan link untuk mereset kata sandi Anda.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-[#181818] rounded-t-[40px] -mt-8 relative z-10 p-10 pt-10 shadow-[0_-15px_35px_rgba(0,0,0,0.4)] border-t border-white/[0.05]">
          
          {successMessage ? (
            <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in-95 fade-in duration-500">
              <div className="w-16 h-16 bg-[#1ed760]/20 rounded-full flex items-center justify-center mb-6">
                <MailCheck className="w-8 h-8 text-[#1ed760]" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Cek Email Anda</h3>
              <p className="text-[#888888] text-center text-sm mb-8 leading-relaxed">
                Kami telah mengirimkan link reset password ke <br/>
                <span className="text-white font-medium">{form.getValues().email}</span>
              </p>
              <button
                onClick={() => {
                  setSuccessMessage("");
                  form.reset();
                }}
                className="text-[#1ed760] text-sm font-bold hover:underline"
              >
                Kirim ulang email
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-[#f3727f]/10 border border-[#f3727f]/20 rounded-2xl animate-in slide-in-from-top-2">
                  <p className="text-[11px] text-[#f3727f] font-bold text-center tracking-wide uppercase">{error}</p>
                </div>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Alamat Email Terdaftar"
                            className="bg-[#2a2a2a]/40 border-white/5 text-white placeholder:text-[#666666] rounded-2xl h-14 px-6 focus-visible:ring-1 focus-visible:ring-[#1ed760]/50 transition-all text-sm shadow-inner"
                            {...field}
                          />
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
                      "KIRIM LINK RESET"
                    )}
                  </button>
                </form>
              </Form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
