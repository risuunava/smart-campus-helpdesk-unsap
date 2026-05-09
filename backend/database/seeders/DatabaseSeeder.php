<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('🌱 Memulai seeding database Smart Campus Helpdesk UNSAP...');
        $this->command->info('');

        // Panggil seeder secara berurutan
        $this->call([
            UserSeeder::class,
            FaqSeeder::class,
            TicketSeeder::class,
            ChatSeeder::class,
            MlTrainingDataSeeder::class,
        ]);

        $this->command->info('');
        $this->command->info('🎉 SEMUA DATA BERHASIL DI-SEED!');
        $this->command->info('');
        $this->command->info('📋 AKUN DEMO:');
        $this->command->info('═════════════════════════════════════════════');
        $this->command->info('👤 MAHASISWA:');
        $this->command->info('   • andi.mahasiswa@unsap.ac.id    | password123');
        $this->command->info('   • siti.mahasiswa@unsap.ac.id    | password123');
        $this->command->info('   • budi.mahasiswa@unsap.ac.id    | password123');
        $this->command->info('');
        $this->command->info('👥 ADMIN:');
        $this->command->info('   • ahmad.admin@unsap.ac.id       | password123');
        $this->command->info('   • maya.admin@unsap.ac.id        | password123');
        $this->command->info('');
        $this->command->info('👑 MASTER ADMIN:');
        $this->command->info('   • rektor.master@unsap.ac.id     | password123');
        $this->command->info('═════════════════════════════════════════════');
    }
}