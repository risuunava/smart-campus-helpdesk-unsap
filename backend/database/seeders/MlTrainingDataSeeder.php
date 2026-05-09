<?php

namespace Database\Seeders;

use App\Models\MlTrainingData;
use App\Models\User;
use Illuminate\Database\Seeder;

class MlTrainingDataSeeder extends Seeder
{
    /**
     * Data training ML
     */
    private function getTrainingData(): array
    {
        return [
            // Data Urgent
            [
                'text' => 'AC mati dan ruangan sangat panas, mohon segera diperbaiki karena mengganggu perkuliahan dan ujian',
                'label' => 'urgent',
                'source' => 'auto_ml',
                'confidence_score' => 0.88,
            ],
            [
                'text' => 'Lampu parkiran mati, area gelap dan rawan kejahatan, beberapa mahasiswa sudah kehilangan barang',
                'label' => 'urgent',
                'source' => 'auto_ml',
                'confidence_score' => 0.91,
            ],
            [
                'text' => 'Sistem KRS error tidak bisa akses portal akademik, padahal besok deadline pengisian',
                'label' => 'urgent',
                'source' => 'auto_ml',
                'confidence_score' => 0.95,
            ],
            [
                'text' => 'Tagihan UKT saya tidak sesuai, kelebihan 2 juta rupiah, saya tidak sanggup membayar',
                'label' => 'urgent',
                'source' => 'manual_correction',
                'correction_note' => 'UKT adalah masalah sensitif yang harus diprioritaskan karena berkaitan dengan keberlangsungan studi mahasiswa',
                'confidence_score' => 0.85,
            ],
            [
                'text' => 'Terjadi pelecehan verbal oleh oknum keamanan kampus, mohon ditindaklanjuti segera',
                'label' => 'urgent',
                'source' => 'auto_ml',
                'confidence_score' => 0.93,
            ],
            
            // Data Normal
            [
                'text' => 'Dosen mata kuliah Algoritma sering terlambat masuk kelas tanpa pemberitahuan',
                'label' => 'normal',
                'source' => 'auto_ml',
                'confidence_score' => 0.72,
            ],
            [
                'text' => 'Nilai mata kuliah semester lalu belum keluar di portal akademik',
                'label' => 'normal',
                'source' => 'auto_ml',
                'confidence_score' => 0.69,
            ],
            [
                'text' => 'Jadwal kuliah bentrok antara mata kuliah pilihan dan wajib',
                'label' => 'normal',
                'source' => 'auto_ml',
                'confidence_score' => 0.74,
            ],
            [
                'text' => 'Ruang kuliah sering berpindah-pindah tanpa pemberitahuan resmi',
                'label' => 'normal',
                'source' => 'manual_correction',
                'correction_note' => 'Masalah administrasi umum yang tidak urgent',
                'confidence_score' => 0.68,
            ],
            
            // Data Low
            [
                'text' => 'Mohon informasi jadwal bimbingan akademik dengan dosen wali',
                'label' => 'low',
                'source' => 'auto_ml',
                'confidence_score' => 0.63,
            ],
            [
                'text' => 'Usulan pelatihan soft skill public speaking untuk mahasiswa tingkat akhir',
                'label' => 'low',
                'source' => 'auto_ml',
                'confidence_score' => 0.41,
            ],
            [
                'text' => 'Request penambahan koleksi buku di perpustakaan untuk jurusan teknik',
                'label' => 'low',
                'source' => 'auto_ml',
                'confidence_score' => 0.38,
            ],
            [
                'text' => 'Saran penambahan menu makanan di kantin fakultas',
                'label' => 'low',
                'source' => 'auto_ml',
                'confidence_score' => 0.29,
            ],
            [
                'text' => 'Informasi mengenai kegiatan UKM semester ini',
                'label' => 'low',
                'source' => 'auto_ml',
                'confidence_score' => 0.35,
            ],
        ];
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🤖 Membuat data training ML...');

        // Cari admin untuk data koreksi manual
        $admin = User::where('role', 'admin')->first();

        $count = 0;
        foreach ($this->getTrainingData() as $data) {
            $trainingData = new MlTrainingData();
            $trainingData->text = $data['text'];
            $trainingData->label = $data['label'];
            $trainingData->source = $data['source'];
            $trainingData->confidence_score = $data['confidence_score'];
            
            // Jika manual correction, tambahkan data korektor
            if ($data['source'] === 'manual_correction' && $admin) {
                $trainingData->corrected_by = $admin->id;
                $trainingData->correction_note = $data['correction_note'] ?? null;
            }
            
            $trainingData->save();
            $count++;
        }

        $this->command->info("✅ {$count} data training ML berhasil dibuat!");
        $this->command->info('   - ' . collect($this->getTrainingData())->where('label', 'urgent')->count() . ' data URGENT');
        $this->command->info('   - ' . collect($this->getTrainingData())->where('label', 'normal')->count() . ' data NORMAL');
        $this->command->info('   - ' . collect($this->getTrainingData())->where('label', 'low')->count() . ' data LOW');
    }
}