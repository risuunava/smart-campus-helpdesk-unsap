"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  ArrowRight, 
  MessageSquare, 
  Zap, 
  Shield, 
  Users, 
  Clock, 
  BarChart3,
  CheckCircle2,
  Star
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#121212]">
      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <section className="relative overflow-hidden">
        {/* Subtle glow background effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#1ed760]/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="container-mobile py-20 lg:py-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in">
              <Badge className="bg-[#1ed760]/15 text-[#1ed760] border-[#1ed760]/25 text-sm px-4 py-2 rounded-full font-medium">
                Sistem Resmi Universitas Sebelas April
              </Badge>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-white">
                Smart Campus{" "}
                <span className="text-[#1ed760]">Helpdesk</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-[#b3b3b3] leading-relaxed">
                Laporkan keluhan, dapatkan solusi instan dengan AI, dan pantau 
                progres penanganan secara real-time. Birokrasi kampus jadi lebih cepat!
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link href="/login">
                  <button className="btn-gradient px-8 py-3 text-base flex items-center gap-2">
                    MULAI SEKARANG
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>
                <Link href="#fitur">
                  <button className="btn-gradient-outline px-8 py-3 text-base rounded-full">
                    Pelajari Fitur
                  </button>
                </Link>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#1ed760]">5K+</p>
                  <p className="text-sm text-[#b3b3b3]">Tiket Terproses</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#1ed760]">98%</p>
                  <p className="text-sm text-[#b3b3b3]">SLA Terpenuhi</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#1ed760]">2.5h</p>
                  <p className="text-sm text-[#b3b3b3]">Rata-rata Respon</p>
                </div>
              </div>
            </div>
            
            {/* Right Illustration */}
            <div className="hidden lg:block animate-slide-in-right">
              <div className="bg-[#181818] rounded-2xl p-8 border border-[#282828]"
                   style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-[#f3727f]" />
                    <div className="h-3 w-3 rounded-full bg-[#ffa42b]" />
                    <div className="h-3 w-3 rounded-full bg-[#1ed760]" />
                  </div>
                  <div className="space-y-3">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <p className="text-sm font-semibold text-[#f3727f] flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#f3727f]"></span> Tiket Urgent</p>
                      <p className="text-xs text-[#b3b3b3] mt-1">AC di Ruang 301 tidak berfungsi</p>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                      <p className="text-sm font-semibold text-[#ffa42b] flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#ffa42b]"></span> Tiket Normal</p>
                      <p className="text-xs text-[#b3b3b3] mt-1">Dosen sering terlambat</p>
                    </div>
                    <div className="bg-[#b3b3b3]/5 border border-[#b3b3b3]/10 rounded-lg p-3">
                      <p className="text-sm font-semibold text-[#b3b3b3] flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#b3b3b3]"></span> Tiket Low</p>
                      <p className="text-xs text-[#666666] mt-1">Request pelatihan soft skill</p>
                    </div>
                  </div>
                  <div className="bg-[#1ed760]/10 border border-[#1ed760]/20 rounded-lg p-3 mt-4">
                    <p className="text-sm text-[#1ed760] font-medium">Saran AI: "3 Solusi mirip ditemukan"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FEATURES SECTION */}
      {/* ============================================ */}
      <section id="fitur" className="py-20 bg-[#181818]">
        <div className="container-mobile">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Kenapa Smart Campus Helpdesk?
            </h2>
            <p className="text-lg text-[#b3b3b3] max-w-2xl mx-auto">
              Sistem pelaporan modern dengan kecerdasan buatan untuk mempercepat 
              penanganan keluhan mahasiswa
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-[#1f1f1f] border border-[#282828] rounded-xl p-6 transition-all duration-200 hover:bg-[#252525] hover:border-[#3a3a3a] group"
                   style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
                <div className="w-12 h-12 bg-[#1ed760]/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#1ed760]/15 transition-colors">
                  <feature.icon className="h-6 w-6 text-[#1ed760]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-[#b3b3b3] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* HOW IT WORKS */}
      {/* ============================================ */}
      <section className="py-20 bg-[#121212]">
        <div className="container-mobile">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Cara Kerja
            </h2>
            <p className="text-lg text-[#b3b3b3]">
              3 langkah mudah untuk melaporkan keluhan
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative">
                  <div className="w-20 h-20 bg-[#1ed760] rounded-full flex items-center justify-center mx-auto mb-6 text-black text-2xl font-bold"
                       style={{ boxShadow: "0 0 30px rgba(30, 215, 96, 0.3)" }}>
                    {index + 1}
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-10 left-[60%] w-full h-[2px] bg-gradient-to-r from-[#1ed760]/40 to-transparent" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-[#b3b3b3]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA SECTION */}
      {/* ============================================ */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#121212] via-[#0d2818] to-[#121212]" />
        <div className="container-mobile text-center relative">
          <h2 className="text-4xl font-bold text-white mb-4">
            Siap Melaporkan Keluhan?
          </h2>
          <p className="text-lg text-[#b3b3b3] mb-8 max-w-2xl mx-auto">
            Gunakan akun kampus Anda untuk login dan mulai melaporkan keluhan.
            Identitas Anda dijamin aman.
          </p>
          <Link href="/login">
            <button className="btn-gradient px-12 py-4 text-lg flex items-center gap-2 mx-auto uppercase tracking-wider">
              Login Sekarang
              <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer className="bg-[#0a0a0a] border-t border-[#1f1f1f] text-white py-12">
        <div className="container-mobile">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-[#1ed760] rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-black" />
                </div>
                UNSAP Helpdesk
              </h3>
              <p className="text-[#b3b3b3] text-sm">
                Universitas Sebelas April
                <br />
                Jl. Pendidikan No. 123, Sumedang
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Kontak</h4>
              <ul className="space-y-2 text-sm text-[#b3b3b3]">
                <li>helpdesk@unsap.ac.id</li>
                <li>(022) 1234-5678</li>
                <li>Senin-Jumat, 08:00-16:00</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Tautan Cepat</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="text-[#b3b3b3] hover:text-[#1ed760] transition-colors">Login</Link></li>
                <li><Link href="#fitur" className="text-[#b3b3b3] hover:text-[#1ed760] transition-colors">Fitur</Link></li>
                <li><a href="#" className="text-[#b3b3b3] hover:text-[#1ed760] transition-colors">Kebijakan Privasi</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#1f1f1f] mt-8 pt-8 text-center text-sm text-[#666666]">
            © 2024 Smart Campus Helpdesk UNSAP. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Data untuk features section
const features = [
  {
    icon: MessageSquare,
    title: "FAQ AI Suggestions",
    description: "AI otomatis mencarikan solusi dari FAQ sebelum laporan dibuat, mengurangi tiket repetitif.",
  },
  {
    icon: Zap,
    title: "Prioritas Otomatis",
    description: "Machine learning mengklasifikasi urgensi tiket secara real-time dengan NLP.",
  },
  {
    icon: Shield,
    title: "Anonim Terjamin",
    description: "Fitur lapor anonim dengan enkripsi identitas. Hanya Master Admin yang bisa akses.",
  },
  {
    icon: Clock,
    title: "Respon Cepat",
    description: "SLA terpantau otomatis. Tiket urgent diprioritaskan di antrian teratas.",
  },
  {
    icon: BarChart3,
    title: "Dashboard Analytics",
    description: "Pantau tren sentimen kampus, statistik tiket, dan performa layanan.",
  },
  {
    icon: Users,
    title: "Live Chat",
    description: "Komunikasi real-time antara mahasiswa dan admin via WebSocket.",
  },
];

// Data untuk how it works
const steps = [
  {
    title: "Tulis Laporan",
    description: "Isi form pelaporan dengan detail. AI akan mengecek kemiripan dengan FAQ yang ada.",
  },
  {
    title: "AI Klasifikasi",
    description: "Sistem otomatis menentukan prioritas (Urgent/Normal/Low) menggunakan NLP.",
  },
  {
    title: "Pantau Progres",
    description: "Lihat status tiket secara real-time dan chat langsung dengan admin penanggung jawab.",
  },
];