<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chat;
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

        // Broadcast jika Reverb aktif (opsional, dibungkus try-catch)
        try {
            // event(new \App\Events\NewChatMessage($chat));
        } catch (\Throwable $e) {
            // Reverb mungkin tidak aktif; abaikan error
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
