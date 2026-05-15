"use client";

import { useState } from "react";
import { TicketForm } from "@/components/forms/TicketForm";
import { Info, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function BuatLaporanPage() {
  const [showTips, setShowTips] = useState(false);

  return (
    <div className="container-mobile py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Buat Laporan Baru
        </h1>
        <p className="text-[#b3b3b3] mt-1">
          Silakan lengkapi detail laporan Anda di bawah ini.
        </p>
      </div>

      {/* Tips Section */}
      <div className="mb-8">
        <button
          onClick={() => setShowTips(!showTips)}
          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${
            showTips 
              ? "bg-[#1ed760]/5 border-[#1ed760]/20 text-[#1ed760]" 
              : "bg-[#1f1f1f] border-[#282828] text-[#b3b3b3] hover:border-[#333333]"
          }`}
        >
          <div className="flex items-center gap-3">
            <Info className="h-4 w-4" />
            <span className="font-semibold text-sm">Petunjuk Pengisian Laporan</span>
          </div>
          {showTips ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showTips && (
          <div className="mt-2 p-5 bg-[#181818] border border-[#282828] rounded-xl">
            <ul className="text-sm text-[#b3b3b3] space-y-3 list-disc pl-5">
              <li><span className="text-white font-medium">Judul:</span> Gunakan judul yang singkat dan jelas.</li>
              <li><span className="text-white font-medium">Deskripsi:</span> Jelaskan detail kejadian, lokasi, dan waktu.</li>
              <li><span className="text-white font-medium">Lampiran:</span> Sertakan foto pendukung jika ada.</li>
            </ul>
            <div className="mt-4 pt-4 border-t border-[#282828]">
              <p className="text-xs text-[#666666]">Maksimal 3 laporan per hari.</p>
            </div>
          </div>
        )}
      </div>

      {/* Form */}
      <TicketForm />
    </div>
  );
}