"use client";

import { useState } from "react";
import { TicketForm } from "@/components/forms/TicketForm";
import { BookOpen, ChevronDown, ChevronUp, Type, AlignLeft, Paperclip, AlertCircle } from "lucide-react";

const tips = [
  {
    icon: Type,
    label: "Judul",
    keywords: ["#JUDUL", "#SINGKAT", "#JELAS"],
    content:
      "Gunakan judul yang singkat, padat, dan langsung menggambarkan masalah. Contoh: \"AC Kelas B101 Mati\" lebih baik dari \"Ada masalah di kelas\".",
  },
  {
    icon: AlignLeft,
    label: "Deskripsi",
    keywords: ["#DETAIL", "#LOKASI", "#WAKTU"],
    content:
      "Jelaskan masalah secara lengkap — kapan terjadi, di mana lokasi, dan sudah berapa lama. Semakin detail, semakin cepat tim kami bisa membantu.",
  },
  {
    icon: Paperclip,
    label: "Lampiran",
    keywords: ["#FOTO", "#BUKTI", "#DOKUMEN"],
    content:
      "Sertakan foto atau dokumen pendukung jika ada. Bukti visual sangat membantu tim dalam mengidentifikasi dan menyelesaikan masalah lebih cepat.",
  },
  {
    icon: AlertCircle,
    label: "Batas Laporan",
    keywords: ["#LIMIT", "#KUOTA"],
    content:
      "Setiap mahasiswa dapat mengajukan maksimal 3 laporan per hari. Pastikan setiap laporan sudah terisi lengkap dan akurat sebelum dikirimkan.",
  },
];

export default function BuatLaporanPage() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <div className="container-mobile py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold th-text">Buat Laporan Baru</h1>
        <p className="th-text-2 mt-1">Silakan lengkapi detail laporan Anda di bawah ini.</p>
      </div>

      {/* Tips Section — FAQ-style accordion */}
      <div className="mb-8 max-w-2xl mx-auto">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-[#1ed760]/10 border border-[#1ed760]/20 flex items-center justify-center shadow-[0_0_12px_rgba(30,215,96,0.12)]">
            <BookOpen className="h-4 w-4 text-[#1ed760]" />
          </div>
          <div>
            <h2 className="text-sm font-bold th-text tracking-tight">Petunjuk Pengisian Laporan</h2>
            <p className="text-xs th-text-m mt-0.5">Ikuti panduan ini agar laporan Anda diproses lebih cepat.</p>
          </div>
        </div>

        {/* Accordion items */}
        <div className="space-y-2.5">
          {tips.map((tip, idx) => {
            const isOpen = expandedIdx === idx;
            const Icon = tip.icon;
            return (
              <div
                key={idx}
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? "border-[#1ed760]/40 shadow-[0_4px_20px_rgba(30,215,96,0.08)]"
                    : "border-th-border-s hover:border-th-border"
                }`}
                style={{ background: "var(--th-sunken)" }}
              >
                {/* Header row */}
                <button
                  onClick={() => setExpandedIdx(isOpen ? null : idx)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isOpen
                          ? "bg-[#1ed760]/15 text-[#1ed760]"
                          : "bg-th-raised th-text-m"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span
                      className={`font-semibold text-[13px] md:text-sm transition-colors ${
                        isOpen ? "text-[#1ed760]" : "th-text"
                      }`}
                    >
                      {tip.label}
                    </span>
                  </div>
                  <div
                    className={`p-1.5 rounded-full border transition-colors shrink-0 ${
                      isOpen
                        ? "border-[#1ed760]/30 text-[#1ed760] bg-[#1ed760]/5"
                        : "border-th-border-s th-text-m"
                    }`}
                    style={{ background: isOpen ? undefined : "var(--th-base)" }}
                  >
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {/* Expandable content */}
                <div
                  className={`px-5 transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "max-h-[400px] pb-5 opacity-100"
                      : "max-h-0 opacity-0 overflow-hidden"
                  }`}
                >
                  <div className="pt-3 border-t th-border-s">
                    <p className="th-text-2 text-[12px] md:text-[13px] leading-relaxed mt-2">
                      {tip.content}
                    </p>
                    {/* Keywords */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {tip.keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase border th-border-s th-text-m"
                          style={{ background: "var(--th-base)" }}
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <TicketForm />
    </div>
  );
}