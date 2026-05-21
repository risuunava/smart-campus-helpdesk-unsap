<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Data akun demo
     */
    private array $users = [
        // MAHASISWA
        [
            'name' => 'Andi Pratama',
            'email' => 'andi.mahasiswa@unsap.ac.id',
            'password' => 'password123',
            'nim' => '20240001',
            'faculty' => 'Fakultas Ilmu Komputer',
            'study_program' => 'Teknik Informatika',
            'semester' => 5,
            'role' => 'mahasiswa',
            'is_active' => 'true',
        ],
        [
            'name' => 'Siti Nurhaliza',
            'email' => 'siti.mahasiswa@unsap.ac.id',
            'password' => 'password123',
            'nim' => '20240002',
            'faculty' => 'Fakultas Ekonomi',
            'study_program' => 'Manajemen',
            'semester' => 3,
            'role' => 'mahasiswa',
            'is_active' => 'true',
        ],
        [
            'name' => 'Budi Santoso',
            'email' => 'budi.mahasiswa@unsap.ac.id',
            'password' => 'password123',
            'nim' => '20240003',
            'faculty' => 'Fakultas Teknik',
            'study_program' => 'Teknik Sipil',
            'semester' => 7,
            'role' => 'mahasiswa',
            'is_active' => 'true',
        ],
        
        // ADMIN
        [
            'name' => 'Dr. Ahmad Fauzi',
            'email' => 'ahmad.admin@unsap.ac.id',
            'password' => 'password123',
            'nim' => null,
            'faculty' => null,
            'study_program' => null,
            'semester' => null,
            'role' => 'admin',
            'is_active' => 'true',
        ],
        [
            'name' => 'Dra. Maya Indah',
            'email' => 'maya.admin@unsap.ac.id',
            'password' => 'password123',
            'nim' => null,
            'faculty' => null,
            'study_program' => null,
            'semester' => null,
            'role' => 'admin',
            'is_active' => 'true',
        ],
        
        // MASTER ADMIN
        [
            'name' => 'Prof. Dr. Rektor UNSAP',
            'email' => 'rektor.master@unsap.ac.id',
            'password' => 'password123',
            'nim' => null,
            'faculty' => null,
            'study_program' => null,
            'semester' => null,
            'role' => 'master_admin',
            'is_active' => 'true',
        ],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('📝 Membuat akun demo...');
        
        $count = 0;
        foreach ($this->users as $userData) {
            $userData['password'] = Hash::make($userData['password']);
            $userData['email_verified_at'] = now();
            
            User::create($userData);
            $count++;
        }

        $this->command->info("✅ {$count} akun demo berhasil dibuat!");
    }
}