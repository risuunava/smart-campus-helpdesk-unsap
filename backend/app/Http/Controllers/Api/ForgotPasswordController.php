<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ForgotPasswordController extends Controller
{
    /**
     * Mengirim link reset password ke email user
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ], [
            'email.exists' => 'Email tidak terdaftar di sistem kami.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }

        $email = $request->email;
        $user = User::where('email', $email)->first();

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda dinonaktifkan. Silakan hubungi administrator.',
            ], 403);
        }

        // Buat token random yang aman
        $token = Str::random(64);

        // Hapus token lama jika ada, lalu masukkan token baru
        DB::table('password_reset_tokens')->where('email', $email)->delete();
        DB::table('password_reset_tokens')->insert([
            'email' => $email,
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        // URL Frontend untuk reset password
        $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/');
        $resetLink = "{$frontendUrl}/reset-password?token={$token}&email=" . urlencode($email);

        try {
            // Kirim email
            Mail::send([], [], function ($message) use ($email, $resetLink, $user, $frontendUrl) {
                $message->to($email)
                    ->subject('Link Verifikasi Lupa Password - Smart Campus Helpdesk')
                    ->html("
<!DOCTYPE html>
<html>
<head>
    <style>
        .cta-button {
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            display: inline-block;
        }
        .cta-button:hover {
            transform: scale(1.04);
            box-shadow: 0 8px 24px rgba(30, 215, 96, 0.4);
        }
        .cta-button::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 50%;
            height: 100%;
            background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
            transform: skewX(-25deg);
            transition: all 0.7s ease;
        }
        .cta-button:hover::after {
            left: 200%;
        }
    </style>
</head>
<body style=\"margin: 0; padding: 0; background-color: #121212; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;\">
    <div style=\"max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #121212;\">
        
        <!-- Header -->
        <div style=\"text-align: center; margin-bottom: 40px;\">
            <h2 style=\"color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;\">Smart Campus Helpdesk</h2>
            <p style=\"color: #b3b3b3; font-size: 14px; margin-top: 8px; font-weight: 400;\">Universitas Sebelas April (UNSAP)</p>
        </div>
        
        <!-- Card -->
        <div style=\"background-color: #181818; padding: 40px; border-radius: 8px; box-shadow: 0px 8px 24px rgba(0,0,0,0.5);\">
            <p style=\"margin-top: 0; font-size: 16px; font-weight: 700; color: #ffffff;\">Halo {$user->name},</p>
            <p style=\"color: #b3b3b3; line-height: 1.6; font-size: 16px; margin-bottom: 32px;\">Kami menerima permintaan untuk mereset password akun Anda. Silakan klik tombol di bawah ini untuk memverifikasi email Anda dan membuat password baru:</p>
            
            <div style=\"text-align: center; margin: 40px 0;\">
                <a href=\"{$resetLink}\" class=\"cta-button\" style=\"background-color: #1ed760; color: #000000; padding: 16px 43px; text-decoration: none; border-radius: 500px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px;\">Reset Password</a>
            </div>
            
            <div style=\"border-left: 2px solid #f3727f; padding-left: 16px; margin-bottom: 24px;\">
                <p style=\"color: #f3727f; font-size: 14px; margin: 0; font-weight: 600;\">Penting: Link verifikasi ini hanya berlaku selama 60 menit.</p>
            </div>
            
            <p style=\"color: #7c7c7c; font-size: 14px; line-height: 1.5; margin-bottom: 0;\">Jika Anda tidak meminta reset password, Anda dapat mengabaikan email ini dengan aman. Akun Anda tetap terlindungi.</p>
        </div>
        
        <!-- Footer -->
        <div style=\"margin-top: 40px; text-align: center;\">
            <p style=\"font-size: 12px; color: #7c7c7c; margin: 0;\">Email ini dikirim secara otomatis oleh sistem.</p>
            <p style=\"font-size: 12px; color: #7c7c7c; margin-top: 4px;\">Mohon jangan membalas email ini.</p>
        </div>
    </div>
</body>
</html>
                    ");
            });

            return response()->json([
                'success' => true,
                'message' => 'Link verifikasi reset password telah dikirim ke Gmail Anda.',
            ]);
        } catch (\Exception $e) {
            \Log::error('Gagal mengirim email reset password: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim email verifikasi. Pastikan SMTP mailer sudah dikonfigurasi dengan benar.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Memproses reset password menggunakan token
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }

        $record = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Permintaan reset password tidak valid atau telah kedaluwarsa.',
            ], 400);
        }

        // Cek kedaluwarsa token (60 menit)
        $createdAt = \Carbon\Carbon::parse($record->created_at);
        if ($createdAt->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json([
                'success' => false,
                'message' => 'Link verifikasi telah kedaluwarsa (lebih dari 60 menit). Silakan minta link baru.',
            ], 400);
        }

        // Cek kecocokan token
        if (!Hash::check($request->token, $record->token)) {
            return response()->json([
                'success' => false,
                'message' => 'Token verifikasi tidak valid.',
            ], 400);
        }

        // Update password user
        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        // Hapus token yang sudah dipakai
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Kirim notifikasi akun berubah password
        Notification::send(
            $user->id,
            'password_changed',
            'Password Direset',
            'Password akun Anda berhasil direset menggunakan link verifikasi email.'
        );

        return response()->json([
            'success' => true,
            'message' => 'Password Anda berhasil diperbarui. Silakan login dengan password baru.',
        ]);
    }
}
