<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Get all users
     */
    public function index()
    {
        try {
            $users = User::all();
            return response()->json([
                'message' => 'Data pengguna berhasil diambil',
                'data' => $users
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mengambil data pengguna',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single user by ID
     */
    public function show($id)
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'message' => 'Pengguna tidak ditemukan'
                ], 404);
            }

            return response()->json([
                'message' => 'Data pengguna berhasil diambil',
                'data' => $user
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mengambil data pengguna',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new user
     */
    public function store(Request $request)
    {
        if ($this->authorizeAdmin() === false) {
            return response()->json([
                'message' => 'Akses ditolak. Hanya admin yang dapat menambahkan pengguna.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'permissions' => $request->permissions,
            ]);

            return response()->json([
                'message' => 'Pengguna berhasil ditambahkan',
                'data' => $user
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menambahkan pengguna',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user
     */
    public function update(Request $request, $id)
    {
        if ($this->authorizeAdmin() === false) {
            return response()->json([
                'message' => 'Akses ditolak. Hanya admin yang dapat mengubah pengguna.'
            ], 403);
        }

        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'message' => 'Pengguna tidak ditemukan'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users,email,' . $id,
                'password' => 'nullable|string|min:8',
                'role' => 'required|string|max:50',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user->name = $request->name;
            $user->email = $request->email;
            $user->role = $request->role;

            if ($request->filled('password')) {
                $user->password = Hash::make($request->password);
            }

            if ($request->has('permissions')) {
                $user->permissions = $request->permissions;
            }

            $user->save();

            return response()->json([
                'message' => 'Pengguna berhasil diperbarui',
                'data' => $user
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal memperbarui pengguna',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete user
     */
    public function destroy($id)
    {
        if ($this->authorizeAdmin() === false) {
            return response()->json([
                'message' => 'Akses ditolak. Hanya admin yang dapat menghapus pengguna.'
            ], 403);
        }

        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'message' => 'Pengguna tidak ditemukan'
                ], 404);
            }

            if ($user->id === auth()->id()) {
                return response()->json([
                    'message' => 'Tidak dapat menghapus pengguna yang sedang login'
                ], 403);
            }

            $user->delete();

            return response()->json([
                'message' => 'Pengguna berhasil dihapus'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menghapus pengguna',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get permissions for a user
     */
    public function getPermissions($id)
    {
        if ($this->authorizeAdmin() === false) {
            return response()->json([
                'message' => 'Akses ditolak. Hanya admin yang dapat melihat izin pengguna.'
            ], 403);
        }

        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'message' => 'Pengguna tidak ditemukan'
                ], 404);
            }

            return response()->json([
                'data' => $user->permissions ?? $user->getDefaultPermissions(),
                'is_admin' => $user->role === 'admin',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mengambil izin pengguna',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update permissions for a user
     */
    public function updatePermissions(Request $request, $id)
    {
        if ($this->authorizeAdmin() === false) {
            return response()->json([
                'message' => 'Akses ditolak. Hanya admin yang dapat mengubah izin pengguna.'
            ], 403);
        }

        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'message' => 'Pengguna tidak ditemukan'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'permissions' => 'required|array',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user->permissions = $request->permissions;
            $user->save();

            return response()->json([
                'message' => 'Izin pengguna berhasil diperbarui',
                'data' => $user->permissions
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal memperbarui izin pengguna',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Authorize current user as admin
     */
    private function authorizeAdmin()
    {
        $user = auth()->user();

        if (! $user || $user->role !== 'admin') {
            return false;
        }

        return true;
    }

    public function bulkDelete(\Illuminate\Http\Request $request)
    {
        $ids = $request->input('ids', []);
        $deleted = 0;
        foreach ($ids as $id) {
            try {
                $this->destroy($id);
                $deleted++;
            } catch (\Exception $e) {
                // skip
            }
        }
        return response()->json(['message' => "$deleted data berhasil dihapus"]);
    }

}
