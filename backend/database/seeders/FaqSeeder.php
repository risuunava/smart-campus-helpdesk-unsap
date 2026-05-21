<?php

namespace Database\Seeders;

use App\Models\Faq;
use App\Models\User;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    /**
     * Data FAQ
     */
    private function getFaqData(): array
    {
        return [
            [
                'title' => 'Cara mengisi KRS online',
                'content' => 'Untuk mengisi KRS online, silakan login ke portal akademik UNSAP di portal.unsap.ac.id. Pilih menu KRS, lalu pilih mata kuliah yang ingin diambil. Pastikan Anda sudah melakukan pembayaran UKT terlebih dahulu. Jika ada kendala, hubungi bagian akademik fakultas.',
                'category' => 'akademik',
                'keywords' => ['KRS', 'kartu rencana studi', 'mata kuliah', 'akademik'],
                'view_count' => 150,
                'helpful_count' => 45,
            ],
            [
                'title' => 'Prosedur pembayaran UKT',
                'content' => 'Pembayaran UKT dapat dilakukan melalui Bank Mitra UNSAP (Bank BNI, BRI, dan Mandiri). Gunakan kode billing yang terdapat di portal akademik. Pembayaran paling lambat tanggal 10 setiap bulannya. Keterlambatan pembayaran akan dikenakan denda 2%.',
                'category' => 'keuangan',
                'keywords' => ['UKT', 'pembayaran', 'biaya kuliah', 'keuangan'],
                'view_count' => 200,
                'helpful_count' => 78,
            ],
            [
                'title' => 'Pengaduan kerusakan fasilitas kampus',
                'content' => 'Untuk melaporkan kerusakan fasilitas (AC, proyektor, lampu, dll), silakan isi form pengaduan di helpdesk UNSAP atau hubungi bagian sarana prasarana di ekstensi 1234. Tim teknis akan merespon dalam 1x24 jam kerja.',
                'category' => 'fasilitas',
                'keywords' => ['kerusakan', 'fasilitas', 'AC', 'proyektor', 'perbaikan'],
                'view_count' => 89,
                'helpful_count' => 34,
            ],
            [
                'title' => 'Reset password akun mahasiswa',
                'content' => 'Jika lupa password akun mahasiswa, kunjungi helpdesk.unsap.ac.id/reset-password. Masukkan NIM dan email terdaftar. Link reset akan dikirim ke email. Jika tidak menerima email, hubungi IT Support di ekstensi 5678.',
                'category' => 'teknologi',
                'keywords' => ['password', 'reset', 'login', 'akun', 'lupa'],
                'view_count' => 300,
                'helpful_count' => 120,
            ],
            [
                'title' => 'Prosedur pengajuan cuti akademik',
                'content' => 'Mahasiswa dapat mengajukan cuti akademik dengan mengisi formulir di bagian akademik fakultas. Syarat: sudah menempuh minimal 2 semester, melunasi UKT semester berjalan, dan mendapat persetujuan dosen wali. Cuti maksimal 2 semester berturut-turut.',
                'category' => 'akademik',
                'keywords' => ['cuti', 'akademik', 'semester', 'pengajuan'],
                'view_count' => 75,
                'helpful_count' => 28,
            ],
            [
                'title' => 'Beasiswa yang tersedia di UNSAP',
                'content' => 'UNSAP menyediakan berbagai beasiswa: Beasiswa Prestasi Akademik (IPK ≥ 3.5), Beasiswa Bidikmisi (tidak mampu), Beasiswa Afirmasi (daerah 3T), dan Beasiswa Mitra (perusahaan). Informasi lengkap di bagian kemahasiswaan atau portal beasiswa UNSAP.',
                'category' => 'kesejahteraan',
                'keywords' => ['beasiswa', 'biaya', 'prestasi', 'bidikmisi'],
                'view_count' => 250,
                'helpful_count' => 95,
            ],
            [
                'title' => 'Jadwal wisuda dan pengambilan ijazah',
                'content' => 'Wisuda UNSAP dilaksanakan 2 kali setahun (Maret dan September). Pendaftaran wisuda dibuka 2 bulan sebelum pelaksanaan. Pengambilan ijazah dapat dilakukan 1 minggu setelah wisuda dengan membawa KTM dan bukti bebas perpustakaan.',
                'category' => 'administrasi',
                'keywords' => ['wisuda', 'ijazah', 'kelulusan', 'administrasi'],
                'view_count' => 180,
                'helpful_count' => 67,
            ],
            [
                'title' => 'Layanan konseling mahasiswa',
                'content' => 'UNSAP menyediakan layanan konseling gratis untuk mahasiswa di Gedung Kemahasiswaan Lt. 2. Konselor tersedia Senin-Jumat pukul 09.00-16.00. Dapat juga melakukan konsultasi online melalui aplikasi SehatJiwa UNSAP.',
                'category' => 'kesejahteraan',
                'keywords' => ['konseling', 'psikologi', 'mental', 'bimbingan'],
                'view_count' => 95,
                'helpful_count' => 42,
            ],
        ];
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('📚 Membuat data FAQ...');
        
        // Ambil admin pertama sebagai creator FAQ
        $admin = User::where('role', 'admin')->first();
        
        if (!$admin) {
            $this->command->error('❌ Admin tidak ditemukan. Pastikan UserSeeder sudah dijalankan!');
            return;
        }

        $count = 0;
        foreach ($this->getFaqData() as $faqData) {
            $faqData['keywords'] = json_encode($faqData['keywords']);
            $faqData['is_active'] = 'true';
            $faqData['created_by'] = $admin->id;
            
            Faq::create($faqData);
            $count++;
        }

        $this->command->info("✅ {$count} FAQ berhasil dibuat!");
    }
}