<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MlTrainingData extends Model
{
    use HasFactory;

    protected $fillable = [
        'text',
        'label',
        'source',
        'ticket_id',
        'corrected_by',
        'correction_note',
        'confidence_score',
        'is_used_for_training',
        'metadata',
    ];

    protected $casts = [
        'confidence_score' => 'float',
        'is_used_for_training' => 'boolean',
        'metadata' => 'json',
    ];

    // Relationship: Ticket
    public function ticket(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Ticket::class, 'ticket_id');
    }

    // Relationship: Corrector
    public function correctedBy(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'corrected_by');
    }

    // Scope untuk data yang belum digunakan training
    public function scopeUnusedForTraining($query)
    {
        return $query->where('is_used_for_training', false);
    }

    // Mark as used for training
    public function markAsUsedForTraining(): void
    {
        $this->update(['is_used_for_training' => true]);
    }
}