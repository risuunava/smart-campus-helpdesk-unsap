<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Ticket extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'ticket_code',
        'title',
        'description',
        'category',
        'priority',
        'priority_source',
        'status',
        'is_anonymous',
        'anonymous_code',
        'attachment_path',
        'attachment_type',
        'resolved_at',
        'closed_at',
        'assigned_to',
        'resolved_by',
        'resolution_note',
        'ml_confidence_score',
        'ml_metadata',
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'resolved_at' => 'datetime',
        'closed_at' => 'datetime',
        'ml_confidence_score' => 'float',
        'ml_metadata' => 'json',
    ];

    protected $appends = [
        'attachment_url',
    ];

    public function getAttachmentUrlAttribute(): ?string
    {
        if (!$this->attachment_path) {
            return null;
        }

        // Gunakan Supabase Storage jika dikonfigurasi (production)
        if (config('filesystems.disks.supabase.endpoint')) {
            return Storage::disk('supabase')->url($this->attachment_path);
        }

        // Fallback ke local storage (development)
        return Storage::disk('public')->url($this->attachment_path);
    }

    // Relationship: User yang membuat tiket
    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Relationship: Admin yang ditugaskan
    public function assignedAdmin(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    // Relationship: Admin yang menyelesaikan
    public function resolvedBy(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    // Relationship: Chat messages
    public function chats(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Chat::class, 'ticket_id');
    }

    // Relationship: ML Training Data
    public function mlTrainingData(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(MlTrainingData::class, 'ticket_id');
    }

    // Scope untuk sorting urgent priority
    public function scopeUrgentFirst($query)
    {
        return $query->orderByRaw("
            CASE 
                WHEN priority = 'urgent' THEN 1
                WHEN priority = 'normal' THEN 2
                WHEN priority = 'low' THEN 3
                ELSE 4
            END
        ");
    }

    // Scope untuk filter status
    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    // Generate ticket code otomatis
    public static function generateTicketCode($date = null): string
    {
        $date = $date ?: now();
        $dateStr = $date->format('Ymd');
        
        $lastTicket = self::whereDate('created_at', $date)
            ->orderBy('id', 'desc')
            ->first();

        $number = $lastTicket ? intval(substr($lastTicket->ticket_code, -4)) + 1 : 1;
        return sprintf('TKT-%s-%04d', $dateStr, $number);
    }

    // Generate anonymous code
    public static function generateAnonymousCode(): string
    {
        $lastAnonymous = self::whereNotNull('anonymous_code')
            ->orderBy('id', 'desc')
            ->first();

        $number = $lastAnonymous ? intval(str_replace('Anonim_#', '', $lastAnonymous->anonymous_code)) + 1 : 1;
        return sprintf('Anonim_#%d', $number);
    }

    // Accessor untuk SLA (Service Level Agreement)
    public function getSlaHoursAttribute(): ?int
    {
        if ($this->resolved_at) {
            return $this->created_at->diffInHours($this->resolved_at);
        }
        return null;
    }
}