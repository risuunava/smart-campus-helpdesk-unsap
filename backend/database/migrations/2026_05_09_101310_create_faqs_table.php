<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content');
            $table->string('category');
            $table->json('keywords')->nullable(); // Array kata kunci
            $table->integer('view_count')->default(0);
            $table->integer('helpful_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            // Index for category search
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faqs');
    }
};