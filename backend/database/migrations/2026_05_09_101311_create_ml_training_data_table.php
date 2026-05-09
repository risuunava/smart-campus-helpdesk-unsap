<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ml_training_data', function (Blueprint $table) {
            $table->id();
            $table->text('text'); // Teks keluhan/laporan
            $table->enum('label', ['low', 'normal', 'urgent']); // Label prioritas
            $table->enum('source', ['auto_ml', 'manual_correction'])->default('auto_ml');
            $table->foreignId('ticket_id')->nullable()->constrained('tickets')->onDelete('cascade');
            $table->foreignId('corrected_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('correction_note')->nullable();
            $table->float('confidence_score')->nullable();
            $table->boolean('is_used_for_training')->default(false);
            $table->json('metadata')->nullable();
            $table->timestamps();

            // Index
            $table->index(['label', 'is_used_for_training']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ml_training_data');
    }
};