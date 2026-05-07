<?php

namespace App\Http\Controllers;

use App\Models\RencanaKarir;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class TrackingController extends Controller
{
    /**
     * Store or update student alumni tracking data.
     */
    public function store(Request $request)
    {
        // Cek user dari guard api atau students
        $user = Auth::guard('students')->user() ?: Auth::user();
        
        // Ensure the logged in user is a student and has a siswa_id
        if (!$user || (!isset($user->siswa_id) && $user->role !== 'siswa')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized: Hanya akun siswa yang dapat mengisi data ini.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'univ_pilihan_1'    => 'required|string',
            'jurusan_pilihan_1' => 'required|string',
            'univ_pilihan_2'    => 'nullable|string',
            'jurusan_pilihan_2' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak valid.',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $tracking = RencanaKarir::updateOrCreate(
                ['siswa_id' => $user->siswa_id],
                [
                    'univ_pilihan_1'    => $request->univ_pilihan_1,
                    'jurusan_pilihan_1' => $request->jurusan_pilihan_1,
                    'univ_pilihan_2'    => $request->univ_pilihan_2,
                    'jurusan_pilihan_2' => $request->jurusan_pilihan_2,
                ]
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Data penelusuran alumni berhasil disimpan.',
                'data' => $tracking
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat menyimpan data.'
            ], 500);
        }
    }
}
