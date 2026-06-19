<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        $data = $query->paginate($request->per_page ?? 15);

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|email|unique:users,email',
            'password'      => 'required|string|min:6',
            'role'          => 'required|in:admin,operator_desa',
            'provinsi_id'   => 'nullable|string|max:10',
            'provinsi_nama' => 'nullable|string|max:255',
            'kabupaten_id'  => 'nullable|string|max:10',
            'kabupaten_nama'=> 'nullable|string|max:255',
            'kecamatan_id'  => 'nullable|string|max:20',
            'kecamatan_nama'=> 'nullable|string|max:255',
            'desa_id'       => 'nullable|string|max:20',
            'desa_nama'     => 'nullable|string|max:255',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $user = User::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil ditambahkan',
            'data'    => $user,
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $user,
        ]);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|email|unique:users,email,' . $user->id,
            'password'      => 'nullable|string|min:6',
            'role'          => 'required|in:admin,operator_desa',
            'provinsi_id'   => 'nullable|string|max:10',
            'provinsi_nama' => 'nullable|string|max:255',
            'kabupaten_id'  => 'nullable|string|max:10',
            'kabupaten_nama'=> 'nullable|string|max:255',
            'kecamatan_id'  => 'nullable|string|max:20',
            'kecamatan_nama'=> 'nullable|string|max:255',
            'desa_id'       => 'nullable|string|max:20',
            'desa_nama'     => 'nullable|string|max:255',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil diperbarui',
            'data'    => $user,
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->id === request()->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat menghapus akun sendiri',
            ], 422);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['success' => true, 'message' => 'User berhasil dihapus']);
    }
}
