<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('ticket_code')->unique(); // Format: TKT-20240101-0001
            $table->string('title');
            $table->text('description');
            $table->enum('category', [
                'akademik',
                'keuangan',
                'fasilitas',
                'teknologi',
                'administrasi',
                'kesejahteraan',
                'lainnya'
            ]);
            $table->enum('priority', ['low', 'normal', 'urgent'])->default('normal');
            $table->enum('priority_source', ['ml_prediction', 'manual', 'keyword_override'])->default('ml_prediction');
            $table->enum('status', ['open', 'in_progress', 'resolved', 'closed'])->default('open');
            $table->boolean('is_anonymous')->default(false);
            $table->string('anonymous_code')->nullable(); // Contoh: Anonim_#12
            $table->text('attachment_path')->nullable();
            $table->string('attachment_type')->nullable(); // jpg, png, pdf
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('resolved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('resolution_note')->nullable();
            $table->float('ml_confidence_score')->nullable(); // Skor kepercayaan ML
            $table->json('ml_metadata')->nullable(); // Metadata ML
            $table->timestamps();
            $table->softDeletes();

            // Index untuk performa
            $table->index(['status', 'priority']);
            $table->index('ticket_code');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};