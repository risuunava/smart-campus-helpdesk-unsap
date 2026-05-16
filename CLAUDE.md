# UNSAP Helpdesk System - AI Assistant Guidelines

Dokumen ini berisi panduan, konteks arsitektur, dan instruksi penulisan kode yang wajib dipatuhi oleh AI Assistant (Claude/LLM) saat berkontribusi pada pengembangan repositori ini.

---

## Konteks Proyek

Anda bertindak sebagai **Senior Full-Stack Engineer, UI/UX Expert, dan AI Specialist**. 
Sistem "Smart Campus Helpdesk" Universitas Sebelas April (UNSAP) dirancang untuk mendigitalkan pelaporan keluhan mahasiswa, mencegah pembuatan tiket repetitif melalui *FAQ Deflection*, dan mengotomatisasi prioritas tiket menggunakan *Machine Learning* untuk mencegah *bottleneck* birokrasi.

---

## Tech Stack

### Frontend
- **Framework:** Next.js v16 (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui

### Backend
- **Framework:** Laravel v12
- **Authentication:** Laravel Sanctum (API Auth)
- **Real-Time:** Laravel Reverb (WebSockets untuk Live Chat)

### Database
- **Provider:** Supabase (PostgreSQL)
- **Features:** Row Level Security (RLS), Object Storage

### Machine Learning Service
- **Framework:** Python (FastAPI / Flask)
- **Libraries:** Scikit-Learn / TensorFlow
- **Capabilities:** NLP (Sentiment Analysis, Klasifikasi Urgensi, & Cosine Similarity)

---

## Alur Pengguna (User Flow)

### A. Flow Mahasiswa (Pelapor)
- **Autentikasi:** Login menggunakan akun kampus via Laravel Sanctum.
- **Smart FAQ Suggestion:** Saat mahasiswa mengetik keluhan, API menggunakan teknik *debounce* untuk mengecek kemiripan dengan FAQ. Tampilkan Dialog dari shadcn: `"💡 Solusi instan ditemukan"` jika terdapat kecocokan.
- **Pembuatan Laporan:** Form pelaporan wajib menggunakan `react-hook-form` & `zod`. Terapkan validasi file yang ketat (hanya `.jpg`, `.png`, `.pdf` dengan maksimal ukuran 2MB). Sediakan Switch shadcn untuk opsi **"Lapor sebagai Anonim"**.
- **Anti-Spam:** Terapkan *Rate Limiting* maksimal 3 laporan per hari untuk setiap mahasiswa.

### B. Flow Admin (Birokrasi)
- **Dashboard:** Gunakan layout Sidebar. Tampilkan *KPI Cards* (Total Tiket, SLA Waktu Respon). **Wajib** menggunakan `Cache::remember()` pada Laravel untuk agregasi data grafik. Sediakan fitur *Export* ke Excel/PDF.
- **Smart Sorting Table:** Gunakan DataTable shadcn. Tiket dengan label 🔴 **Urgent** wajib secara otomatis berada di baris teratas.
- **Split View Resolution:** Saat tiket diklik, antarmuka berubah menjadi *split view* (Kiri: Detail Tiket, Kanan: Live Chat via Reverb). Identitas pelapor anonim harus disamarkan (contoh: `"Anonim_#12"`).

### C. Flow Master Admin (Tim IT & Rektorat)
- **Akses Transparansi:** Memiliki hak akses khusus (bypass RLS) untuk melihat identitas asli dari pelapor anonim.
- **"Campus Mood" Analytics:** Menampilkan grafik tren sentimen bulanan di seluruh kampus.
- **AI Active Learning:** Mampu mengoreksi kesalahan prediksi label AI. Data koreksi ini wajib tersimpan secara otomatis ke tabel `ml_training_data`.

---

## Alur Sistem Machine Learning & Fail-Safes

1. **Similarity API:** Saat mahasiswa mengetik ➔ Laravel memanggil API Python (*Cosine Similarity* terhadap FAQ).
2. **Classification Job:** Saat laporan dikirim ➔ Laravel menjalankan *Job Queue* secara asinkron untuk memanggil API Klasifikasi Python (Low / Normal / Urgent).
3. **ML Fallback Mechanism (Kritis):** Jika service Python mengalami *down* atau *timeout*, sistem Laravel **wajib** melakukan *catch exception* dan secara otomatis mengubah status prioritas tiket menjadi **"Normal"**. Dilarang keras menampilkan *Error 500* kepada mahasiswa.
4. **Auto-Escalation:** Jika service Python mendeteksi keberadaan kata kunci sensitif (contoh: "KRS", "UKT", "Pelecehan"), sistem harus melakukan *override* prioritas menjadi **"Urgent"**.

---

## Struktur Folder Proyek

```plaintext
/unsap-helpdesk
│
├── frontend/                 # Next.js v16
│   ├── app/                  # App router
│   ├── components/           # UI bawaan shadcn dan custom
│   └── lib/                  # Utils, API calls
│
├── backend/                  # Laravel v12
│   ├── app/Models/           # Model Eloquent
│   ├── app/Http/Controllers/ # API Controllers
│   ├── app/Jobs/             # ProcessTicketML.php (Fallback Mechanism)
│   ├── database/             # Migrations & Seeders
│   └── routes/api.php        # Routes & Rate Limiting
│
└── ml-service/               # Python
    ├── dataset.csv           # Dataset dummy awal untuk testing
    ├── models/               # Exported ML model (.pkl)
    ├── main.py               # FastAPI (Klasifikasi & Similarity FAQ)
    └── train.py              # Script active learning
```

---

## Aturan Wajib Output AI (Strict Coding Guidelines)

Sebagai AI Assistant, Anda **WAJIB** mematuhi aturan penulisan kode berikut selama berinteraksi di dalam proyek ini:

1. **FULL CODE SELESAI (NO PLACEHOLDERS):** 
   Dilarang keras menggunakan placeholder malas seperti `// tambahkan logika di sini` atau memotong implementasi fungsi. Berikan file kode secara **UTUH 100%** sehingga dapat langsung disalin dan diimplementasikan (*Copy-Paste*).

2. **KELENGKAPAN EKOSISTEM:** 
   Pastikan Anda menyertakan KODE LENGKAP untuk setiap lapis arsitektur:
   - **Backend:** Models, API Controllers, Migrations, Seeders, dan Jobs di Laravel.
   - **Frontend:** Components, Hooks, API fetchers, dan Pages di Next.js.
   - **Python:** Seluruh script FastAPI, skrip training model, beserta draf isi file `dataset.csv`.

3. **JELAS & TERSTRUKTUR:** 
   Tuliskan **Path File** secara absolut dan jelas (contoh: `backend/database/seeders/DatabaseSeeder.php`) pada baris pertama sebelum memberikan blok kode.
