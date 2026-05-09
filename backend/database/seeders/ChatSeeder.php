<?php

namespace Database\Seeders;

use App\Models\Chat;
use App\Models\Ticket;
use Illuminate\Database\Seeder;

class ChatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('💬 Membuat chat demo...');

        // Cari tiket yang memiliki percakapan
        $ticket = Ticket::where('title', 'Kesalahan jumlah tagihan UKT')->first();

        if (!$ticket) {
            $this->command->warn('⚠️  Tiket UKT tidak ditemukan, chat dilewati.');
            return;
        }

        $chats = [
            [
                'sender_id' => $ticket->user_id,
                'message' => 'Saya benar-benar keberatan dengan tagihan UKT yang salah ini. Saya dari keluarga tidak mampu dan ini sangat memberatkan. Mohon segera dibantu.',
                'sender_type' => 'mahasiswa',
                'hours_ago' => 48,
                'is_read' => true,
            ],
            [
                'sender_id' => $ticket->assigned_to,
                'message' => 'Selamat siang, kami sudah menerima laporan Anda. Tim keuangan sedang memeriksa data pembayaran Anda. Mohon kesabarannya, akan kami proses dalam 1x24 jam.',
                'sender_type' => 'admin',
                'hours_ago' => 46,
                'is_read' => true,
            ],
            [
                'sender_id' => $ticket->user_id,
                'message' => 'Terima kasih atas responnya. Mohon segera diproses karena jatuh tempo pembayaran tinggal 5 hari lagi. Saya khawatir kena denda.',
                'sender_type' => 'mahasiswa',
                'hours_ago' => 24,
                'is_read' => false,
            ],
            [
                'sender_id' => $ticket->assigned_to,
                'message' => 'Baik, kami pahami kekhawatiran Anda. Tim keuangan sudah menemukan kesalahan input data. Sedang dalam proses koreksi. Estimasi selesai hari ini.',
                'sender_type' => 'admin',
                'hours_ago' => 22,
                'is_read' => false,
            ],
        ];

        $count = 0;
        foreach ($chats as $chatData) {
            Chat::create([
                'ticket_id' => $ticket->id,
                'sender_id' => $chatData['sender_id'],
                'message' => $chatData['message'],
                'sender_type' => $chatData['sender_type'],
                'is_read' => $chatData['is_read'],
                'read_at' => $chatData['is_read'] ? now()->subHours($chatData['hours_ago']) : null,
                'created_at' => now()->subHours($chatData['hours_ago']),
            ]);
            $count++;
        }

        $this->command->info("✅ {$count} chat demo berhasil dibuat!");
    }
}