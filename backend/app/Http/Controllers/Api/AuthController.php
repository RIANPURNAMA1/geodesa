<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Kredensial yang diberikan tidak valid.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'avatar' => $user->avatar,
                    'kecamatan_id' => $user->kecamatan_id,
                    'kecamatan_nama' => $user->kecamatan_nama,
                    'desa_id' => $user->desa_id,
                    'desa_nama' => $user->desa_nama,
                ],
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'avatar' => $user->avatar,
                'kecamatan_id' => $user->kecamatan_id,
                'kecamatan_nama' => $user->kecamatan_nama,
                'desa_id' => $user->desa_id,
                'desa_nama' => $user->desa_nama,
            ],
        ]);
    }

    public function registerPublic(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'password' => 'required|string|min:4',
        ]);

        $existing = User::where('name', $request->name)->where('role', 'user')->first();

        if ($existing) {
            if (!Hash::check($request->password, $existing->password)) {
                $existing->update(['password' => bcrypt($request->password)]);
            }

            $token = $existing->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login berhasil',
                'data' => [
                    'user' => [
                        'id' => $existing->id,
                        'name' => $existing->name,
                        'email' => $existing->email,
                        'role' => $existing->role,
                        'avatar' => $existing->avatar,
                    ],
                    'token' => $token,
                    'token_type' => 'Bearer',
                ],
            ]);
        }

        $email = 'user_' . uniqid() . '@public.local';

        $user = User::create([
            'name' => $request->name,
            'email' => $email,
            'password' => bcrypt($request->password),
            'role' => 'user',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'avatar' => $user->avatar,
                ],
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ], 201);
    }

    public function redirectToGoogle()
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return redirect(env('FRONTEND_URL') . '/login?error=Gagal login dengan Google');
        }

        $user = User::where('email', $googleUser->getEmail())->first();

        if (!$user) {
            $user = User::where('google_id', $googleUser->getId())->first();
        }

        if (!$user) {
            $user = User::create([
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'password' => bcrypt(uniqid()),
                'role' => 'user',
            ]);
        } else {
            $user->update([
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        $frontendUrl = env('FRONTEND_URL') . '/auth/callback';
        $fragment = 'token=' . $token . '&user=' . urlencode(json_encode([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'avatar' => $user->avatar,
        ]));

        return redirect($frontendUrl . '?' . $fragment);
    }
}
