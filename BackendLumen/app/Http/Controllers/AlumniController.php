<?php

namespace App\Http\Controllers;

use App\Models\Alumni;
use App\Models\RencanaKarir;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Helpers\ImageHelper;

class AlumniController extends Controller
{
    /**
     * Get all alumni with their plans
     */
    public function index()
    {
        $alumni = Alumni::with('rencanaKarir')->get()->map(function ($al) {
            // Standardize plans output matching student structure for frontend uniformity
            $rk = $al->rencanaKarir;
            $al->kategori_pilihan = $rk ? $rk->kategori_pilihan : 'belum';
            $al->rencana_detail = $rk;
            return $al;
        });

        return response()->json($alumni);
    }

    /**
     * Create a new alumni record with career plans
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'nisn' => 'required|unique:alumnis,nisn',
            'nama_lengkap' => 'required|string',
            'tahun_lulus' => 'required|integer',
            'jurusan' => 'nullable|string',
            'no_telepon' => 'nullable|string',
            'email' => 'nullable|email|unique:alumnis,email',
            'alamat_domisili' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            
            // Career choices
            'kategori_pilihan' => 'required|string|in:kuliah,kerja,bisnis,mencari_kerja,lainnya',
            'univ_pilihan_1' => 'required_if:kategori_pilihan,kuliah|string|nullable',
            'jurusan_pilihan_1' => 'required_if:kategori_pilihan,kuliah|string|nullable',
            'nama_perusahaan' => 'required_if:kategori_pilihan,kerja|string|nullable',
            'posisi_pekerjaan' => 'required_if:kategori_pilihan,kerja|string|nullable',
            'nama_bisnis' => 'required_if:kategori_pilihan,bisnis|string|nullable',
            'bidang_bisnis' => 'required_if:kategori_pilihan,bisnis|string|nullable',
        ]);

        return DB::transaction(function() use ($request) {
            $fotoPath = $request->hasFile('foto') 
                ? ImageHelper::compressAndStore($request->file('foto'), 'alumni_photos', 75)
                : null;

            // 1. Create Alumnus record
            $alumni = Alumni::create([
                'nisn' => $request->nisn,
                'nama_lengkap' => $request->nama_lengkap,
                'tahun_lulus' => $request->tahun_lulus,
                'jurusan' => $request->jurusan,
                'no_telepon' => $request->no_telepon,
                'email' => $request->email,
                'foto' => $fotoPath,
                'alamat_domisili' => $request->alamat_domisili,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
            ]);

            // 2. Create RencanaKarir record
            RencanaKarir::create([
                'alumni_id' => $alumni->id,
                'siswa_id' => null,
                'kategori_pilihan' => $request->kategori_pilihan,
                'univ_pilihan_1' => $request->kategori_pilihan === 'kuliah' ? $request->univ_pilihan_1 : null,
                'jurusan_pilihan_1' => $request->kategori_pilihan === 'kuliah' ? $request->jurusan_pilihan_1 : null,
                'univ_pilihan_2' => $request->kategori_pilihan === 'kuliah' ? $request->univ_pilihan_2 : null,
                'jurusan_pilihan_2' => $request->kategori_pilihan === 'kuliah' ? $request->jurusan_pilihan_2 : null,
                'jalur_seleksi' => $request->kategori_pilihan === 'kuliah' ? $request->jalur_seleksi : null,
                'status_seleksi' => $request->kategori_pilihan === 'kuliah' ? $request->status_seleksi : null,
                'nama_perusahaan' => $request->kategori_pilihan === 'kerja' ? $request->nama_perusahaan : null,
                'posisi_pekerjaan' => $request->kategori_pilihan === 'kerja' ? $request->posisi_pekerjaan : null,
                'estimasi_gaji' => $request->kategori_pilihan === 'kerja' ? $request->estimasi_gaji : null,
                'nama_bisnis' => $request->kategori_pilihan === 'bisnis' ? $request->nama_bisnis : null,
                'bidang_bisnis' => $request->kategori_pilihan === 'bisnis' ? $request->bidang_bisnis : null,
                'modal_awal' => $request->kategori_pilihan === 'bisnis' ? $request->modal_awal : null,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Data alumni berhasil ditambahkan',
                'data' => $alumni
            ], 201);
        });
    }

    /**
     * Update an alumni record and their plans
     */
    public function update(Request $request, $id)
    {
        $alumni = Alumni::find($id);
        if (!$alumni) {
            return response()->json(['message' => 'Alumni tidak ditemukan'], 404);
        }

        $this->validate($request, [
            'nisn' => 'required|unique:alumnis,nisn,' . $id,
            'nama_lengkap' => 'required|string',
            'tahun_lulus' => 'required|integer',
            'jurusan' => 'nullable|string',
            'no_telepon' => 'nullable|string',
            'email' => 'nullable|email|unique:alumnis,email,' . $id,
            'alamat_domisili' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            
            // Career choices
            'kategori_pilihan' => 'required|string|in:kuliah,kerja,bisnis,mencari_kerja,lainnya',
            'univ_pilihan_1' => 'required_if:kategori_pilihan,kuliah|string|nullable',
            'jurusan_pilihan_1' => 'required_if:kategori_pilihan,kuliah|string|nullable',
            'nama_perusahaan' => 'required_if:kategori_pilihan,kerja|string|nullable',
            'posisi_pekerjaan' => 'required_if:kategori_pilihan,kerja|string|nullable',
            'nama_bisnis' => 'required_if:kategori_pilihan,bisnis|string|nullable',
            'bidang_bisnis' => 'required_if:kategori_pilihan,bisnis|string|nullable',
        ]);

        return DB::transaction(function() use ($request, $alumni) {
            if ($request->hasFile('foto')) {
                $alumni->foto = ImageHelper::compressAndStore($request->file('foto'), 'alumni_photos', 75);
            }

            // 1. Update Alumnus
            $alumni->update([
                'nisn' => $request->nisn,
                'nama_lengkap' => $request->nama_lengkap,
                'tahun_lulus' => $request->tahun_lulus,
                'jurusan' => $request->jurusan,
                'no_telepon' => $request->no_telepon,
                'email' => $request->email,
                'foto' => $alumni->foto,
                'alamat_domisili' => $request->alamat_domisili,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
            ]);

            // 2. Update/Create RencanaKarir
            RencanaKarir::updateOrCreate(
                ['alumni_id' => $alumni->id],
                [
                    'siswa_id' => null,
                    'kategori_pilihan' => $request->kategori_pilihan,
                    'univ_pilihan_1' => $request->kategori_pilihan === 'kuliah' ? $request->univ_pilihan_1 : null,
                    'jurusan_pilihan_1' => $request->kategori_pilihan === 'kuliah' ? $request->jurusan_pilihan_1 : null,
                    'univ_pilihan_2' => $request->kategori_pilihan === 'kuliah' ? $request->univ_pilihan_2 : null,
                    'jurusan_pilihan_2' => $request->kategori_pilihan === 'kuliah' ? $request->jurusan_pilihan_2 : null,
                    'jalur_seleksi' => $request->kategori_pilihan === 'kuliah' ? $request->jalur_seleksi : null,
                    'status_seleksi' => $request->kategori_pilihan === 'kuliah' ? $request->status_seleksi : null,
                    'nama_perusahaan' => $request->kategori_pilihan === 'kerja' ? $request->nama_perusahaan : null,
                    'posisi_pekerjaan' => $request->kategori_pilihan === 'kerja' ? $request->posisi_pekerjaan : null,
                    'estimasi_gaji' => $request->kategori_pilihan === 'kerja' ? $request->estimasi_gaji : null,
                    'nama_bisnis' => $request->kategori_pilihan === 'bisnis' ? $request->nama_bisnis : null,
                    'bidang_bisnis' => $request->kategori_pilihan === 'bisnis' ? $request->bidang_bisnis : null,
                    'modal_awal' => $request->kategori_pilihan === 'bisnis' ? $request->modal_awal : null,
                ]
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Data alumni berhasil diperbarui',
                'data' => $alumni
            ]);
        });
    }

    /**
     * Delete a single alumni and their plans
     */
    public function destroy($id)
    {
        $alumni = Alumni::find($id);
        if (!$alumni) {
            return response()->json(['message' => 'Alumni tidak ditemukan'], 404);
        }

        DB::transaction(function() use ($alumni) {
            // Delete related plans
            RencanaKarir::where('alumni_id', $alumni->id)->delete();
            $alumni->delete();
        });

        return response()->json(['message' => 'Data alumni berhasil dihapus']);
    }

    /**
     * Bulk delete alumni records
     */
    public function bulkDelete(Request $request)
    {
        $ids = $request->input('ids', []);
        $deleted = 0;

        foreach ($ids as $id) {
            try {
                $alumni = Alumni::find($id);
                if ($alumni) {
                    DB::transaction(function() use ($alumni) {
                        RencanaKarir::where('alumni_id', $alumni->id)->delete();
                        $alumni->delete();
                    });
                    $deleted++;
                }
            } catch (\Exception $e) {
                // skip failed ones
            }
        }

        return response()->json(['message' => "$deleted data alumni berhasil dihapus"]);
    }
}
