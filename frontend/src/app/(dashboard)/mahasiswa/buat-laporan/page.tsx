"use client";

import { useState } from "react";
import { TicketForm } from "@/components/forms/TicketForm";
import { Info, ChevronDown, ChevronUp } from "lucide-react";

export default function BuatLaporanPage() {
  const [showTips, setShowTips] = useState(false);

  return (
    <div className="container-mobile py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white animate-fade-in flex items-center gap-2">
          Buat Laporan Baru
        </h1>
        <p className="text-[#b3b3b3] mt-2">
          Laporkan masalah atau keluhan Anda. Sistem kami akan otomatis menentukan prioritas.
        </p>
      </div>

      {/* Collapsible Tips Section */}
      <div className="mb-8">
        <button
          onClick={() => setShowTips(!showTips)}
          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
            showTips 
              ? "bg-[#1ed760]/10 border-[#1ed760]/30 text-[#1ed760]" 
              : "bg-[#1f1f1f] border-[#282828] text-[#b3b3b3] hover:border-[#1ed760]/50 hover:bg-[#1ed760]/5"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${showTips ? "bg-[#1ed760]/20" : "bg-[#282828]"}`}>
              <Info className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm">Tips Membuat Laporan yang Baik</span>
          </div>
          {showTips ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showTips && (
          <div className="mt-2 p-5 bg-[#181818] border border-[#1ed760]/20 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
            <ul className="text-sm text-[#b3b3b3] space-y-3 list-disc pl-5">
              <li><strong className="text-white">Gunakan judul yang jelas:</strong> Contoh: "Lampu Taman Mati di Dekat Gedung A"</li>
              <li><strong className="text-white">Detail Kronologi:</strong> Jelaskan kapan Anda menemukannya dan dampak masalah tersebut.</li>
              <li><strong className="text-white">Lokasi Akurat:</strong> Sebutkan nama gedung atau area spesifik di kampus.</li>
              <li><strong className="text-white">Lampiran:</strong> Sertakan foto jika ada untuk mempercepat proses verifikasi.</li>
            </ul>
            <div className="mt-4 pt-4 border-t border-[#282828] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1ed760] animate-pulse"></span>
              <p className="text-xs text-[#b3b3b3]">Note: Anda hanya dapat membuat <span className="text-white font-bold">3 laporan</span> per hari.</p>
            </div>
          </div>
        )}
      </div>

      {/* Form */}
      <TicketForm />
    </div>
  );
}