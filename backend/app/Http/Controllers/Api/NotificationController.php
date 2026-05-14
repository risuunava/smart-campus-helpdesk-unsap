<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Ambil semua notifikasi milik user yang login
     * GET /api/notifications
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        $unread = $notifications->whereNull('read_at')->count();

        return response()->json([
            'success' => true,
            'data'    => [
                'notifications' => $notifications,
                'unread_count'  => $unread,
            ],
        ]);
    }

    /**
     * Tandai satu notifikasi sebagai sudah dibaca
     * PUT /api/notifications/{id}/read
     */
    public function markRead(Request $request, int $id): JsonResponse
    {
        $notification = Notification::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $notification->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi ditandai telah dibaca',
        ]);
    }

    /**
     * Tandai SEMUA notifikasi sebagai sudah dibaca
     * PUT /api/notifications/read-all
     */
    public function markAllRead(Request $request): JsonResponse
    {
        Notification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Semua notifikasi ditandai telah dibaca',
        ]);
    }

    /**
     * Hapus satu notifikasi
     * DELETE /api/notifications/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        Notification::where('user_id', $request->user()->id)
            ->findOrFail($id)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi dihapus',
        ]);
    }

    /**
     * Hapus semua notifikasi yang sudah dibaca
     * DELETE /api/notifications/clear-read
     */
    public function clearRead(Request $request): JsonResponse
    {
        Notification::where('user_id', $request->user()->id)
            ->whereNotNull('read_at')
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi yang sudah dibaca berhasil dihapus',
        ]);
    }

    /**
     * Ambil jumlah notifikasi belum dibaca (untuk polling header)
     * GET /api/notifications/unread-count
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $count = Notification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'success' => true,
            'data'    => ['unread_count' => $count],
        ]);
    }
}
