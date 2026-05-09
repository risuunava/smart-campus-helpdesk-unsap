<?php

namespace Database\Seeders;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Seeder;

class TicketSeeder extends Seeder
{
    /**
     * Data tiket demo
     */
    private function getTicketsData(): array
    {
        $mahasiswa = User::where('role', 'mahasiswa')->get();
        $admin = User::where('role', 'admin')->get();
        $masterAdmin = User::where('role', 'master_admin')->first();

        return [
            [
                'user_email' => 'andi.mahasiswa@unsap.ac.id',
                'title' => 'AC di Ruang 301 tidak berfungsi',
                'description' => 'AC di ruang kuliah 301 Gedung A sudah 3 hari tidak berfungsi. Suhu ruangan sangat panas dan mengganggu proses belajar mengajar. Mohon segera diperbaiki karena minggu depan ada ujian di ruangan tersebut.',
                'category' => 'fasilitas',
                'priority' => 'urgent',
                'priority_source' => 'manual',
                'status' => 'open',
                'is_anonymous' => false,
                'days_ago' => 3,
            ],
            [
                'user_email' => 'siti.mahasiswa@unsap.ac.id',
                'title' => 'Kesalahan jumlah tagihan UKT',
                'description' => 'Saya melihat tagihan UKT semester ini sebesar Rp 8.000.000 padahal seharusnya Rp 6.000.000 sesuai dengan golongan UKT saya (Golongan 3). Mohon dikoreksi karena saya tidak mampu membayar dengan jumlah tersebut.',
                'category' => 'keuangan',
                'priority' => 'urgent',
                'priority_source' => 'keyword_override',
                'status' => 'in_progress',
                'is_anonymous' => false,
                'assigned_email' => 'maya.admin@unsap.ac.id',
                'days_ago' => 2,
            ],
            [
                'user_email' => 'budi.mahasiswa@unsap.ac.id',
                'title' => 'Website portal akademik sering error',
                'description' => 'Sejak update terakhir, portal akademik sering mengalami error 500 ketika mengakses halaman KRS. Padahal saya harus segera mengisi KRS sebelum batas waktu. Mohon segera diperbaiki.',
                'category' => 'teknologi',
                'priority' => 'urgent',
                'priority_source' => 'ml_prediction',
                'status' => 'open',
                'is_anonymous' => false,
                'ml_confidence_score' => 0.89,
                'days_ago' => 1,
            ],
            [
                'user_email' => 'andi.mahasiswa@unsap.ac.id',
                'title' => 'Pengaduan perilaku dosen tidak profesional',
                'description' => 'Saya ingin melaporkan dosen mata kuliah Statistika yang sering datang terlambat lebih dari 30 menit tanpa pemberitahuan. Hal ini sangat merugikan mahasiswa karena materi tidak tersampaikan dengan baik.',
                'category' => 'akademik',
                'priority' => 'normal',
                'priority_source' => 'ml_prediction',
                'status' => 'open',
                'is_anonymous' => true,
                'ml_confidence_score' => 0.72,
                'days_ago' => 5,
            ],
            [
                'user_email' => 'siti.mahasiswa@unsap.ac.id',
                'title' => 'Permintaan jadwal tambahan bimbingan',
                'description' => 'Mohon dibukakan slot bimbingan tambahan dengan dosen wali karena jadwal yang tersedia selalu penuh. Saya perlu konsultasi terkait rencana studi semester depan.',
                'category' => 'akademik',
                'priority' => 'low',
                'priority_source' => 'ml_prediction',
                'status' => 'open',
                'is_anonymous' => false,
                'ml_confidence_score' => 0.65,
                'days_ago' => 7,
            ],
            [
                'user_email' => 'budi.mahasiswa@unsap.ac.id',
                'title' => 'Lampu parkiran mati, rawan kriminalitas',
                'description' => 'Lampu di area parkiran belakang kampus sudah mati seminggu. Area menjadi sangat gelap dan rawan tindak kriminal. Beberapa mahasiswa sudah kehilangan helm. Mohon segera ditindaklanjuti demi keamanan.',
                'category' => 'fasilitas',
                'priority' => 'urgent',
                'priority_source' => 'keyword_override',
                'status' => 'in_progress',
                'is_anonymous' => false,
                'assigned_email' => 'ahmad.admin@unsap.ac.id',
                'days_ago' => 4,
            ],
            [
                'user_email' => 'andi.mahasiswa@unsap.ac.id',
                'title' => 'Nilai mata kuliah belum keluar',
                'description' => 'Nilai mata kuliah Pemrograman Web sampai sekarang belum muncul di portal akademik padahal UAS sudah dilaksanakan 3 minggu yang lalu. Saya khawatir nilai tidak terinput dan mempengaruhi IPK.',
                'category' => 'akademik',
                'priority' => 'normal',
                'priority_source' => 'ml_prediction',
                'status' => 'resolved',
                'is_anonymous' => false,
                'assigned_email' => 'maya.admin@unsap.ac.id',
                'resolved_email' => 'maya.admin@unsap.ac.id',
                'resolution_note' => 'Nilai sudah diinput oleh dosen bersangkutan. Silakan cek portal akademik kembali.',
                'ml_confidence_score' => 0.71,
                'days_ago' => 21,
                'resolved_days_ago' => 1,
            ],
            [
                'user_email' => 'siti.mahasiswa@unsap.ac.id',
                'title' => 'Request pelatihan soft skill',
                'description' => 'Saya mengusulkan agar UNSAP mengadakan pelatihan soft skill seperti public speaking dan leadership secara rutin. Ini penting untuk pengembangan mahasiswa di dunia kerja.',
                'category' => 'kesejahteraan',
                'priority' => 'low',
                'priority_source' => 'ml_prediction',
                'status' => 'closed',
                'is_anonymous' => false,
                'assigned_email' => 'ahmad.admin@unsap.ac.id',
                'resolved_email' => 'ahmad.admin@unsap.ac.id',
                'resolution_note' => 'Terima kasih atas masukannya. Akan kami pertimbangkan untuk program semester depan.',
                'ml_confidence_score' => 0.34,
                'days_ago' => 15,
                'resolved_days_ago' => 10,
            ],
            [
                'user_email' => 'budi.mahasiswa@unsap.ac.id',
                'title' => 'Pelecehan oleh oknum satpam',
                'description' => 'Saya mengalami pelecehan verbal oleh oknum satpam di gerbang depan kampus. Beliau berbicara tidak pantas kepada saya ketika saya lupa membawa KTM. Ini sangat tidak terpuji dan membuat saya tidak nyaman.',
                'category' => 'lainnya',
                'priority' => 'urgent',
                'priority_source' => 'keyword_override',
                'status' => 'in_progress',
                'is_anonymous' => true,
                'assigned_email' => 'rektor.master@unsap.ac.id',
                'ml_confidence_score' => 0.92,
                'days_ago' => 0,
            ],
            [
                'user_email' => 'andi.mahasiswa@unsap.ac.id',
                'title' => 'KRS tidak bisa diakses, besok deadline',
                'description' => 'Sistem KRS online tidak bisa diakses sejak pagi. Padahal deadline pengisian KRS besok sore. Saya sangat khawatir ketinggalan mengisi KRS dan tidak bisa kuliah semester ini. MOHON BANTUAN SEGERA!',
                'category' => 'teknologi',
                'priority' => 'urgent',
                'priority_source' => 'keyword_override',
                'status' => 'open',
                'is_anonymous' => false,
                'ml_confidence_score' => 0.95,
                'days_ago' => 0,
            ],
        ];
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🎫 Membuat tiket demo...');

        $users = User::all()->keyBy('email');
        $count = 0;

        foreach ($this->getTicketsData() as $ticketData) {
            // Cari user berdasarkan email
            $user = $users->get($ticketData['user_email']);
            if (!$user) {
                $this->command->warn("⚠️  User {$ticketData['user_email']} tidak ditemukan, tiket dilewati.");
                continue;
            }

            $createdAt = now()->subDays($ticketData['days_ago']);
            
            // Buat tiket
            $ticket = new Ticket();
            $ticket->user_id = $user->id;
            $ticket->created_at = $createdAt;
            $ticket->ticket_code = Ticket::generateTicketCode($createdAt);
            $ticket->title = $ticketData['title'];
            $ticket->description = $ticketData['description'];
            $ticket->category = $ticketData['category'];
            $ticket->priority = $ticketData['priority'];
            $ticket->priority_source = $ticketData['priority_source'];
            $ticket->status = $ticketData['status'];
            $ticket->is_anonymous = $ticketData['is_anonymous'];
            $ticket->ml_confidence_score = $ticketData['ml_confidence_score'] ?? null;
            $ticket->resolution_note = $ticketData['resolution_note'] ?? null;

            // Set anonymous code jika anonim
            if ($ticketData['is_anonymous']) {
                $ticket->anonymous_code = Ticket::generateAnonymousCode();
            }

            // Set assigned admin
            if (isset($ticketData['assigned_email'])) {
                $assignedAdmin = $users->get($ticketData['assigned_email']);
                if ($assignedAdmin) {
                    $ticket->assigned_to = $assignedAdmin->id;
                }
            }

            // Set resolved admin dan resolved_at
            if (isset($ticketData['resolved_email'])) {
                $resolvedAdmin = $users->get($ticketData['resolved_email']);
                if ($resolvedAdmin) {
                    $ticket->resolved_by = $resolvedAdmin->id;
                    $ticket->resolved_at = now()->subDays($ticketData['resolved_days_ago']);
                }
            }

            // Set closed_at jika status closed
            if ($ticketData['status'] === 'closed') {
                $ticket->closed_at = $ticket->resolved_at ?? now()->subDays($ticketData['resolved_days_ago']);
            }

            $ticket->save();
            $count++;
        }

        $this->command->info("✅ {$count} tiket demo berhasil dibuat!");
    }
}