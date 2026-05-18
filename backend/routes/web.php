<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/storage/{folder}/{filename}', function ($folder, $filename) {
    $path = storage_path('app/public/' . $folder . '/' . $filename);
    if (!file_exists($path)) {
        abort(404);
    }
    
    // Dapatkan mime type
    $mime = mime_content_type($path);
    
    return response()->file($path, [
        'Content-Type' => $mime,
        'Cache-Control' => 'public, max-age=86400'
    ]);
});
