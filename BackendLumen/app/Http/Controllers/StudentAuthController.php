<?php

namespace App\Http\Controllers;

use App\Models\AkunSiswa;
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

        // Query user strictly by NIS
        $akun = AkunSiswa::where('nis', $request->nis)->first();

        // Validate password
        if (!$akun || !Hash::check($request->password, $akun->password)) {
            return response()->json([
                'message' => 'NIS atau Password yang Anda masukkan salah.',
            ], 401);
        }

        // Load relational data
        $akun->load('dataAkademik');

        // Generate JWT Token using Tymon\JWTAuth (Auth::login)
        // If your system uses a specific guard for students, you might need auth()->guard('siswa')->login($akun)
        $token = Auth::login($akun);

        return response()->json([
            'message' => 'Login Siswa berhasil',
            'user' => $akun,
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }
}
