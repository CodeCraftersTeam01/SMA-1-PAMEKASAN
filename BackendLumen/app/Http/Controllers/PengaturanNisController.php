<?php

namespace App\Http\Controllers;

use App\Models\PengaturanNis;
use App\Services\NisGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PengaturanNisController extends Controller
{
    protected $nisGenerator;

    public function __construct(NisGeneratorService $nisGenerator)
    {
        $this->nisGenerator = $nisGenerator;
    }

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
        // Simulasikan NIS menggunakan konfigurasi baru yang dioper tanpa disave
        $setting = new PengaturanNis();
        $setting->format = $request->input('format', '[TAHUN_4][KODE][URUT]');
        $setting->kode_sekolah = $request->input('kode_sekolah', '');
        $setting->panjang_urut = $request->input('panjang_urut', 4);
        
        $tahun4 = date('Y');
        $tahun2 = substr($tahun4, -2);
        
        $urutStr = str_pad("1", $setting->panjang_urut, '0', STR_PAD_LEFT);

        $format = $setting->format;
        $format = str_replace('[TAHUN_4]', $tahun4, $format);
        $format = str_replace('[TAHUN_2]', $tahun2, $format);
        $format = str_replace('[KODE]', $setting->kode_sekolah, $format);
        $format = str_replace('[URUT]', $urutStr, $format);

        return response()->json(['preview' => $format]);
    }
}
