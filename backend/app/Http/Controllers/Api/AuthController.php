<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Login user dan generate token Sanctum
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $user = User::where('email', $request->email)->first();
        
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah',
            ], 401);
        }
        
        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda tidak aktif. Hubungi administrator.',
            ], 403);
        }
        
        // Buat token dengan abilities berdasarkan role
        $abilities = $this->getAbilitiesByRole($user->role);
        $token = $user->createToken('auth-token', $abilities)->plainTextToken;
        
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer',
            ],
            'message' => 'Login berhasil',
        ]);
    }
    
    /**
     * Register mahasiswa baru
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'nim' => 'required|string|unique:users,nim',
            'faculty' => 'required|string',
            'study_program' => 'required|string',
            'semester' => 'required|integer|min:1|max:14',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'nim' => $request->nim,
            'faculty' => $request->faculty,
            'study_program' => $request->study_program,
            'semester' => $request->semester,
            'role' => 'mahasiswa',
            'is_active' => 'true',
        ]);
        
        $token = $user->createToken('auth-token', ['ticket:create', 'ticket:read'])->plainTextToken;
        
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer',
            ],
            'message' => 'Registrasi berhasil',
        ], 201);
    }
    
    /**
     * Logout user (revoke token)
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil',
        ]);
    }
    
    /**
     * Get abilities berdasarkan role
     */
    private function getAbilitiesByRole(string $role): array
    {
        switch ($role) {
            case 'master_admin':
                return [
                    'ticket:read', 'ticket:create', 'ticket:update', 'ticket:delete',
                    'dashboard:read', 'ml:correct', 'user:manage',
                ];
            case 'admin':
                return [
                    'ticket:read', 'ticket:update',
                    'dashboard:read',
                ];
            case 'mahasiswa':
            default:
                return [
                    'ticket:read', 'ticket:create',
                ];
        }
    }

    /**
     * Update profile user
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'nim' => 'nullable|string|unique:users,nim,' . $user->id,
            'faculty' => 'nullable|string',
            'study_program' => 'nullable|string',
            'semester' => 'nullable|integer|min:1|max:14',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $user->fill($request->only([
            'name', 'email', 'nim', 'faculty', 'study_program', 'semester'
        ]));
        $user->save();

        // Kirim notifikasi profil diperbarui
        Notification::send(
            $user->id,
            'profile_updated',
            'Profil Diperbarui',
            'Informasi profil Anda berhasil diperbarui.',
            ['updated_fields' => array_keys($request->only(['name', 'email', 'nim', 'faculty', 'study_program', 'semester']))]
        );
        
        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'Profil berhasil diperbarui',
        ]);
    }

    /**
     * Update password user (Direct - Legacy)
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }
        
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password saat ini tidak sesuai',
                'errors' => [
                    'current_password' => ['Password saat ini tidak sesuai']
                ]
            ], 422);
        }
        
        $user->password = Hash::make($request->password);
        $user->save();

        // Kirim notifikasi password berubah
        Notification::send(
            $user->id,
            'password_changed',
            'Password Diperbarui',
            'Password akun Anda berhasil diubah. Jika bukan Anda, segera hubungi admin.'
        );
        
        return response()->json([
            'success' => true,
            'message' => 'Password berhasil diperbarui',
        ]);
    }

    /**
     * Request OTP untuk ganti password di halaman Pengaturan
     */
    public function requestPasswordChangeOtp(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'current_password'      => 'required|string',
            'password'              => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password saat ini tidak sesuai',
                'errors'  => ['current_password' => ['Password saat ini tidak sesuai']],
            ], 422);
        }

        // Generate OTP 6 digit
        $otp   = sprintf('%06d', mt_rand(100000, 999999));
        $email = $user->email;

        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $email)->delete();
        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->insert([
            'email'      => $email,
            'token'      => Hash::make($otp),
            'created_at' => now(),
        ]);

        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');

        try {
            \Illuminate\Support\Facades\Mail::send([], [], function ($message) use ($email, $otp, $user) {
                $message->to($email)
                    ->subject('Kode Verifikasi Ganti Password - Smart Campus Helpdesk')
                    ->html("
<!DOCTYPE html>
<html>
<head></head>
<body style=\"margin:0;padding:0;background-color:#121212;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#ffffff;\">
  <div style=\"max-width:600px;margin:0 auto;padding:40px 20px;background-color:#121212;\">
    <div style=\"text-align:center;margin-bottom:40px;\">
      <h2 style=\"color:#ffffff;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.5px;\">Smart Campus Helpdesk</h2>
      <p style=\"color:#b3b3b3;font-size:14px;margin-top:8px;font-weight:400;\">Universitas Sebelas April (UNSAP)</p>
    </div>
    <div style=\"background-color:#181818;padding:40px;border-radius:8px;box-shadow:0px 8px 24px rgba(0,0,0,0.5);\">
      <p style=\"margin-top:0;font-size:16px;font-weight:700;color:#ffffff;\">Halo {$user->name},</p>
      <p style=\"color:#b3b3b3;line-height:1.6;font-size:16px;margin-bottom:32px;\">Anda baru saja meminta untuk mengganti password. Gunakan kode verifikasi OTP 6 digit berikut:</p>
      <div style=\"text-align:center;margin:40px 0;\">
        <div style=\"background-color:#1f1f1f;padding:24px 40px;border-radius:12px;display:inline-block;\">
          <span style=\"color:#1ed760;font-size:36px;font-weight:900;letter-spacing:14px;font-family:'Courier New',Courier,monospace;\">{$otp}</span>
        </div>
      </div>
      <div style=\"border-left:2px solid #f3727f;padding-left:16px;margin-bottom:24px;\">
        <p style=\"color:#f3727f;font-size:14px;margin:0;font-weight:600;\">Penting: Kode OTP ini hanya berlaku selama 15 menit dan hanya bisa digunakan sekali.</p>
      </div>
      <p style=\"color:#7c7c7c;font-size:14px;line-height:1.5;margin-bottom:0;\">Jika Anda tidak mencoba mengganti password, segera amankan akun Anda.</p>
    </div>
    <div style=\"margin-top:40px;text-align:center;\">
      <p style=\"font-size:12px;color:#7c7c7c;margin:0;\">Email ini dikirim secara otomatis. Mohon jangan membalas.</p>
    </div>
  </div>
</body>
</html>
                    ");
            });

            return response()->json([
                'success' => true,
                'message' => 'Kode OTP telah dikirim ke email Anda.',
            ]);
        } catch (\Exception $e) {
            \Log::error('Gagal mengirim OTP ganti password: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim email verifikasi.',
            ], 500);
        }
    }

    /**
     * Verifikasi OTP dan simpan password baru
     */
    public function verifyPasswordChangeOtp(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'otp'      => 'required|string|size:6',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $record = \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $user->email)
            ->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Permintaan tidak valid atau OTP sudah kedaluwarsa.',
            ], 400);
        }

        // Cek kedaluwarsa 15 menit
        if (\Carbon\Carbon::parse($record->created_at)->addMinutes(15)->isPast()) {
            \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $user->email)->delete();
            return response()->json([
                'success' => false,
                'message' => 'Kode OTP sudah kedaluwarsa. Silakan minta kode baru.',
            ], 400);
        }

        if (!Hash::check($request->otp, $record->token)) {
            return response()->json([
                'success' => false,
                'message' => 'Kode OTP salah.',
            ], 400);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $user->email)->delete();

        Notification::send(
            $user->id,
            'password_changed',
            'Password Diperbarui',
            'Password akun Anda berhasil diperbarui melalui verifikasi email OTP.'
        );

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil diperbarui.',
        ]);
    }

    /**
     * Update avatar user
     */
    public function updateAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $user = $request->user();

        $disk = config('filesystems.disks.supabase.endpoint') ? 'supabase' : 'public';

        try {
            // Hapus avatar lama jika ada
            if ($user->avatar) {
                try {
                    if (\Illuminate\Support\Facades\Storage::disk($disk)->exists($user->avatar)) {
                        \Illuminate\Support\Facades\Storage::disk($disk)->delete($user->avatar);
                    }
                } catch (\Exception $e) {
                    \Log::warning('Gagal menghapus avatar lama: ' . $e->getMessage());
                }
            }

            $path = $request->file('avatar')->store('avatars', $disk);
            
            if (!$path) {
                throw new \Exception('Gagal menyimpan file ke storage.');
            }
            
            $user->avatar = $path;
            $user->save();

            // Kirim notifikasi foto profil berubah
            Notification::send(
                $user->id,
                'avatar_updated',
                'Foto Profil Diperbarui',
                'Foto profil Anda berhasil diperbarui.'
            );

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'Foto profil berhasil diperbarui',
            ]);
        } catch (\Exception $e) {
            \Log::error('Error updating avatar: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui foto profil: ' . $e->getMessage()
            ], 500);
        }
    }
}