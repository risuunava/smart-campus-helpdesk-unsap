"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { 
  MessageSquare, 
  Zap, 
  Shield, 
  Users, 
  Clock, 
  BarChart3,
  Fingerprint,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#1ed760]/30 font-sans">
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10' : 'bg-transparent'}`}>
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image 
              src="/images/hd-logo.png" 
              alt="Unsap Helpdesk Logo" 
              width={32} 
              height={32} 
              className="object-contain"
            />
            <span className="text-xl font-bold tracking-tight text-white">Unsap <span className="text-[#1ed760]">Helpdesk</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <Link href="#fitur" className="hover:text-white transition-colors">Fitur</Link>
            <Link href="#solusi" className="hover:text-white transition-colors">Solusi AI</Link>
            <Link href="#" className="hover:text-white transition-colors">Statistik</Link>
            <Link href="#" className="hover:text-white transition-colors">Kontak</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Akses Admin <ExternalLink className="h-4 w-4" />
            </Link>
            <Link href="#fitur">
              <Button variant="outline" className="hidden sm:inline-flex bg-transparent border-white/20 text-white hover:bg-white/10 rounded-lg relative overflow-hidden group">
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out" />
                <span className="relative z-10">Pelajari</span>
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-[#1ed760] text-black hover:bg-[#1ed760]/90 font-semibold px-6 rounded-lg relative overflow-hidden group">
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-in-out" />
                <span className="relative z-10">Login</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#1ed760]/20 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="container relative z-10 px-6 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-[52px] lg:text-[64px] font-bold tracking-tight leading-[1.1] mb-8 max-w-6xl">
            <div className="text-[#444444] mb-2 flex justify-center">
              Pusat Bantuan Layanan Kampus
            </div>
            <div className="flex items-center justify-center gap-3 md:gap-4 flex-wrap mt-2">
              <span className="text-[#444444]">UNSAP</span>
              <Fingerprint className="h-10 w-10 md:h-12 md:w-12 lg:h-[56px] lg:w-[56px] text-[#1ed760]" strokeWidth={1.5} />
              <span className="text-white whitespace-nowrap">Lebih Cepat +</span>
              <Sparkles className="h-8 w-8 md:h-10 md:w-10 lg:h-[48px] lg:w-[48px] text-[#1ed760]" />
              <span className="text-white">Transparan</span>
            </div>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 font-medium">
            Sistem resmi untuk Mahasiswa Universitas Sebelas April. Sampaikan kendala fasilitas, masalah akademik, atau administrasi kampus Anda dan pantau proses perbaikannya.
          </p>

          <Link href="/login">
            <button className="group relative px-8 py-4 bg-black border border-white/20 rounded-xl text-white font-medium text-lg overflow-hidden transition-colors hover:border-[#1ed760]/80 shadow-[0_0_20px_rgba(30,215,96,0.1)]">
              <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out" />
              <span className="relative z-10">Mulai Lapor Keluhan</span>
            </button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-24 relative z-10">
        <div className="container px-6 mx-auto">
          <div className="mb-16 md:mb-24 flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="max-w-2xl">
              <span className="text-white/50 text-sm font-medium tracking-wide uppercase mb-4 block border border-white/10 w-fit px-3 py-1 rounded-full bg-white/5">Teknologi</span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
                Sistem cerdas untuk<br />layanan kampus terbaik
              </h2>
            </div>
            <p className="text-gray-400 max-w-md text-lg">
              UNSAP Helpdesk System memadukan arsitektur modern (Next.js & Laravel) dengan Machine Learning NLP untuk menciptakan ekosistem bantuan yang cepat dan tanpa hambatan.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-[#0a0a0a] border border-white/5 hover:border-[#1ed760]/30 transition-all duration-500 hover:bg-[#111111] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#1ed760]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="w-12 h-12 rounded-2xl bg-[#1ed760]/10 flex items-center justify-center mb-8 border border-[#1ed760]/20 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(30,215,96,0.15)]">
                  <feature.icon className="h-5 w-5 text-[#1ed760]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Mockup/Showcase Section (Conceptual) */}
      <section id="solusi" className="py-24 relative overflow-hidden">
        <div className="container px-6 mx-auto relative z-10">
          <div className="rounded-[40px] bg-[#080b09] border border-white/5 p-8 md:p-16 flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-[400px] h-[400px] bg-[#1ed760]/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute left-1/4 bottom-1/4 w-[200px] h-[200px] bg-[#1ed760]/5 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="flex-1 space-y-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1ed760]/10 border border-[#1ed760]/20 text-[#1ed760] text-sm font-medium">
                <Zap className="h-4 w-4" fill="currentColor" /> UNSAP AI Engine
              </div>
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Sampaikan Keluhan.<br />Transformasi Kampus.
              </h2>
              <p className="text-xl text-gray-400 max-w-lg leading-relaxed">
                Buat laporan dengan cepat. Sistem AI kami akan otomatis mengklasifikasikan tingkat urgensi dan mencari solusi yang relevan tanpa harus menunggu admin.
              </p>
              <div className="flex gap-4 pt-4">
                <Link href="/login">
                  <Button className="bg-[#1ed760] text-black hover:bg-[#1ed760]/90 rounded-xl px-8 py-6 text-lg font-bold relative overflow-hidden group border-0">
                    <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-in-out" />
                    <span className="relative z-10">Login Sekarang</span>
                  </Button>
                </Link>
                <Link href="#fitur">
                  <Button variant="outline" className="border-white/20 text-white rounded-xl px-8 py-6 text-lg hover:bg-white/5 bg-transparent font-medium relative overflow-hidden group">
                    <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out" />
                    <span className="relative z-10">Fitur Lengkap</span>
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex-1 w-full max-w-xl">
              {/* Mockup UI Component */}
              <div className="rounded-[32px] bg-[#0f0f0f] border border-white/10 p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#1ed760]/50 to-transparent" />
                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-[#1ed760]/10 flex items-center justify-center border border-[#1ed760]/20">
                      <MessageSquare className="h-5 w-5 text-[#1ed760]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Laporan Baru</div>
                      <div className="text-xs text-gray-500">Asisten AI aktif</div>
                    </div>
                  </div>
                  <Badge className="bg-red-500/10 text-red-500 border-0 px-3 py-1 rounded-full font-medium tracking-wide text-xs">Urgent</Badge>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="h-3 bg-white/5 rounded-full w-3/4" />
                    <div className="h-3 bg-white/5 rounded-full w-full" />
                    <div className="h-3 bg-white/5 rounded-full w-5/6" />
                  </div>
                  
                  <div className="p-5 rounded-2xl bg-[#1a1a1a] border border-white/5 flex gap-4 items-start">
                    <div className="h-8 w-8 rounded-full bg-[#1ed760]/20 flex items-center justify-center shrink-0">
                      <Sparkles className="h-4 w-4 text-[#1ed760]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        Mengerti! Model klasifikasi NLP kami telah menganalisis keluhan Anda. Sistem menyarankan 3 artikel FAQ terkait dan otomatis mengalihkan tiket ini ke antrean Prioritas (Urgent).
                      </p>
                      <div className="mt-3 flex gap-2">
                        <div className="h-8 w-24 bg-white/5 rounded-full" />
                        <div className="h-8 w-16 bg-[#1ed760]/10 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cookie Policy Banner Style Footer */}
      <footer className="bg-[#050505] pt-16 pb-8 border-t border-white/5">
        <div className="container px-6 mx-auto">
          <div className="p-4 md:p-6 rounded-2xl bg-[#0a0a0a] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 mb-16 shadow-lg shadow-black">
            <p className="text-sm text-gray-400 max-w-3xl leading-relaxed">
              Sistem ini menggunakan cookie esensial untuk memastikan portal layanan kampus beroperasi dengan lancar. Dengan menggunakan platform Helpdesk, Anda menyetujui Kebijakan Privasi dan manajemen data sesuai aturan institusi akademik. Baca lebih lanjut pada <a href="#" className="text-[#1ed760] hover:underline">Kebijakan Privasi</a>.
            </p>
            <div className="flex gap-3 shrink-0">
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 hover:text-white bg-transparent rounded-xl px-6">Tolak</Button>
              <Button className="bg-[#1ed760] text-black hover:bg-[#1ed760]/90 rounded-xl px-6 font-semibold">Mengerti</Button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/5 pt-8">
            <div className="flex items-center gap-2">
              <Image 
                src="/images/hd-logo.png" 
                alt="Unsap Helpdesk Logo" 
                width={24} 
                height={24} 
                className="object-contain opacity-50"
              />
              <span className="text-lg font-bold tracking-tight text-white/50">Unsap Helpdesk</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
              <a href="#" className="hover:text-white transition-colors">Ketentuan Layanan</a>
              <a href="#" className="hover:text-white transition-colors">Pusat Bantuan</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: MessageSquare,
    title: "FAQ AI Suggestions",
    description: "Sistem otomatis merekomendasikan solusi pintar (TF-IDF Similarity) bahkan sebelum Anda selesai menulis laporan keluhan.",
  },
  {
    icon: Zap,
    title: "Klasifikasi NLP",
    description: "Machine learning otomatis mendeteksi prioritas tiket (Urgent/Normal/Low), sehingga insiden kritis segera ditangani.",
  },
  {
    icon: Shield,
    title: "Pelaporan Anonim",
    description: "Tersedia fitur pelaporan rahasia menggunakan Row Level Security. Identitas pelapor hanya diketahui oleh Master Admin.",
  },
  {
    icon: Clock,
    title: "Pantau Respon (SLA)",
    description: "Waktu penanganan (SLA) dan rekam jejak keluhan terpantau secara transparan dan terekam dalam sistem real-time.",
  },
  {
    icon: BarChart3,
    title: "Sentimen Kampus",
    description: "Dashboard analitik yang menangkap Mood Kampus melalui kompilasi sentimen keluhan seluruh mahasiswa.",
  },
  {
    icon: Users,
    title: "Live WebSockets",
    description: "Komunikasi real-time mulus dengan Laravel Reverb. Diskusikan solusi tanpa *refresh* layar sama sekali.",
  },
];