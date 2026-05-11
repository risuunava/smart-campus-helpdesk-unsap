"use client";

import { TicketForm } from "@/components/forms/TicketForm";

export default function BuatLaporanPage() {
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

      {/* Tips Card */}
      <div className="bg-[#1ed760]/5 border border-[#1ed760]/15 rounded-xl p-5 mb-8">
        <h3 className="font-semibold text-[#1ed760] mb-3 flex items-center gap-2">
          Tips Membuat Laporan yang Baik:
        </h3>
        <ul className="text-sm text-[#b3b3b3] space-y-2 list-disc pl-5">
          <li>Gunakan judul yang jelas dan deskriptif</li>
          <li>Jelaskan kronologi kejadian secara detail</li>
          <li>Sertakan lokasi dan waktu kejadian</li>
          <li>Lampirkan foto atau dokumen pendukung jika ada</li>
        </ul>
        <div className="mt-4 pt-3 border-t border-[#1ed760]/10 flex items-start gap-2">
          <p className="text-xs text-[#1ed760]/80">Note: Anda hanya dapat membuat 3 laporan per hari.</p>
        </div>
      </div>

      {/* Form */}
      <TicketForm />
    </div>
  );
}