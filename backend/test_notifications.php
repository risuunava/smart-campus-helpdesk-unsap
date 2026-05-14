<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\Notification;

// Test for each user
$users = User::all();
foreach ($users as $user) {
    $count = Notification::where('user_id', $user->id)->count();
    $unread = Notification::where('user_id', $user->id)->whereNull('read_at')->count();
    echo "User #{$user->id} ({$user->name}) - Role: {$user->role} - Notifs: {$count}, Unread: {$unread}\n";
}

echo "\n--- Testing response format (simulating API) ---\n";

// Pick user 2 (Siti) to test
$testUser = User::find(2);
$notifications = Notification::where('user_id', $testUser->id)
    ->orderByDesc('created_at')
    ->limit(50)
    ->get();

$unread = $notifications->whereNull('read_at')->count();

$response = [
    'success' => true,
    'data' => [
        'notifications' => $notifications->toArray(),
        'unread_count' => $unread,
    ],
];

echo "Response structure keys: " . implode(', ', array_keys($response)) . "\n";
echo "data keys: " . implode(', ', array_keys($response['data'])) . "\n";
echo "notifications count: " . count($response['data']['notifications']) . "\n";
echo "unread_count: " . $response['data']['unread_count'] . "\n";

if (count($response['data']['notifications']) > 0) {
    echo "\nFirst notification sample:\n";
    echo json_encode($response['data']['notifications'][0], JSON_PRETTY_PRINT) . "\n";
}
