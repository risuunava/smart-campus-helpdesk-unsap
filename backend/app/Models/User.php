<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'nim',
        'faculty',
        'study_program',
        'semester',
        'role',
        'is_active',
        'avatar',
    ];

    protected $appends = ['avatar_url'];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
        'semester' => 'integer',
    ];

    public function getAvatarUrlAttribute(): ?string
    {
        if (!$this->avatar) {
            return null;
        }

        // Gunakan Supabase Storage jika dikonfigurasi (production)
        // Format URL publik Supabase: {SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}
        if (config('filesystems.disks.supabase.endpoint')) {
            $url = config('filesystems.disks.supabase.url');
            if (!$url) {
                // Fallback jika SUPABASE_STORAGE_URL tidak diset di .env
                $endpoint = config('filesystems.disks.supabase.endpoint');
                $url = str_replace('.storage.supabase.co/storage/v1/s3', '.supabase.co/storage/v1', $endpoint);
            }
            
            $supabaseUrl = rtrim($url, '/');
            $bucket = config('filesystems.disks.supabase.bucket', 'attachments');
            $path = ltrim($this->avatar, '/');
            return "{$supabaseUrl}/object/public/{$bucket}/{$path}";
        }

        // Fallback ke local storage (development) - pastikan HTTPS
        return Storage::disk('public')->url($this->avatar);
    }

    // Helper methods untuk cek role
    public function isMahasiswa(): bool
    {
        return $this->role === 'mahasiswa';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isMasterAdmin(): bool
    {
        return $this->role === 'master_admin';
    }

    public function canViewAnonymousIdentity(): bool
    {
        return $this->isMasterAdmin();
    }

    // Relationships
    public function tickets(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Ticket::class, 'user_id');
    }

    public function assignedTickets(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Ticket::class, 'assigned_to');
    }

    public function resolvedTickets(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Ticket::class, 'resolved_by');
    }

    public function chats(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Chat::class, 'sender_id');
    }

    public function faqs(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Faq::class, 'created_by');
    }

    public function mlTrainingCorrections(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(MlTrainingData::class, 'corrected_by');
    }

    public function rateLimits(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(TicketRateLimit::class, 'user_id');
    }
}