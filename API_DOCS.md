# Smart Campus Helpdesk UNSAP - API Documentation

Dokumen ini berisi referensi lengkap mengenai antarmuka pemrograman aplikasi (API) yang digunakan dalam proyek Smart Campus Helpdesk UNSAP, mencakup **Backend (Laravel)**, **Frontend Client (Next.js)**, dan **Machine Learning Service (FastAPI)**.

---

## 1. Backend Service API (Laravel)
Base URL: `http://localhost:8000/api`

### 1.1. Public Routes (Tanpa Autentikasi)
| Endpoint | Method | Deskripsi |
| --- | --- | --- |
| `/health` | `GET` | Memeriksa status kesehatan server backend. |
| `/tickets/faq-suggestion` | `POST` | Mendapatkan saran FAQ otomatis berdasarkan input pengguna saat membuat laporan. |
| `/auth/login` | `POST` | Autentikasi user dan mendapatkan Sanctum token. |
| `/auth/register` | `POST` | Registrasi akun pengguna baru. |

### 1.2. Authentication Routes (Butuh Token)
Semua route di bawah ini membutuhkan header `Authorization: Bearer <token>`.

| Endpoint | Method | Deskripsi |
| --- | --- | --- |
| `/auth/logout` | `POST` | Mengakhiri sesi pengguna dan menghapus token. |
| `/auth/user` | `GET` | Mendapatkan data profil pengguna yang sedang login. |
| `/auth/profile` | `PUT` | Memperbarui data profil pengguna (Nama, Email, NIM, Fakultas, dll). |
| `/auth/password` | `PUT` | Memperbarui kata sandi pengguna. |
| `/auth/avatar` | `POST` | Mengunggah foto profil (avatar) pengguna. |

### 1.3. Ticket Management
| Endpoint | Method | Deskripsi |
| --- | --- | --- |
| `/tickets` | `GET` | Mengambil daftar tiket dengan dukungan pagination, filter, dan pencarian. |
| `/tickets` | `POST` | Membuat tiket laporan keluhan baru. |
| `/tickets/export` | `GET` | Meng-export data tiket (Hanya Admin & Master Admin). |
| `/tickets/{id}` | `GET` | Melihat detail dari spesifik tiket. |
| `/tickets/{id}` | `PUT` | Memperbarui data tiket (misalnya status, petugas, prioritas). |
| `/tickets/{id}/attachment`| `POST` | Menambahkan atau memperbarui lampiran pada tiket. |
| `/tickets/{id}/attachment`| `DELETE`| Menghapus lampiran tiket. |
| `/tickets/{id}/correct-ml`| `POST` | Mengoreksi pelabelan dari sistem ML (Master Admin only). |

### 1.4. Chat & Diskusi Tiket
| Endpoint | Method | Deskripsi |
| --- | --- | --- |
| `/tickets/{ticketId}/chats`| `GET` | Mendapatkan riwayat pesan/diskusi pada tiket. |
| `/tickets/{ticketId}/chats`| `POST` | Mengirim pesan balasan ke dalam diskusi tiket. |
| `/chats/{id}/read` | `PUT` | Menandai sebuah pesan telah dibaca. |

### 1.5. Dashboard & Analytics (Admin Only)
| Endpoint | Method | Deskripsi |
| --- | --- | --- |
| `/dashboard/stats` | `GET` | Statistik umum jumlah tiket berdasarkan status. |
| `/dashboard/trend` | `GET` | Data tren pelaporan dari waktu ke waktu. |
| `/dashboard/category-distribution`| `GET` | Distribusi tiket berdasarkan kategorinya. |
| `/dashboard/campus-mood` | `GET` | Data Campus Mood Board (sentimen mahasiswa) (Master Admin). |

### 1.6. FAQ Management
| Endpoint | Method | Deskripsi |
| --- | --- | --- |
| `/faqs` | `GET` | Mendapatkan daftar FAQ. |
| `/faqs` | `POST` | Menambah FAQ baru. |
| `/faqs/{id}` | `GET` | Mendapatkan detail FAQ. |
| `/faqs/{id}` | `PUT` | Memperbarui FAQ yang sudah ada. |
| `/faqs/{id}` | `DELETE`| Menghapus FAQ. |

### 1.7. Notifications
| Endpoint | Method | Deskripsi |
| --- | --- | --- |
| `/notifications` | `GET` | Daftar semua notifikasi untuk pengguna aktif. |
| `/notifications/unread-count`| `GET` | Menghitung jumlah notifikasi yang belum dibaca. |
| `/notifications/read-all` | `PUT` | Menandai semua notifikasi menjadi sudah dibaca. |
| `/notifications/clear-read` | `DELETE`| Membersihkan/menghapus notifikasi yang sudah dibaca. |
| `/notifications/{id}/read` | `PUT` | Menandai satu spesifik notifikasi sebagai sudah dibaca. |
| `/notifications/{id}` | `DELETE`| Menghapus satu spesifik notifikasi. |

---

## 2. Frontend API Client (Next.js)
File referensi: `frontend/src/lib/api.ts`

Frontend memanfaatkan kelas pembungkus (`ApiClient`) yang menangani penyematan Bearer token, pengaturan header, dan intercept handling ketika sesi *timeout* atau tidak sah (401).

### Konfigurasi & Setup Client
- **Variabel Env**: URL diatur melalui `NEXT_PUBLIC_API_URL`
- **Penyimpanan Token**: Token disimpan secara lokal di browser melalui `localStorage.getItem("auth_token")`
- **Timeout**: Timeout standar permintaan API dibatasi `30.000 ms` (30 detik).

### Method API Tersedia
Objek global `api` (`export const api = new ApiClient();`) dapat di-import di komponen/halaman dan menyediakan fungsi asinkron (Promise) berikut:
- **Auth**: `login()`, `logout()`, `getUser()`, `updateProfile()`, `updatePassword()`, `updateAvatar()`
- **Tickets**: `getTickets()`, `getTicket()`, `createTicket()`, `updateTicket()`, `updateAttachment()`, `deleteAttachment()`, `correctMLLabel()`
- **FAQ**: `getFAQSuggestions()`
- **Dashboard**: `getDashboardStats()`, `getDashboardTrend()`, `getCategoryDistribution()`, `getCampusMood()`
- **Chat**: `getChats()`, `sendMessage()`
- **Export**: `exportTickets()`
- **Notifications**: `getNotifications()`, `getUnreadCount()`, `markNotificationRead()`, `markAllNotificationsRead()`, `deleteNotification()`, `clearReadNotifications()`

---

## 3. ML Service API (FastAPI)
Base URL: `http://localhost:5000`

Machine Learning Service berjalan terpisah (microservice) untuk menampung fitur kecerdasan buatan dan prediksi secara real-time.

| Endpoint | Method | Deskripsi |
| --- | --- | --- |
| `/` | `GET` | Cek status layanan dan status *model loaded*. |
| `/api/health` | `GET` | Alias ke `/` untuk health check standar. |
| `/api/classify` | `POST` | Prediksi (Low, Normal, Urgent) keluhan secara instan menggunakan model ML. Body: `{ text: "...", category: "..." }` |
| `/api/similarity`| `POST` | Mencari daftar FAQ yang relevan dan memiliki kesamaan teks menggunakan *Cosine Similarity*. Body: `{ query: "..." }` |
| `/api/reload-models`|`POST` | Memuat ulang model klasifikasi ke memori *tanpa me-restart server*. |
| `/api/retrain` | `POST` | *Active Learning* - Melatih ulang model dari dataset terbaru secara *background task*. Body: `{ dataset_url: "...", force_retrain: bool }` |
| `/api/model-info` | `GET` | Melihat spesifikasi detail model klasifikasi yang sedang aktif dalam memori. |

### Contoh Request & Response (ML Service)
**POST `/api/classify`**
*Request Body:*
```json
{
  "text": "Lampu di ruang kelas B201 mati dan sudah mengganggu jalannya perkuliahan sejak kemarin.",
  "category": "infrastruktur"
}
```

*Response:*
```json
{
  "priority": "urgent",
  "confidence_score": 0.85,
  "probabilities": {
    "low": 0.05,
    "normal": 0.1,
    "urgent": 0.85
  },
  "model_version": "v1.0-PriorityClassifier",
  "processed_at": "2026-05-16T10:45:18+07:00",
  "processing_time_ms": 15.4
}
```
