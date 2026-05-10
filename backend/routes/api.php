<?php

use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\FaqController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Smart Campus Helpdesk UNSAP
|--------------------------------------------------------------------------
*/

// ============================================
// PUBLIC ROUTES (No Auth Required)
// ============================================

// Health Check
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'Backend is connected!',
        'time' => now()->toDateTimeString(),
    ]);
});

// FAQ Suggestion - Untuk debounce search di form pelaporan
Route::post('/tickets/faq-suggestion', [TicketController::class, 'faqSuggestion']);

// ============================================
// AUTH ROUTES
// ============================================
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// ============================================
// PROTECTED ROUTES (Sanctum Auth)
// ============================================
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', function (Request $request) {
        return response()->json([
            'success' => true,
            'data' => $request->user(),
        ]);
    });
    
    // Tickets - Specific routes BEFORE wildcard {id} routes
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::get('/tickets/export', [TicketController::class, 'export']); // Export (Admin & Master Admin)
    Route::get('/tickets/{id}', [TicketController::class, 'show']);
    Route::put('/tickets/{id}', [TicketController::class, 'update']);
    
    // ML Correction (Master Admin only)
    Route::post('/tickets/{id}/correct-ml', [TicketController::class, 'correctMlLabel']);
    
    // Chat
    Route::get('/tickets/{ticketId}/chats', [ChatController::class, 'index']);
    Route::post('/tickets/{ticketId}/chats', [ChatController::class, 'store']);
    Route::put('/chats/{id}/read', [ChatController::class, 'markAsRead']);
    
    // Dashboard (Admin & Master Admin)
    Route::get('/dashboard/stats', [TicketController::class, 'dashboardStats']);
    Route::get('/dashboard/trend', [TicketController::class, 'dashboardTrend']);
    Route::get('/dashboard/category-distribution', [TicketController::class, 'dashboardCategoryDistribution']);
    
    // Campus Mood (Master Admin only)
    Route::get('/dashboard/campus-mood', [TicketController::class, 'campusMood']);
    
    // FAQ Management (Admin)
    Route::apiResource('/faqs', FaqController::class)->only(['index', 'store', 'show', 'update', 'destroy']);
    
});

// ============================================
// RATE LIMITING CONFIGURATION
// ============================================
// Rate limiting sudah di-handle di TicketController::store()
// Tambahan rate limiter untuk API secara umum
Route::middleware('throttle:60,1')->group(function () {
    // Rate limit global: 60 requests per minute
});