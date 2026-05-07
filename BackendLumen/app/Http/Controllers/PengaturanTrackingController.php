<?php

namespace App\Http\Controllers;

use App\Models\PengaturanTracking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PengaturanTrackingController extends Controller
{
    public function index()
    {
        $pengaturan = PengaturanTracking::with('tahunAjaran')->first();
        
        if (!$pengaturan) {
            // Create default if not exists
            $pengaturan = PengaturanTracking::create([
                'is_open' => false,
                'tahun_ajaran_id' => null
            ]);
        }
        
        return response()->json($pengaturan);
    }

    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'is_open' => 'required|boolean',
            'tahun_ajaran_id' => 'nullable|exists:tahun_ajarans,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        $pengaturan = PengaturanTracking::first();
        if (!$pengaturan) {
            $pengaturan = new PengaturanTracking();
        }

        $pengaturan->is_open = $request->is_open;
        $pengaturan->tahun_ajaran_id = $request->tahun_ajaran_id;
        $pengaturan->save();

        return response()->json([
            'message' => 'Pengaturan tracking berhasil diperbarui',
            'data' => $pengaturan->load('tahunAjaran')
        ]);
    }
}
