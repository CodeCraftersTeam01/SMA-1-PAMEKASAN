<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Langsung login setelah register
        $token = Auth::login($user);

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $credentials = $request->only('email', 'password');

        if (! $token = Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Email atau Password yang Anda masukkan salah.',
            ], 401);
        }

        return response()->json([
            'message' => 'Login successful',
            'user' => Auth::user(),
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request)
    {
        Auth::logout();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function user(Request $request)
    {
        $user = Auth::user() ?: Auth::guard('students')->user();
        if ($user instanceof \App\Models\AkunSiswa) {
            $user->load('siswa.pendaftaran');
        }
        return response()->json($user);
    }
}