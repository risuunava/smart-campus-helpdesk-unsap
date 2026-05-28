"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, LoginFormData } from "@/lib/validators";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, GraduationCap, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const { login, error, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    try {
      await login(data);
    } catch {
      // Error handled by useAuth
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
        
        {/* Top Header Section with Integrated Background Image (Gradient Overlay) */}
        <div className="p-10 pb-16 relative overflow-hidden">
          {/* Background Image with Gradient Overlay as per Reference */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/banner.png"
              alt="Background"
              fill
              className="object-cover opacity-70 grayscale-[0.5] brightness-[0.4]"
              priority
            />
            {/* Gradient Overlay inspired by reference image */}
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

            <h1 className="text-[30px] leading-[1.15] font-bold text-white tracking-tight drop-shadow-sm">
              Selesaikan laporan kampus <br />
              <span className="text-[#1ed760]">bersama kami!</span>
            </h1>
          </div>
        </div>

        {/* Overlapping Form Section */}
        <div className="bg-[#181818] rounded-t-[40px] -mt-8 relative z-10 p-10 pt-10 shadow-[0_-15px_35px_rgba(0,0,0,0.4)] border-t border-white/[0.05]">
          {error && (
            <div className="mb-6 p-4 bg-[#f3727f]/10 border border-[#f3727f]/20 rounded-2xl animate-in slide-in-from-top-2">
              <p className="text-[11px] text-[#f3727f] font-bold text-center tracking-wide uppercase">{error}</p>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Alamat Email"
                          className="bg-[#2a2a2a]/40 border-white/5 text-white placeholder:text-[#666666] rounded-2xl h-14 px-6 focus-visible:ring-1 focus-visible:ring-[#1ed760]/50 transition-all text-sm shadow-inner"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] text-[#f3727f] ml-4 font-bold" />
                    </FormItem>
                  )}
                />

                <div className="space-y-1">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative group">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Kata Sandi"
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
                  <div className="flex justify-end px-2 pt-1">
                    <Link href="/forgot-password" className="text-[11px] text-[#1ed760] hover:text-[#1fdf64] hover:underline font-medium transition-colors">
                      Lupa Password?
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 py-1 px-1">
                <input 
                  type="checkbox" 
                  id="agree" 
                  className="w-4 h-4 rounded bg-[#2a2a2a] border-none text-[#1ed760] focus:ring-offset-0 focus:ring-[#1ed760]/50 transition-all"
                />
                <label htmlFor="agree" className="text-[10px] text-[#888888] font-medium leading-relaxed cursor-pointer select-none">
                  Saya setuju dengan <Link href="#" className="text-white hover:underline font-bold transition-colors">Kebijakan Privasi</Link>
                </label>
              </div>

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
                    "MASUK SEKARANG"
                  )}
                </button>
              </div>
            </form>
          </Form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-[10px] text-[#666666] font-medium tracking-wide">
              Belum punya akun? <Link href="#" className="text-white font-bold hover:underline transition-colors">Hubungi Admin</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}