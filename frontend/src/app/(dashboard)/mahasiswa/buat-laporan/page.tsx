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
        <h1 className="text-2xl font-bold th-text">
          Buat Laporan Baru
        </h1>
        <p className="th-text-2 mt-1">
          Silakan lengkapi detail laporan Anda di bawah ini.
        </p>
      </div>

      {/* Tips Section */}
      <div className="mb-8 max-w-2xl mx-auto">
        <button
          onClick={() => setShowTips(!showTips)}
          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${
            showTips 
              ? "bg-[#1ed760]/10 border-[#1ed760]/30 text-[#1ed760]" 
              : "th-raised th-border th-text-2 hover:th-border-s"
          }`}
          style={!showTips ? { background: 'var(--th-raised)', borderColor: 'var(--th-border)' } : {}}
        >
          <div className="flex items-center gap-3">
            <Info className="h-4 w-4" />
            <span className="font-semibold text-sm">Petunjuk Pengisian Laporan</span>
          </div>
          {showTips ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showTips && (
          <div className="mt-2 p-5 rounded-xl th-base th-border" style={{ border: '1px solid var(--th-border)' }}>
            <ul className="text-sm th-text-2 space-y-3 list-disc pl-5">
              <li><span className="th-text font-medium">Judul:</span> Gunakan judul yang singkat dan jelas.</li>
              <li><span className="th-text font-medium">Deskripsi:</span> Jelaskan detail kejadian, lokasi, dan waktu.</li>
              <li><span className="th-text font-medium">Lampiran:</span> Sertakan foto pendukung jika ada.</li>
            </ul>
            <div className="mt-4 pt-4 border-t th-border" style={{ borderTopColor: 'var(--th-border)' }}>
              <p className="text-xs th-text-m">Maksimal 3 laporan per hari.</p>
            </div>
          </div>
        )}
      </div>

      {/* Form */}
      <TicketForm />
    </div>
  );
}