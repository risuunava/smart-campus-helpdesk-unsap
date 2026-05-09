<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketRateLimit extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'ticket_count',
    ];

    protected $casts = [
        'date' => 'date',
        'ticket_count' => 'integer',
    ];

    // Relationship
    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Cek apakah user sudah mencapai limit
    public function hasReachedLimit(): bool
    {
        return $this->ticket_count >= 3; // Max 3 tiket per hari
    }

    // Increment ticket count
    public function incrementCount(): void
    {
        $this->increment('ticket_count');
    }
}