<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    /**
     * Update user profile (name, email, photo)
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // max 2MB
        ]);

        $user->name = $request->name;
        $user->email = $request->email;

        // Handle photo upload
        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($user->photo) {
                Storage::disk('public')->delete($user->photo);
            }

            // Store new photo in 'profiles' directory inside storage/app/public
            $path = $request->file('photo')->store('profiles', 'public');
            $user->photo = $path;
        }

        $user->save();

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'user' => $user
        ]);
    }

    /**
     * Update user password
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password saat ini tidak cocok.'],
            ]);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'message' => 'Password berhasil diperbarui'
        ]);
    }

    /**
     * Initial setup for student profile (set email and password)
     */
    public function setupPassword(Request $request)
    {
        $user = $request->user();
        $tableName = $user->getTable();

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'email' => 'required|string|email|max:255|unique:' . $tableName . ',email,' . $user->id,
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update the user's email
        $user->email = $request->email;

        // Hash the new_password and update it
        $user->password = Hash::make($request->new_password);

        // Set the is_password_changed flag to 1 (or true)
        if (isset($user->is_password_changed) || $user instanceof \App\Models\AkunSiswa) {
            $user->is_password_changed = true;
        }

        // Save the changes
        $user->save();

        return response()->json([
            'message' => 'Kata sandi dan email pemulihan berhasil dikonfigurasi.',
            'user' => $user
        ], 200);
    }
}
