<?php

namespace App\Http\Controllers;

use App\Models\AkunSiswa;
use App\Models\Siswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class StudentAuthController extends Controller
{
    /**
     * Handle authentication strictly for students via NIS.
     */
    public function loginSiswa(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nis' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Format input tidak sesuai',
                'errors' => $validator->errors()
            ], 422);
        }

        // Query siswa by NIS in siswas table
        $siswa = Siswa::where('nis', $request->nis)->first();

        // If not found by NIS in siswas table, query by NISN or No Pendaftaran in pendaftarans table
        if (!$siswa) {
            $siswa = Siswa::whereHas('pendaftaran', function ($q) use ($request) {
                $q->where('nisn', $request->nis)
                  ->orWhere('no_pendaftaran', $request->nis);
            })->first();
        }

        if (!$siswa) {
            return response()->json([
                'message' => 'NIS atau Password yang Anda masukkan salah.',
            ], 401);
        }

        // Query the AkunSiswa related to the student
        $akun = AkunSiswa::where('siswa_id', $siswa->id)->first();

        // Validate password
        if (!$akun || !Hash::check($request->password, $akun->password)) {
            return response()->json([
                'message' => 'NIS atau Password yang Anda masukkan salah.',
            ], 401);
        }

        // Load relational data
        $akun->load(['dataAkademik', 'siswa.pendaftaran']);

        // Generate JWT Token using students guard
        $token = Auth::guard('students')->login($akun);

        return response()->json([
            'message' => 'Login Siswa berhasil',
            'user' => $akun,
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Handle Forgot Password Request: Generate and send OTP.
     */
    public function forgotPasswordSiswa(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nis' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'NIS wajib diisi',
                'errors' => $validator->errors()
            ], 422);
        }

        // Query siswa by NIS in siswas table
        $siswa = Siswa::where('nis', $request->nis)->first();

        // If not found by NIS in siswas table, query by NISN or No Pendaftaran in pendaftarans table
        if (!$siswa) {
            $siswa = Siswa::whereHas('pendaftaran', function ($q) use ($request) {
                $q->where('nisn', $request->nis)
                  ->orWhere('no_pendaftaran', $request->nis);
            })->first();
        }

        if (!$siswa) {
            return response()->json([
                'message' => 'NIS atau data siswa tidak terdaftar di sistem.',
            ], 404);
        }

        // Query the AkunSiswa related to the student
        $akun = AkunSiswa::where('siswa_id', $siswa->id)->first();

        if (!$akun || !$akun->email) {
            return response()->json([
                'message' => 'Akun Anda belum memiliki email pemulihan terdaftar. Silakan hubungi admin sekolah untuk melakukan reset kata sandi.',
            ], 400);
        }

        // Generate a 6-digit random numeric OTP code
        $otpCode = (string) mt_rand(100000, 999999);

        // Store OTP in Cache for 15 minutes (900 seconds)
        \Illuminate\Support\Facades\Cache::put('siswa_otp_' . $akun->id, $otpCode, 900);

        // Mask the email for user privacy (e.g. wa******46@gmail.com)
        $email = $akun->email;
        $parts = explode('@', $email);
        $name = $parts[0];
        $domain = $parts[1];
        $maskedName = strlen($name) > 4
            ? substr($name, 0, 2) . str_repeat('*', strlen($name) - 4) . substr($name, -2)
            : substr($name, 0, 1) . str_repeat('*', strlen($name) - 2) . substr($name, -1);
        $maskedEmail = $maskedName . '@' . $domain;

        // Send OTP via Email
        try {
            $siswaName = $siswa->nama_lengkap;
            $htmlContent = "
                <div style='font-family: \"Outfit\", Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);'>
                    <div style='text-align: center; border-bottom: 2px solid #ef4444; padding-bottom: 15px; margin-bottom: 25px;'>
                        <h2 style='color: #1e3a8a; margin: 0; font-weight: 700;'>SMAN 1 PAMEKASAN</h2>
                        <p style='margin: 5px 0 0 0; color: #64748b; font-size: 14px;'>Sistem Informasi PPDB & Tracing Alumni</p>
                    </div>
                    
                    <p style='font-size: 16px; color: #334155; line-height: 1.6;'>Halo <strong>" . htmlspecialchars($siswaName) . "</strong>,</p>
                    <p style='font-size: 16px; color: #334155; line-height: 1.6;'>Kami menerima permintaan pengaturan ulang kata sandi untuk akun Anda. Silakan gunakan kode OTP (One-Time Password) di bawah ini untuk memverifikasi identitas Anda:</p>
                    
                    <div style='text-align: center; margin: 30px 0;'>
                        <div style='display: inline-block; background-color: #f1f5f9; border: 1px dashed #cbd5e1; padding: 15px 40px; border-radius: 8px; font-size: 32px; font-weight: 700; color: #1e3a8a; letter-spacing: 6px; font-family: monospace;'>
                            " . htmlspecialchars($otpCode) . "
                        </div>
                        <p style='font-size: 12px; color: #64748b; margin-top: 10px;'>Kode OTP ini hanya berlaku selama <strong>15 menit</strong>.</p>
                    </div>
                    
                    <div style='background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 15px; border-radius: 6px; margin: 20px 0;'>
                        <p style='color: #b45309; font-size: 14px; margin: 0; line-height: 1.5;'>⚠️ <strong>Keamanan:</strong> Jangan bagikan kode OTP ini kepada siapa pun. Petugas sekolah tidak akan pernah meminta kode verifikasi Anda.</p>
                    </div>
                    
                    <div style='margin-top: 35px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px;'>
                        <p style='margin: 0;'>Jika Anda tidak merasa mengajukan permintaan ini, silakan abaikan email ini.</p>
                        <p style='margin: 5px 0 0 0;'>&copy; " . date('Y') . " SMAN 1 Pamekasan. All rights reserved.</p>
                    </div>
                </div>
            ";

            \Illuminate\Support\Facades\Mail::html($htmlContent, function ($message) use ($email) {
                $message->to($email)
                        ->subject('Kode OTP Reset Password SMAN 1 Pamekasan');
            });

            return response()->json([
                'message' => 'Kode OTP berhasil dikirim ke email pemulihan Anda (' . $maskedEmail . ').',
                'masked_email' => $maskedEmail,
            ], 200);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Gagal mengirim email OTP: ' . $e->getMessage());
            return response()->json([
                'message' => 'Gagal mengirim email OTP. Silakan periksa konfigurasi mail server Anda atau hubungi admin.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle Reset Password Request: Validate OTP and update password.
     */
    public function resetPasswordSiswa(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nis' => 'required|string',
            'otp' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Format input tidak valid',
                'errors' => $validator->errors()
            ], 422);
        }

        // Query siswa by NIS in siswas table
        $siswa = Siswa::where('nis', $request->nis)->first();

        // If not found by NIS in siswas table, query by NISN or No Pendaftaran in pendaftarans table
        if (!$siswa) {
            $siswa = Siswa::whereHas('pendaftaran', function ($q) use ($request) {
                $q->where('nisn', $request->nis)
                  ->orWhere('no_pendaftaran', $request->nis);
            })->first();
        }

        if (!$siswa) {
            return response()->json([
                'message' => 'NIS atau data siswa tidak terdaftar di sistem.',
            ], 404);
        }

        // Query the AkunSiswa related to the student
        $akun = AkunSiswa::where('siswa_id', $siswa->id)->first();

        if (!$akun) {
            return response()->json([
                'message' => 'Akun siswa tidak ditemukan.',
            ], 404);
        }

        // Retrieve and check OTP from Cache
        $cachedOtp = \Illuminate\Support\Facades\Cache::get('siswa_otp_' . $akun->id);

        if (!$cachedOtp || $cachedOtp !== $request->otp) {
            return response()->json([
                'message' => 'Kode OTP salah atau telah kedaluwarsa.',
            ], 400);
        }

        // OTP is correct! Update password
        $akun->password = Hash::make($request->password);
        $akun->is_password_changed = true; // Mark as configured
        $akun->save();

        // Clear OTP from Cache
        \Illuminate\Support\Facades\Cache::forget('siswa_otp_' . $akun->id);

        return response()->json([
            'message' => 'Kata sandi akun siswa berhasil diperbarui! Silakan masuk menggunakan kata sandi baru Anda.',
        ], 200);
    }
}
