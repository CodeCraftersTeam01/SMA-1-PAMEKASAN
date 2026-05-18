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

        // Send email notification with new credentials
        try {
            $siswaName = $user->siswa->nama_lengkap ?? 'Siswa';
            $newPassword = $request->new_password;
            
            $htmlContent = "
                <div style='font-family: \"Outfit\", Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);'>
                    <div style='text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 25px;'>
                        <h2 style='color: #1e3a8a; margin: 0; font-weight: 700;'>SMAN 1 PAMEKASAN</h2>
                        <p style='margin: 5px 0 0 0; color: #64748b; font-size: 14px;'>Sistem Informasi PPDB & Tracing Alumni</p>
                    </div>
                    
                    <p style='font-size: 16px; color: #334155; line-height: 1.6;'>Halo <strong>" . htmlspecialchars($siswaName) . "</strong>,</p>
                    <p style='font-size: 16px; color: #334155; line-height: 1.6;'>Selamat! Akun siswa Anda telah berhasil dikonfigurasi dengan kata sandi dan email pemulihan terbaru.</p>
                    
                    <div style='background-color: #f8fafc; border: 1px solid #f1f5f9; padding: 20px; border-radius: 8px; margin: 25px 0;'>
                        <h4 style='margin-top: 0; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; font-size: 15px;'>Informasi Akun Anda:</h4>
                        <table style='width: 100%; border-collapse: collapse;'>
                            <tr>
                                <td style='padding: 8px 0; color: #64748b; width: 40%; font-size: 14px;'><strong>Email Pemulihan:</strong></td>
                                <td style='padding: 8px 0; color: #0f172a; font-size: 14px; word-break: break-all;'>" . htmlspecialchars($user->email) . "</td>
                            </tr>
                            <tr>
                                <td style='padding: 8px 0; color: #64748b; font-size: 14px;'><strong>Kata Sandi Baru:</strong></td>
                                <td style='padding: 8px 0; color: #ef4444; font-size: 15px; font-family: monospace;'><strong>" . htmlspecialchars($newPassword) . "</strong></td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style='background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 15px; border-radius: 6px; margin: 20px 0;'>
                        <p style='color: #b45309; font-size: 14px; margin: 0; line-height: 1.5;'>⚠️ <strong>Penting:</strong> Simpan kata sandi ini dengan baik dan jangan bagikan kepada siapa pun demi keamanan akun Anda.</p>
                    </div>
                    
                    <div style='margin-top: 35px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px;'>
                        <p style='margin: 0;'>Email ini dikirimkan secara otomatis oleh sistem SMAN 1 Pamekasan.<br>Mohon untuk tidak membalas email ini.</p>
                        <p style='margin: 5px 0 0 0;'>&copy; " . date('Y') . " SMAN 1 Pamekasan. All rights reserved.</p>
                    </div>
                </div>
            ";
            
            \Illuminate\Support\Facades\Mail::html($htmlContent, function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('Konfigurasi Akun Siswa SMAN 1 Pamekasan Berhasil');
            });
        } catch (\Exception $e) {
            // Log the error but don't block the profile setup response
            \Illuminate\Support\Facades\Log::error('Gagal mengirim email notifikasi password baru: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Kata sandi dan email pemulihan berhasil dikonfigurasi.',
            'user' => $user
        ], 200);
    }
}
