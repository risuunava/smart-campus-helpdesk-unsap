<?php

namespace App\Jobs;

use App\Models\MlTrainingData;
use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProcessTicketML implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The ticket instance.
     */
    protected Ticket $ticket;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public int $backoff = 10;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 30;

    /**
     * Create a new job instance.
     */
    public function __construct(Ticket $ticket)
    {
        $this->ticket = $ticket;
        $this->onQueue('ml-processing');
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('ProcessTicketML started', [
            'ticket_id' => $this->ticket->id,
            'ticket_code' => $this->ticket->ticket_code,
        ]);

        try {
            // Step 1: Analisis prioritas menggunakan ML Service
            $priorityResult = $this->classifyPriority();
            
            // Step 2: Cek auto-escalation keywords
            $escalatedPriority = $this->checkAutoEscalation();
            
            // Step 3: Tentukan prioritas final
            $finalPriority = $escalatedPriority ?? $priorityResult['priority'];
            $confidenceScore = $escalatedPriority ? 0.99 : $priorityResult['confidence_score'];
            $prioritySource = $escalatedPriority ? 'keyword_override' : 'ml_prediction';
            
            // Step 4: Update tiket dengan hasil ML
            $this->ticket->priority = $finalPriority;
            $this->ticket->priority_source = $prioritySource;
            $this->ticket->ml_confidence_score = $confidenceScore;
            $this->ticket->ml_metadata = json_encode([
                'ml_service_response' => $priorityResult,
                'escalated' => !is_null($escalatedPriority),
                'processed_at' => now()->toDateTimeString(),
            ]);
            $this->ticket->save();
            
            // Step 5: Simpan ke training data untuk active learning
            MlTrainingData::create([
                'text' => $this->ticket->title . ' ' . $this->ticket->description,
                'label' => $finalPriority,
                'source' => 'auto_ml',
                'ticket_id' => $this->ticket->id,
                'confidence_score' => $confidenceScore,
                'metadata' => json_encode([
                    'original_priority' => $priorityResult['priority'] ?? null,
                    'escalated_from' => $escalatedPriority ? $priorityResult['priority'] : null,
                ]),
            ]);
            
            Log::info('ProcessTicketML completed', [
                'ticket_id' => $this->ticket->id,
                'final_priority' => $finalPriority,
                'confidence_score' => $confidenceScore,
                'source' => $prioritySource,
            ]);
            
        } catch (\Exception $e) {
            // ML FALLBACK MECHANISM - KRITIS
            Log::error('ML Service failed, applying fallback', [
                'ticket_id' => $this->ticket->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            // Fallback: Set tiket menjadi "Normal"
            // Jangan pernah throw Error 500 ke user
            $this->applyFallback();
        }
    }

    /**
     * Klasifikasi prioritas menggunakan ML Service Python
     */
    private function classifyPriority(): array
    {
        $mlServiceUrl = config('services.ml.url') . '/api/classify';
        
        $response = Http::timeout(15)
            ->retry(2, 1000) // Retry 2 kali dengan delay 1 detik
            ->post($mlServiceUrl, [
                'text' => $this->ticket->title . ' ' . $this->ticket->description,
                'category' => $this->ticket->category,
            ]);
        
        if ($response->successful()) {
            $result = $response->json();
            
            return [
                'priority' => $result['priority'] ?? 'normal',
                'confidence_score' => $result['confidence_score'] ?? 0.5,
                'model_version' => $result['model_version'] ?? 'unknown',
            ];
        }
        
        throw new \Exception('ML Service returned status: ' . $response->status());
    }

    /**
     * Cek auto-escalation keywords
     * Kata kunci sensitif yang memaksa prioritas URGENT
     */
    private function checkAutoEscalation(): ?string
    {
        $text = strtolower($this->ticket->title . ' ' . $this->ticket->description);
        
        // Daftar kata kunci sensitif yang memicu escalation
        $urgentKeywords = [
            // Akademik - KRS
            'krs', 'kartu rencana studi', 'tidak bisa isi krs', 'gagal krs',
            'deadline krs', 'krs error', 'sistem krs', 'krs ditutup',
            
            // Keuangan - UKT
            'ukt', 'uang kuliah tunggal', 'tagihan', 'tidak mampu bayar',
            'keberatan ukt', 'salah tagihan', 'pembayaran ditolak',
            
            // Keamanan & Pelecehan
            'pelecehan', 'kekerasan', 'ancaman', 'intimidasi',
            'diskriminasi', 'bullying', 'perundungan', 'sexual harassment',
            'kriminal', 'pencurian', 'kehilangan', 'kejahatan',
            
            // Darurat Fasilitas
            'kebakaran', 'banjir', 'gedung roboh', 'listrik mati total',
            'laboratorium rusak', 'alat berat', 'kecelakaan',
            
            // Kesehatan
            'sakit parah', 'rawat inap', 'kecelakaan', 'meninggal',
            'covid', 'pandemi', 'karantina',
        ];
        
        foreach ($urgentKeywords as $keyword) {
            if (str_contains($text, $keyword)) {
                Log::info('Auto-escalation triggered', [
                    'ticket_id' => $this->ticket->id,
                    'keyword' => $keyword,
                ]);
                return 'urgent';
            }
        }
        
        return null;
    }

    /**
     * Fallback mechanism ketika ML Service down
     * Set tiket menjadi "Normal" agar tidak mengganggu user
     */
    private function applyFallback(): void
    {
        try {
            $this->ticket->priority = 'normal';
            $this->ticket->priority_source = 'manual'; // Fallback: bukan hasil ML
            $this->ticket->ml_confidence_score = 0.0;
            $this->ticket->ml_metadata = json_encode([
                'error' => 'ML Service unavailable',
                'fallback_applied' => true,
                'fallback_at' => now()->toDateTimeString(),
            ]);
            $this->ticket->save();
            
            Log::warning('ML Fallback applied for ticket', [
                'ticket_id' => $this->ticket->id,
                'ticket_code' => $this->ticket->ticket_code,
            ]);
            
        } catch (\Exception $dbError) {
            // Last resort: Log critical error
            Log::critical('FATAL: Cannot apply ML fallback', [
                'ticket_id' => $this->ticket->id,
                'error' => $dbError->getMessage(),
            ]);
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('ProcessTicketML job failed completely', [
            'ticket_id' => $this->ticket->id,
            'error' => $exception->getMessage(),
        ]);
        
        // Apply fallback even on complete failure
        $this->applyFallback();
    }
}