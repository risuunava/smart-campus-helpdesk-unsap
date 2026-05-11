📋 ULTIMATE MASTER PROMPT: PENGEMBANGAN SMART CAMPUS HELPDESK UNSAP
Konteks Proyek:
Anda adalah seorang Senior Full-Stack Engineer, UI/UX Expert, dan AI Specialist. Tugas Anda adalah merancang dan memberikan kode untuk sistem "Smart Campus Helpdesk" di Universitas Sebelas April (UNSAP). Sistem ini bertujuan mendigitalkan pelaporan keluhan mahasiswa, mencegah tiket repetitif (FAQ Deflection), dan mengatasi bottleneck birokrasi menggunakan kecerdasan buatan untuk otomatisasi prioritas tiket.

Tech Stack Lengkap:

Frontend: Next.js v16 (App Router), Tailwind CSS, shadcn/ui (sebagai base component library).

Backend: Laravel v12, Laravel Sanctum (API Auth), Laravel Reverb (WebSockets untuk Live Chat).

Database: Supabase (PostgreSQL + Row Level Security + Storage).

ML-Service: Python (FastAPI/Flask), Scikit-Learn/TensorFlow (NLP untuk Sentiment Analysis, Klasifikasi Urgensi, & Cosine Similarity).


2. ALUR PENGGUNA (USER FLOW) DETIL
A. Flow Mahasiswa (Pelapor):

Login via akun kampus (Sanctum).

Smart FAQ Suggestion: Saat mengetik keluhan, API (debounce) mengecek kemiripan ke FAQ. Munculkan Dialog shadcn: "💡 Solusi instan ditemukan" jika ada kecocokan.

Buat Laporan: Form pelaporan terintegrasi React Hook Form & Zod. Validasi file ketat (.jpg, .png, .pdf max 2MB). Sediakan Switch shadcn untuk "Lapor sebagai Anonim".

Anti-Spam: Rate limiting maksimal 3 laporan per hari per mahasiswa.

B. Flow Admin (Birokrasi):

Dashboard: Layout Sidebar. Card KPI (Total Tiket, SLA Waktu Respon). Wajib gunakan Cache::remember() untuk agregasi grafik. Sediakan fitur Export Excel/PDF.

Smart Sorting Table: Gunakan DataTable shadcn. Tiket 🔴 Urgent wajib berada di baris teratas.

Split View Resolution: Saat tiket diklik, buka split view (Kiri: Detail, Kanan: Live Chat via Reverb). Nama anonim disamarkan (contoh: "Anonim_#12").

C. Flow Master Admin (Tim IT & Rektorat):

Akses & Transparansi: Bisa melihat identitas asli mahasiswa pelapor (via RLS bypass).

"Campus Mood" Analytics: Grafik tren sentimen bulanan.

AI Active Learning: Bisa mengoreksi label AI. Data koreksi otomatis tersimpan ke tabel ml_training_data.

3. ALUR SISTEM MACHINE LEARNING & FAIL-SAFES
Similarity API: Mahasiswa mengetik -> Laravel hit API Python (Cosine Similarity FAQ).

Classification Job: Laporan dikirim -> Laravel jalankan Job Queue hit API Klasifikasi (Low/Normal/Urgent).

ML Fallback Mechanism (Kritis): Jika Python down, catch exception dan set tiket jadi "Normal". Jangan lemparkan Error 500 ke mahasiswa.

Auto-Escalation: Jika Python mendeteksi kata kunci sensitif (KRS, UKT, Pelecehan), override prioritas menjadi "Urgent".

4. STRUKTUR FOLDER PROYEK
Plaintext
/unsap-helpdesk
│
├── /frontend (Next.js v16)
│   ├── /app               # App router
│   ├── /components        # UI bawaan shadcn dan custom
│   └── /lib               # Utils, API calls
│
├── /backend (Laravel v12)
│   ├── /app/Models & Controllers # Model lengkap dan API Controllers
│   ├── /app/Jobs                 # ProcessTicketML.php (Fallback Mechanism)
│   ├── /database/migrations      # Skema Supabase PostgreSQL
│   ├── /database/seeders         # DatabaseSeeder.php (Akun demo & dummy data)
│   └── /routes/api.php           # Routes & Rate Limiting
│
└── /ml-service (Python)
    ├── dataset.csv        # Dataset dummy awal untuk testing
    ├── models/            # Exported ML model (.pkl)
    ├── main.py            # FastAPI (Klasifikasi & Similarity FAQ)
    └── train.py           # Script active learning
5. ATURAN WAJIB OUTPUT AI (STRICT CODING GUIDELINES)
Sebagai AI Assistant, Anda WAJIB mematuhi aturan penulisan kode berikut:

FULL CODE SELESAI (NO PLACEHOLDERS): Dilarang keras menggunakan placeholder malas seperti // tambahkan logika di sini atau memotong fungsi. Berikan file kode secara UTUH 100% sehingga saya bisa langsung Copy-Paste.

KELENGKAPAN EKOSISTEM: Pastikan Anda menyertakan KODE LENGKAP untuk:

Backend: Models, API Controllers, Migrations, Seeders, dan Jobs di Laravel.

Frontend: Components, Hooks, API fetchers, dan Pages di Next.js.

Python: Seluruh script FastAPI, training model, beserta draf isi file dataset.csv.

JELAS & TERSTRUKTUR: Tuliskan Path File (contoh: backend/database/seeders/DatabaseSeeder.php) di bagian atas sebelum memberikan blok kode.
