<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessTicketML;
use App\Models\Notification;
use App\Models\Ticket;
use App\Models\TicketRateLimit;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class TicketController extends Controller
{
    /**
     * GET /api/tickets
     * List tiket dengan filter dan sorting
     * Admin: lihat semua tiket
     * Mahasiswa: lihat tiket milik sendiri
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Base query
        $query = Ticket::query()->with(['user:id,name,email,nim', 'assignedAdmin:id,name']);
        
        // Jika mahasiswa, hanya lihat tiket sendiri
        if ($user->isMahasiswa()) {
            $query->where('user_id', $user->id);
        }
        
        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        // Filter by priority
        if ($request->has('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }
        
        // Filter by category
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }
        
        // Search by title or ticket_code
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('ticket_code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        // Date range filter
        if ($request->has('date_from') && !empty($request->date_from)) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to') && !empty($request->date_to)) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        
        // Sorting: Urgent first (default)
        if ($request->has('sort_by')) {
            $query->orderBy($request->sort_by, $request->sort_order ?? 'desc');
        } else {
            $query->urgentFirst()->latest();
        }
        
        // Pagination
        $perPage = min($request->per_page ?? 15, 50); // Max 50 per page
        $tickets = $query->paginate($perPage);
        
        // Sembunyikan identitas anonim untuk admin biasa
        if ($user->isAdmin() && !$user->isMasterAdmin()) {
            $tickets->through(function ($ticket) {
                if ($ticket->is_anonymous) {
                    // Master admin tetap bisa lihat identitas asli
                    $ticket->user->name = $ticket->anonymous_code;
                    $ticket->user->email = '***';
                    $ticket->user->nim = '***';
                }
                return $ticket;
            });
        }
        
        return response()->json([
            'success' => true,
            'data' => $tickets,
            'message' => 'Tiket berhasil diambil',
        ]);
    }

    /**
     * POST /api/tickets
     * Buat tiket baru dengan ML processing dan anti-spam
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Validasi input
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255|min:10',
            'description' => 'required|string|min:20|max:5000',
            'category' => 'required|in:akademik,keuangan,fasilitas,teknologi,administrasi,kesejahteraan,lainnya',
            'is_anonymous' => 'boolean',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048', // Max 2MB
        ], [
            'title.required' => 'Judul laporan wajib diisi',
            'title.min' => 'Judul laporan minimal 10 karakter',
            'description.required' => 'Deskripsi laporan wajib diisi',
            'description.min' => 'Deskripsi laporan minimal 20 karakter',
            'category.required' => 'Kategori laporan wajib dipilih',
            'attachment.max' => 'Ukuran file maksimal 2MB',
            'attachment.mimes' => 'File harus berupa JPG, PNG, atau PDF',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }
        
        // Anti-Spam: Rate limiting 3 tiket per hari
        $canCreate = $this->checkDailyLimit($user->id);
        if (!$canCreate) {
            return response()->json([
                'success' => false,
                'message' => 'Anda telah mencapai batas maksimal 3 laporan per hari. Silakan coba lagi besok.',
            ], 429); // 429 Too Many Requests
        }
        
        // Anti-Spam: Rate limiting berdasarkan IP (opsional)
        $executed = RateLimiter::attempt(
            'create-ticket:' . $request->ip(),
            $perMinute = 2, // Max 2 tiket per menit
            function () {
                // Kosong, hanya untuk counting
            }
        );
        
        if (!$executed) {
            return response()->json([
                'success' => false,
                'message' => 'Terlalu banyak permintaan. Silakan tunggu beberapa saat.',
            ], 429);
        }
        
        DB::beginTransaction();
        
        try {
            // Handle file upload
            $attachmentPath = null;
            $attachmentType = null;
            
            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');
                $attachmentType = $file->getClientOriginalExtension();
                $disk = config('filesystems.disks.supabase.endpoint') ? 'supabase' : 'public';
                $attachmentPath = $file->store('tickets/' . date('Y/m'), $disk);
            }
            
            // Buat tiket
            $ticket = new Ticket();
            $ticket->user_id = $user->id;
            $ticket->ticket_code = Ticket::generateTicketCode();
            $ticket->title = $request->title;
            $ticket->description = $request->description;
            $ticket->category = $request->category;
            $ticket->is_anonymous = $request->is_anonymous ?? false;
            $ticket->attachment_path = $attachmentPath;
            $ticket->attachment_type = $attachmentType;
            $ticket->status = 'open';
            
            // Generate anonymous code jika anonim
            if ($ticket->is_anonymous) {
                $ticket->anonymous_code = Ticket::generateAnonymousCode();
            }
            
            $ticket->save();
            
            // Increment rate limit counter
            $this->incrementDailyLimit($user->id);
            
            DB::commit();
            
            // Jalankan ML Processing secara async (Job Queue)
            ProcessTicketML::dispatch($ticket);

            // Kirim notifikasi ke pembuat tiket
            Notification::send(
                $user->id,
                'ticket_created',
                'Tiket Berhasil Dibuat',
                'Tiket "' . $ticket->title . '" (#' . $ticket->ticket_code . ') telah berhasil dibuat dan sedang diproses.',
                ['ticket_code' => $ticket->ticket_code, 'category' => $ticket->category],
                $ticket->id
            );

            // Kirim notifikasi ke semua admin dan master admin
            $admins = User::whereIn('role', ['admin', 'master_admin'])->where('is_active', true)->get();
            foreach ($admins as $admin) {
                Notification::send(
                    $admin->id,
                    'new_ticket',
                    'Tiket Baru Masuk',
                    'Tiket baru "' . $ticket->title . '" (#' . $ticket->ticket_code . ') telah dibuat. Segera lakukan pengecekan.',
                    ['ticket_code' => $ticket->ticket_code, 'category' => $ticket->category],
                    $ticket->id
                );
            }

            
            return response()->json([
                'success' => true,
                'data' => $ticket->load('user:id,name,email'),
                'message' => 'Tiket berhasil dibuat. Sistem akan memproses prioritas secara otomatis.',
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            // Log error
            \Log::error('Error creating ticket: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat tiket. Silakan coba lagi.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * GET /api/tickets/{id}
     * Detail tiket dengan chat history
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        
        $ticket = Ticket::with([
            'user:id,name,email,nim,faculty,study_program',
            'assignedAdmin:id,name,email',
            'resolvedBy:id,name',
            'mlTrainingData',
        ])->find($id);
        
        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Tiket tidak ditemukan',
            ], 404);
        }
        
        // Authorization: Mahasiswa hanya bisa lihat tiket sendiri
        if ($user->isMahasiswa() && $ticket->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke tiket ini',
            ], 403);
        }
        
        // Sembunyikan identitas anonim untuk admin biasa (Pemilik tiket dan Master Admin tetap bisa melihat)
        if ($ticket->is_anonymous && !$user->isMasterAdmin() && $ticket->user_id !== $user->id) {
            $ticket->user->name = $ticket->anonymous_code;
            $ticket->user->email = '***';
            $ticket->user->nim = '***';
            $ticket->user->faculty = '***';
            $ticket->user->study_program = '***';
        }
        
        return response()->json([
            'success' => true,
            'data' => $ticket,
            'message' => 'Detail tiket berhasil diambil',
        ]);
    }

    /**
     * PUT /api/tickets/{id}
     * Update tiket (Admin only)
     */
    public function update(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        
        // Hanya admin yang bisa update
        if (!$user->isAdmin() && !$user->isMasterAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses',
            ], 403);
        }
        
        $ticket = Ticket::find($id);
        
        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Tiket tidak ditemukan',
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|in:open,in_progress,resolved,closed',
            'priority' => 'sometimes|in:low,normal,urgent',
            'assigned_to' => 'sometimes|exists:users,id',
            'resolution_note' => 'required_if:status,resolved,closed|string|nullable',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }
        
        DB::beginTransaction();
        
        try {
            if ($request->has('status')) {
                $ticket->status = $request->status;
                
                // Set resolved_at jika tiket di-resolve
                if ($request->status === 'resolved' || $request->status === 'closed') {
                    $ticket->resolved_at = now();
                    $ticket->resolved_by = $user->id;
                }
                
                // Set closed_at jika tiket di-close
                if ($request->status === 'closed') {
                    $ticket->closed_at = now();
                }
            }
            
            if ($request->has('priority')) {
                $ticket->priority = $request->priority;
                $ticket->priority_source = 'manual';
            }
            
            if ($request->has('assigned_to')) {
                $ticket->assigned_to = $request->assigned_to;
            }
            
            if ($request->has('resolution_note')) {
                $ticket->resolution_note = $request->resolution_note;
            }
            
            $ticket->save();
            
            DB::commit();

            // Kirim notifikasi ke pemilik tiket jika statusnya berubah
            if ($request->has('status')) {
                $statusLabels = [
                    'open'        => 'Terbuka',
                    'in_progress' => 'Sedang Diproses',
                    'resolved'    => 'Selesai',
                    'closed'      => 'Ditutup',
                ];
                $statusLabel = $statusLabels[$request->status] ?? $request->status;

                Notification::send(
                    $ticket->user_id,
                    'ticket_status_changed',
                    'Status Tiket Diperbarui',
                    'Tiket "' . $ticket->title . '" (#' . $ticket->ticket_code . ') kini berstatus: ' . $statusLabel . '.',
                    ['ticket_code' => $ticket->ticket_code, 'new_status' => $request->status, 'status_label' => $statusLabel],
                    $ticket->id
                );
            }
            
            // Clear cache dashboard setelah update tiket
            Cache::forget('dashboard:stats');
            Cache::forget('dashboard:trend');
            Cache::forget('dashboard:category_distribution');
            
            return response()->json([
                'success' => true,
                'data' => $ticket->fresh()->load('assignedAdmin:id,name'),
                'message' => 'Tiket berhasil diupdate',
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            \Log::error('Error updating ticket: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate tiket',
            ], 500);
        }
    }

    /**
     * POST /api/tickets/{id}/attachment
     * Update/Tambah lampiran tiket (Mahasiswa only for their own ticket)
     */
    public function updateAttachment(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json(['success' => false, 'message' => 'Tiket tidak ditemukan'], 404);
        }

        if ($user->isMahasiswa() && $ticket->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Anda tidak memiliki akses ke tiket ini'], 403);
        }

        if ($ticket->status === 'closed') {
            return response()->json(['success' => false, 'message' => 'Tidak dapat mengubah lampiran pada tiket yang sudah ditutup'], 403);
        }

        $validator = Validator::make($request->all(), [
            'attachment' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $disk = config('filesystems.disks.supabase.endpoint') ? 'supabase' : 'public';

            if ($ticket->attachment_path && Storage::disk($disk)->exists($ticket->attachment_path)) {
                Storage::disk($disk)->delete($ticket->attachment_path);
            }

            $file = $request->file('attachment');
            $attachmentType = $file->getClientOriginalExtension();
            $attachmentPath = $file->store('tickets/' . date('Y/m'), $disk);

            $ticket->attachment_path = $attachmentPath;
            $ticket->attachment_type = $attachmentType;
            $ticket->save();

            return response()->json([
                'success' => true,
                'data' => $ticket->fresh(),
                'message' => 'Lampiran berhasil diperbarui',
            ]);
        } catch (\Exception $e) {
            \Log::error('Error updating attachment: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Gagal memperbarui lampiran'], 500);
        }
    }

    /**
     * DELETE /api/tickets/{id}/attachment
     * Hapus lampiran tiket (Mahasiswa only for their own ticket)
     */
    public function deleteAttachment(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json(['success' => false, 'message' => 'Tiket tidak ditemukan'], 404);
        }

        if ($user->isMahasiswa() && $ticket->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Anda tidak memiliki akses ke tiket ini'], 403);
        }

        if ($ticket->status === 'closed') {
            return response()->json(['success' => false, 'message' => 'Tidak dapat menghapus lampiran pada tiket yang sudah ditutup'], 403);
        }

        try {
            $disk = config('filesystems.disks.supabase.endpoint') ? 'supabase' : 'public';

            if ($ticket->attachment_path && Storage::disk($disk)->exists($ticket->attachment_path)) {
                Storage::disk($disk)->delete($ticket->attachment_path);
            }

            $ticket->attachment_path = null;
            $ticket->attachment_type = null;
            $ticket->save();

            return response()->json([
                'success' => true,
                'data' => $ticket->fresh(),
                'message' => 'Lampiran berhasil dihapus',
            ]);
        } catch (\Exception $e) {
            \Log::error('Error deleting attachment: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Gagal menghapus lampiran'], 500);
        }
    }

    /**
     * POST /api/tickets/{id}/correct-ml
     * Koreksi label ML (Master Admin only)
     */
    public function correctMlLabel(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isMasterAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Master Admin yang dapat mengoreksi label ML',
            ], 403);
        }
        
        $ticket = Ticket::find($id);
        
        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Tiket tidak ditemukan',
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'correct_priority' => 'required|in:low,normal,urgent',
            'correction_note' => 'nullable|string|max:500',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }
        
        DB::beginTransaction();
        
        try {
            // Update prioritas tiket
            $oldPriority = $ticket->priority;
            $ticket->priority = $request->correct_priority;
            $ticket->priority_source = 'manual';
            $ticket->save();
            
            // Simpan ke ml_training_data untuk active learning
            $trainingData = $ticket->mlTrainingData()->updateOrCreate(
                ['ticket_id' => $ticket->id],
                [
                    'text' => $ticket->title . ' ' . $ticket->description,
                    'label' => $request->correct_priority,
                    'source' => 'manual_correction',
                    'corrected_by' => $user->id,
                    'correction_note' => $request->correction_note,
                    'confidence_score' => $ticket->ml_confidence_score,
                    'metadata' => json_encode([
                        'old_priority' => $oldPriority,
                        'corrected_at' => now()->toDateTimeString(),
                    ]),
                ]
            );
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'data' => $trainingData,
                'message' => 'Label ML berhasil dikoreksi. Data akan digunakan untuk training ulang.',
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            \Log::error('Error correcting ML label: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengoreksi label ML',
            ], 500);
        }
    }

    /**
     * POST /api/tickets/faq-suggestion
     * Cek FAQ similarity saat mengetik keluhan (Debounce)
     * Public endpoint (tidak perlu auth)
     */
    public function faqSuggestion(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string|min:10|max:500',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Query terlalu pendek',
            ], 422);
        }
        
        try {
            // Panggil ML Service untuk similarity check
            $mlServiceUrl = config('services.ml.url') . '/api/similarity';
            
            $client = new \GuzzleHttp\Client([
                'timeout' => 5, // 5 detik timeout
                'connect_timeout' => 3,
            ]);
            
            $response = $client->post($mlServiceUrl, [
                'json' => [
                    'query' => $request->input('query'),
                ],
            ]);
            
            $result = json_decode($response->getBody(), true);
            
            return response()->json([
                'success' => true,
                'data' => $result['data'] ?? [],
                'message' => $result['message'] ?? 'FAQ suggestions retrieved',
            ]);
            
        } catch (\Exception $e) {
            // Fallback: Jika ML Service down, gunakan pencarian database lokal
            \Log::warning('ML Service unavailable for FAQ suggestion: ' . $e->getMessage());
            
            $queryText = $request->input('query');
            $faqs = \App\Models\Faq::active()
                ->where('title', 'like', '%' . $queryText . '%')
                ->orWhere('content', 'like', '%' . $queryText . '%')
                ->limit(3)
                ->get(['id', 'title', 'category', 'view_count', 'helpful_count']);
            
            return response()->json([
                'success' => true,
                'data' => $faqs,
                'message' => 'FAQ suggestions retrieved (offline mode)',
            ]);
        }
    }

    /**
     * GET /api/tickets/dashboard/stats
     * Dashboard statistik untuk Admin (dengan Cache)
     */
    public function dashboardStats(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isAdmin() && !$user->isMasterAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak',
            ], 403);
        }
        
        // Cache key untuk dashboard
        $cacheKey = 'dashboard:stats';
        $cacheDuration = 300; // 5 menit
        
        $stats = Cache::remember($cacheKey, $cacheDuration, function () {
            return [
                'total_tickets' => Ticket::count(),
                'open_tickets' => Ticket::where('status', 'open')->count(),
                'in_progress_tickets' => Ticket::where('status', 'in_progress')->count(),
                'resolved_tickets' => Ticket::where('status', 'resolved')->count(),
                'closed_tickets' => Ticket::where('status', 'closed')->count(),
                'urgent_tickets' => Ticket::where('priority', 'urgent')
                    ->whereIn('status', ['open', 'in_progress'])
                    ->count(),
                'average_response_time' => $this->calculateAverageResponseTime(),
                'tickets_today' => Ticket::whereDate('created_at', today())->count(),
                'tickets_this_week' => Ticket::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                'tickets_this_month' => Ticket::whereMonth('created_at', now()->month)->count(),
                'sla_compliance' => $this->calculateSlaCompliance(),
            ];
        });
        
        return response()->json([
            'success' => true,
            'data' => $stats,
            'cached_at' => now()->toDateTimeString(),
        ]);
    }

    /**
     * GET /api/tickets/dashboard/trend
     * Grafik tren tiket (dengan Cache)
     */
    public function dashboardTrend(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isAdmin() && !$user->isMasterAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak',
            ], 403);
        }
        
        $period = $request->period ?? 'monthly'; // daily, weekly, monthly
        $cacheKey = "dashboard:trend:{$period}";
        $cacheDuration = 600; // 10 menit
        
        $trend = Cache::remember($cacheKey, $cacheDuration, function () use ($period) {
            switch ($period) {
                case 'daily':
                    return $this->getDailyTrend();
                case 'weekly':
                    return $this->getWeeklyTrend();
                case 'monthly':
                default:
                    return $this->getMonthlyTrend();
            }
        });
        
        return response()->json([
            'success' => true,
            'data' => $trend,
            'period' => $period,
        ]);
    }

    /**
     * GET /api/tickets/dashboard/category-distribution
     * Distribusi tiket berdasarkan kategori
     */
    public function dashboardCategoryDistribution(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isAdmin() && !$user->isMasterAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak',
            ], 403);
        }
        
        $cacheKey = 'dashboard:category_distribution';
        $cacheDuration = 600;
        
        $distribution = Cache::remember($cacheKey, $cacheDuration, function () {
            return Ticket::select('category', DB::raw('count(*) as total'))
                ->groupBy('category')
                ->orderBy('total', 'desc')
                ->get();
        });
        
        return response()->json([
            'success' => true,
            'data' => $distribution,
        ]);
    }

    /**
     * GET /api/tickets/dashboard/campus-mood
     * Analisis sentimen kampus (Master Admin only)
     */
    public function campusMood(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isMasterAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Master Admin yang dapat melihat Campus Mood',
            ], 403);
        }
        
        $period = $request->period ?? '6_months';
        $cacheKey = "dashboard:campus_mood:{$period}";
        $cacheDuration = 3600; // 1 jam
        
        $mood = Cache::remember($cacheKey, $cacheDuration, function () use ($period) {
            $months = $period === '12_months' ? 12 : 6;
            
            $driver = DB::connection()->getDriverName();
            if ($driver === 'sqlite') {
                $monthSelect = "strftime('%Y-%m', created_at)";
            } elseif ($driver === 'pgsql') {
                $monthSelect = "to_char(created_at, 'YYYY-MM')";
            } elseif ($driver === 'mysql') {
                $monthSelect = "DATE_FORMAT(created_at, '%Y-%m')";
            } else {
                $monthSelect = "strftime('%Y-%m', created_at)";
            }
            
            return Ticket::select(
                    DB::raw("$monthSelect as month"),
                    'priority',
                    DB::raw('count(*) as total')
                )
                ->where('created_at', '>=', now()->subMonths($months))
                ->groupBy('month', 'priority')
                ->orderBy('month')
                ->get()
                ->groupBy('month')
                ->map(function ($monthData) {
                    return [
                        'month' => $monthData->first()->month,
                        'urgent' => $monthData->where('priority', 'urgent')->sum('total'),
                        'normal' => $monthData->where('priority', 'normal')->sum('total'),
                        'low' => $monthData->where('priority', 'low')->sum('total'),
                        'total' => $monthData->sum('total'),
                        'sentiment_score' => $this->calculateSentimentScore($monthData),
                    ];
                })
                ->values();
        });
        
        return response()->json([
            'success' => true,
            'data' => $mood,
        ]);
    }

    /**
     * GET /api/tickets/export
     * Export tiket ke Excel/CSV (Admin only)
     */
    public function export(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isAdmin() && !$user->isMasterAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak',
            ], 403);
        }
        
        $format = $request->format ?? 'csv'; // csv atau excel
        
        $tickets = Ticket::with(['user:id,name,email,nim', 'assignedAdmin:id,name'])
            ->when($request->date_from, function ($q) use ($request) {
                $q->whereDate('created_at', '>=', $request->date_from);
            })
            ->when($request->date_to, function ($q) use ($request) {
                $q->whereDate('created_at', '<=', $request->date_to);
            })
            ->get();
        
        // Generate CSV content
        $csvData = [];
        $csvData[] = ['Kode Tiket', 'Judul', 'Pelapor', 'Kategori', 'Prioritas', 'Status', 'Tanggal', 'SLA (Jam)'];
        
        foreach ($tickets as $ticket) {
            $csvData[] = [
                $ticket->ticket_code,
                $ticket->title,
                $ticket->is_anonymous ? $ticket->anonymous_code : $ticket->user->name,
                $ticket->category,
                $ticket->priority,
                $ticket->status,
                $ticket->created_at->format('Y-m-d H:i'),
                $ticket->sla_hours ?? '-',
            ];
        }
        
        // Save to storage
        $filename = 'tickets_export_' . now()->format('Ymd_His') . '.csv';
        $path = storage_path('app/exports/' . $filename);
        
        if (!file_exists(dirname($path))) {
            mkdir(dirname($path), 0755, true);
        }
        
        $file = fopen($path, 'w');
        foreach ($csvData as $row) {
            fputcsv($file, $row);
        }
        fclose($file);
        
        return response()->json([
            'success' => true,
            'data' => [
                'filename' => $filename,
                'url' => url('/exports/' . $filename),
                'total_records' => count($tickets),
            ],
            'message' => 'Export berhasil dibuat',
        ]);
    }

    // ============================================
    // PRIVATE HELPER METHODS
    // ============================================

    /**
     * Cek daily limit tiket per mahasiswa (max 3/hari)
     */
    private function checkDailyLimit(int $userId): bool
    {
        $rateLimit = TicketRateLimit::firstOrCreate(
            [
                'user_id' => $userId,
                'date' => today()->toDateString(),
            ],
            [
                'ticket_count' => 0,
            ]
        );
        
        return $rateLimit->ticket_count < 3;
    }

    /**
     * Increment daily limit counter
     */
    private function incrementDailyLimit(int $userId): void
    {
        TicketRateLimit::updateOrCreate(
            [
                'user_id' => $userId,
                'date' => today()->toDateString(),
            ],
        )->increment('ticket_count');
    }

    /**
     * Hitung rata-rata waktu respon dalam jam
     */
    private function calculateAverageResponseTime(): float
    {
        $tickets = Ticket::whereNotNull('resolved_at')
            ->whereNotNull('assigned_to')
            ->select('created_at', 'resolved_at')
            ->get();
        
        if ($tickets->isEmpty()) {
            return 0.0;
        }
        
        $totalHours = $tickets->sum(function ($ticket) {
            return $ticket->created_at->diffInMinutes($ticket->resolved_at) / 60;
        });
        
        return round($totalHours / $tickets->count(), 1);
    }

    /**
     * Hitung SLA compliance (persentase tiket yang di-resolve < 24 jam)
     */
    private function calculateSlaCompliance(): float
    {
        $totalResolved = Ticket::whereNotNull('resolved_at')->count();
        
        if ($totalResolved === 0) {
            return 100.0;
        }
        
        $compliantCount = Ticket::whereNotNull('resolved_at')
            ->get()
            ->filter(function ($ticket) {
                return $ticket->created_at->diffInHours($ticket->resolved_at) <= 24;
            })
            ->count();
        
        return round(($compliantCount / $totalResolved) * 100, 1);
    }

    /**
     * Get daily trend data
     */
    private function getDailyTrend(): array
    {
        $days = 14; // 2 minggu terakhir
        $driver = DB::connection()->getDriverName();
        $dateSelect = $driver === 'pgsql' ? 'created_at::date' : 'DATE(created_at)';
        
        return Ticket::select(
                DB::raw("$dateSelect as date"),
                DB::raw('count(*) as total'),
                DB::raw("SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent"),
                DB::raw("SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved")
            )
            ->where('created_at', '>=', now()->subDays($days))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();
    }

    /**
     * Get weekly trend data
     */
    private function getWeeklyTrend(): array
    {
        $weeks = 12; // 12 minggu terakhir
        $driver = DB::connection()->getDriverName();
        
        if ($driver === 'pgsql') {
            $weekSelect = "to_char(created_at, 'IYYY-\"W\"IW')";
        } else {
            $weekSelect = "strftime('%Y-W%W', created_at)";
        }
        
        return Ticket::select(
                DB::raw("$weekSelect as week"),
                DB::raw('count(*) as total'),
                DB::raw("SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent"),
                DB::raw("SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved")
            )
            ->where('created_at', '>=', now()->subWeeks($weeks))
            ->groupBy('week')
            ->orderBy('week')
            ->get()
            ->toArray();
    }

    /**
     * Get monthly trend data
     */
    private function getMonthlyTrend(): array
    {
        $months = 12; // 12 bulan terakhir
        $driver = DB::connection()->getDriverName();
        
        if ($driver === 'pgsql') {
            $monthSelect = "to_char(created_at, 'YYYY-MM')";
        } else {
            $monthSelect = "strftime('%Y-%m', created_at)";
        }
        
        return Ticket::select(
                DB::raw("$monthSelect as month"),
                DB::raw('count(*) as total'),
                DB::raw("SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent"),
                DB::raw("SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved")
            )
            ->where('created_at', '>=', now()->subMonths($months))
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->toArray();
    }

    /**
     * Hitung sentiment score berdasarkan distribusi prioritas
     * Score 0-100 (100 = sangat positif/semua low priority)
     */
    private function calculateSentimentScore($monthData): float
    {
        $total = $monthData->sum('total');
        if ($total === 0) return 50;
        
        $urgentCount = $monthData->where('priority', 'urgent')->sum('total');
        $normalCount = $monthData->where('priority', 'normal')->sum('total');
        $lowCount = $monthData->where('priority', 'low')->sum('total');
        
        // Formula: (low*100 + normal*50 + urgent*0) / total
        $score = ($lowCount * 100 + $normalCount * 50 + $urgentCount * 0) / $total;
        
        return round($score, 1);
    }
}