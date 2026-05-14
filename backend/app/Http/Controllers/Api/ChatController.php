<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Notification;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ChatController extends Controller
{
    /**
     * Ambil semua pesan chat untuk satu tiket
     */
    public function index(Request $request, int $ticketId): JsonResponse
    {
        $ticket = Ticket::findOrFail($ticketId);

        // Mahasiswa hanya boleh melihat chat milik tiketnya sendiri
        if ($request->user()->isMahasiswa() && $ticket->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $chats = Chat::where('ticket_id', $ticketId)
            ->with(['sender:id,name,role'])
            ->orderBy('created_at', 'asc')
            ->get();

        // Sembunyikan identitas mahasiswa jika tiket anonim dan user bukan Master Admin
        $currentUser = $request->user();
        if ($ticket->is_anonymous && !$currentUser->isMasterAdmin()) {
            $chats->transform(function ($chat) use ($ticket, $currentUser) {
                // Mask jika pengirim adalah mahasiswa DAN (user yang melihat adalah orang lain)
                if ($chat->sender_type === 'mahasiswa' && $chat->sender_id !== $currentUser->id) {
                    $chat->sender->name = $ticket->anonymous_code;
                }
                return $chat;
            });
        }

        return response()->json([
            'success' => true,
            'data'    => $chats,
        ]);
    }

    /**
     * Kirim pesan baru
     */
    public function store(Request $request, int $ticketId): JsonResponse
    {
        $ticket = Ticket::findOrFail($ticketId);

        // Mahasiswa hanya boleh chat di tiketnya sendiri
        if ($request->user()->isMahasiswa() && $ticket->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'message' => 'required|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Pesan tidak boleh kosong',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $chat = Chat::create([
            'ticket_id' => $ticketId,
            'sender_id' => $request->user()->id,
            'message'   => $request->message,
            'sender_type' => $request->user()->role === 'mahasiswa' ? 'mahasiswa' : 'admin',
            'is_read'   => false,
        ]);

        // Load relasi sender agar response lengkap
        $chat->load('sender:id,name,role');

        // Sembunyikan identitas jika tiket anonim dan user bukan Master Admin
        $currentUser = $request->user();
        if ($ticket->is_anonymous && !$currentUser->isMasterAdmin()) {
            // Mask jika pengirim adalah mahasiswa DAN (user yang melihat adalah orang lain)
            if ($chat->sender_type === 'mahasiswa' && $chat->sender_id !== $currentUser->id) {
                $chat->sender->name = $ticket->anonymous_code;
            }
        }

        // Broadcast jika Reverb aktif (opsional, dibungkus try-catch)
        try {
            // event(new \App\Events\NewChatMessage($chat));
        } catch (\Throwable $e) {
            // Reverb mungkin tidak aktif; abaikan error
        }

        // ── Kirim notifikasi ke pihak lain ──────────────────────────────
        $sender = $request->user();

        if ($sender->isMahasiswa()) {
            $recipientId = $ticket->assigned_to ?? null;
            $senderName = $ticket->is_anonymous ? $ticket->anonymous_code : $sender->name;
            
            if ($recipientId) {
                // Notif ke admin yang di-assign
                Notification::send(
                    $recipientId,
                    'chat_received',
                    'Pesan Baru di Tiket',
                    $senderName . ' mengirim pesan di tiket #' . $ticket->ticket_code . ': "' . mb_substr($request->message, 0, 80) . '"',
                    ['ticket_code' => $ticket->ticket_code, 'sender_name' => $senderName],
                    $ticket->id
                );
            } else {
                // Jika belum ada yang di-assign, notif ke semua admin
                $admins = \App\Models\User::whereIn('role', ['admin', 'master_admin'])->where('is_active', true)->get();
                foreach ($admins as $admin) {
                    Notification::send(
                        $admin->id,
                        'chat_received',
                        'Pesan Baru di Tiket',
                        $senderName . ' mengirim pesan di tiket #' . $ticket->ticket_code . ': "' . mb_substr($request->message, 0, 80) . '"',
                        ['ticket_code' => $ticket->ticket_code, 'sender_name' => $senderName],
                        $ticket->id
                    );
                }
            }
        } else {
            // Admin kirim pesan → notif ke pemilik tiket (mahasiswa)
            Notification::send(
                $ticket->user_id,
                'chat_received',
                'Balasan dari Admin',
                'Admin membalas tiket #' . $ticket->ticket_code . ': "' . mb_substr($request->message, 0, 80) . '"',
                ['ticket_code' => $ticket->ticket_code, 'sender_name' => $sender->name],
                $ticket->id
            );
        }

        return response()->json([
            'success' => true,
            'data'    => $chat,
            'message' => 'Pesan terkirim',
        ], 201);
    }

    /**
     * Tandai pesan sebagai sudah dibaca
     */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $chat = Chat::findOrFail($id);

        // Hanya penerima (bukan pengirim) yang boleh menandai
        if ($chat->sender_id === $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $chat->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Pesan ditandai sudah dibaca',
        ]);
    }
}
