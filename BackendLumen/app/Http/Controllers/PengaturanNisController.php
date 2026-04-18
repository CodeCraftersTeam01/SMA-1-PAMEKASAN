<?php

namespace App\Http\Controllers;

use App\Models\PengaturanNis;
use App\Services\NisGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PengaturanNisController extends Controller
{
    public function index()
    {
        $setting = PengaturanNis::first();
        return response()->json($setting);
    }

    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'format' => 'required|string',
            'kode_sekolah' => 'nullable|string',
            'panjang_urut' => 'required|integer|min:2|max:10',
            'reset_per_tahun' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $setting = PengaturanNis::first();
        if (!$setting) {
            $setting = new PengaturanNis();
        }

        $setting->fill($request->all());
        $setting->save();

        return response()->json([
            'message' => 'Pengaturan NIS berhasil diperbarui.',
            'data' => $setting
        ]);
    }

    public function preview(Request $request)
    {
        $tahun4 = date('Y');
        $tahun2 = substr($tahun4, -2);

        $format = $request->input('format', '[TAHUN_4][KODE][URUT]');
        $kode = $request->input('kode_sekolah', '');
        $panjang = (int) $request->input('panjang_urut', 4);

        $urutStr = str_pad("1", $panjang, '0', STR_PAD_LEFT);

        $format = str_replace('[TAHUN_4]', $tahun4, $format);
        $format = str_replace('[TAHUN_2]', $tahun2, $format);
        $format = str_replace('[KODE]', $kode, $format);
        $format = str_replace('[URUT]', $urutStr, $format);

        return response()->json(['preview' => $format]);
    }
}
