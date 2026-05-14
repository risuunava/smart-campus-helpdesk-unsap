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
            'is_active' => true,
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
     * Update password user
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
     * Update avatar user
     */
    public function updateAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $user = $request->user();

        // Hapus avatar lama jika ada
        if ($user->avatar && \Illuminate\Support\Facades\Storage::disk('public')->exists($user->avatar)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        
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
    }
}