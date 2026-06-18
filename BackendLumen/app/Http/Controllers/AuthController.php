<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\LoginThrottle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

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

        // Throttle per email + IP to stop brute-force / credential stuffing.
        $throttle = new LoginThrottle($request->input('email') . '|' . $request->ip());

        if ($throttle->isLocked()) {
            $wait = $throttle->secondsUntilUnlock();
            return response()->json([
                'message'     => "Terlalu banyak percobaan login. Silakan coba lagi dalam {$wait} detik.",
                'locked'      => true,
                'retry_after' => $wait,
            ], 429)->withHeaders(['Retry-After' => $wait]);
        }

        // Remember me: ingat = 7 hari, tidak ingat = 2 jam
        $remember = (bool) $request->input('remember', false);
        JWTAuth::factory()->setTTL($remember ? 10080 : 120);

        $credentials = $request->only('email', 'password');

        if (! $token = Auth::attempt($credentials)) {
            $lockedFor = $throttle->recordFailure();

            if ($lockedFor > 0) {
                return response()->json([
                    'message'     => "Terlalu banyak percobaan login. Akun dikunci sementara selama {$lockedFor} detik.",
                    'locked'      => true,
                    'retry_after' => $lockedFor,
                ], 429)->withHeaders(['Retry-After' => $lockedFor]);
            }

            return response()->json([
                'message'        => 'Email atau Password yang Anda masukkan salah.',
                'attempts_left'  => $throttle->attemptsLeft(),
            ], 401);
        }

        // Success: clear all throttle counters for this identifier.
        $throttle->clear();

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
        return response()->json(Auth::user());
    }
}