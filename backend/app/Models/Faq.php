<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Faq extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'content',
        'category',
        'keywords',
        'view_count',
        'helpful_count',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'keywords' => 'json',
        'view_count' => 'integer',
        'helpful_count' => 'integer',
        'is_active' => 'boolean',
    ];

    // Relationship: Creator
    public function creator(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scope active
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Increment view count
    public function incrementViewCount(): void
    {
        $this->increment('view_count');
    }

    // Increment helpful count
    public function markAsHelpful(): void
    {
        $this->increment('helpful_count');
    }
}