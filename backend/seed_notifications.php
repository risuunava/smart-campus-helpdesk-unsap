<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Notification;
use App\Models\User;

$users = User::all();
$count = 0;

foreach ($users as $user) {
    Notification::send(
        $user->id,
        'ticket_created',
        'Tiket Berhasil Dibuat',
        'Tiket "Test Laporan" (#TKT-TEST-001) telah berhasil dibuat dan sedang diproses.',
        ['ticket_code' => 'TKT-TEST-001', 'category' => 'akademik'],
        null
    );
    $count++;

    Notification::send(
        $user->id,
        'password_changed',
        'Password Diperbarui',
        'Password akun Anda berhasil diubah. Jika bukan Anda, segera hubungi admin.'
    );
    $count++;

    Notification::send(
        $user->id,
        'chat_received',
        'Pesan Baru di Tiket',
        'Admin membalas tiket #TKT-TEST-001: "Laporan Anda sedang kami proses."',
        ['ticket_code' => 'TKT-TEST-001', 'sender_name' => 'Admin'],
        null
    );
    $count++;

    Notification::send(
        $user->id,
        'profile_updated',
        'Profil Diperbarui',
        'Informasi profil Anda berhasil diperbarui.',
        ['updated_fields' => ['name', 'email']]
    );
    $count++;

    Notification::send(
        $user->id,
        'ticket_status_changed',
        'Status Tiket Diperbarui',
        'Tiket "Test Laporan" (#TKT-TEST-001) kini berstatus: Sedang Diproses.',
        ['ticket_code' => 'TKT-TEST-001', 'new_status' => 'in_progress', 'status_label' => 'Sedang Diproses'],
        null
    );
    $count++;
}

echo "Created {$count} notifications for " . $users->count() . " users.\n";
echo "Total in DB: " . Notification::count() . "\n";
