<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'body',
        'data',
        'ticket_id',
        'read_at',
    ];

    protected $casts = [
        'data'    => 'array',
        'read_at' => 'datetime',
    ];

    // -------------------------------------------------------
    // Relationships
    // -------------------------------------------------------
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    // -------------------------------------------------------
    // Helpers
    // -------------------------------------------------------
    public function isRead(): bool
    {
        return $this->read_at !== null;
    }

    public function markAsRead(): void
    {
        if (!$this->isRead()) {
            $this->update(['read_at' => now()]);
        }
    }

    // -------------------------------------------------------
    // Factory method — buat notifikasi dengan mudah
    // -------------------------------------------------------
    public static function send(int $userId, string $type, string $title, string $body, array $data = [], ?int $ticketId = null): self
    {
        return self::create([
            'user_id'   => $userId,
            'type'      => $type,
            'title'     => $title,
            'body'      => $body,
            'data'      => $data,
            'ticket_id' => $ticketId,
        ]);
    }
}
