<?php

namespace App\Http\Controllers;

use App\Models\Siswa;
use App\Models\RencanaKarir;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AlumniTrackingController extends Controller
{
    /**
     * Get all student alumni tracking data
     */
    public function index()
    {
        try {
            $siswaList = Siswa::with(['pendaftaran', 'tahunAjaran', 'rencanaKarir'])->get();
            
            $formatted = $siswaList->map(function ($siswa) {
                $rk = $siswa->rencanaKarir;
                
                // Determine pilihan_1 details dynamically for easy display in table rows
                $pilihan1 = null;
                if ($rk) {
                    if ($rk->kategori_pilihan === 'kuliah') {
                        $pilihan1 = [
                            'universitas' => $rk->univ_pilihan_1,
                            'jurusan' => $rk->jurusan_pilihan_1,
                        ];
                    } elseif ($rk->kategori_pilihan === 'kerja') {
                        $pilihan1 = [
                            'universitas' => $rk->nama_perusahaan,
                            'jurusan' => $rk->posisi_pekerjaan,
                        ];
                    } elseif ($rk->kategori_pilihan === 'bisnis') {
                        $pilihan1 = [
                            'universitas' => $rk->nama_bisnis,
                            'jurusan' => $rk->bidang_bisnis,
                        ];
                    }
                }

                return [
                    'id' => $siswa->id,
                    'nama' => $siswa->nama_lengkap,
                    'nis' => $siswa->nis,
                    'kelas_asal' => $siswa->pendaftaran->jalur ?? '-',
                    'tahun_lulus' => $siswa->tahun_lulus ?? '-',
                    'status_pengisian' => $rk ? 'Lengkap' : 'Pending',
                    'kategori_pilihan' => $rk ? $rk->kategori_pilihan : null,
                    'pilihan_1' => $pilihan1,
                    'rencana_detail' => $rk,
                    
                    // Extra fields for detail modal
                    'nisn' => $siswa->pendaftaran->nisn ?? 'Tidak tersedia',
                    'no_pendaftaran' => $siswa->pendaftaran->no_pendaftaran ?? 'Tidak tersedia',
                    'asal_sekolah' => $siswa->pendaftaran->asal_sekolah ?? 'Tidak tersedia',
                    'alamat' => $siswa->pendaftaran->alamat ?? 'Tidak tersedia',
                    'tahun_masuk' => $siswa->tahun_masuk ?? 'Tidak tersedia',
                    'tahun_ajaran' => $siswa->tahunAjaran->tahun_ajaran ?? 'Tidak tersedia',
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => $formatted
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data penelusuran alumni: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save/Update student alumni tracking data by Admin
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'siswa_id' => 'required|exists:siswas,id',
            'kategori_pilihan' => 'required|string|in:kuliah,kerja,bisnis',
            
            // Kuliah fields
            'univ_pilihan_1'    => 'required_if:kategori_pilihan,kuliah|string|nullable',
            'jurusan_pilihan_1' => 'required_if:kategori_pilihan,kuliah|string|nullable',
            'univ_pilihan_2'    => 'nullable|string',
            'jurusan_pilihan_2' => 'nullable|string',
            'jalur_seleksi'     => 'nullable|string',
            'status_seleksi'    => 'nullable|string',

            // Kerja fields
            'nama_perusahaan'   => 'required_if:kategori_pilihan,kerja|string|nullable',
            'posisi_pekerjaan'  => 'required_if:kategori_pilihan,kerja|string|nullable',
            'estimasi_gaji'     => 'nullable|string',

            // Bisnis fields
            'bidang_bisnis'     => 'required_if:kategori_pilihan,bisnis|string|nullable',
            'nama_bisnis'       => 'required_if:kategori_pilihan,bisnis|string|nullable',
            'modal_awal'        => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $tracking = RencanaKarir::updateOrCreate(
                ['siswa_id' => $request->siswa_id],
                [
                    'kategori_pilihan'  => $request->kategori_pilihan,
                    
                    // Kuliah fields
                    'univ_pilihan_1'    => $request->kategori_pilihan === 'kuliah' ? $request->univ_pilihan_1 : null,
                    'jurusan_pilihan_1' => $request->kategori_pilihan === 'kuliah' ? $request->jurusan_pilihan_1 : null,
                    'univ_pilihan_2'    => $request->kategori_pilihan === 'kuliah' ? $request->univ_pilihan_2 : null,
                    'jurusan_pilihan_2' => $request->kategori_pilihan === 'kuliah' ? $request->jurusan_pilihan_2 : null,
                    'jalur_seleksi'     => $request->kategori_pilihan === 'kuliah' ? $request->jalur_seleksi : null,
                    'status_seleksi'    => $request->kategori_pilihan === 'kuliah' ? $request->status_seleksi : null,

                    // Kerja fields
                    'nama_perusahaan'   => $request->kategori_pilihan === 'kerja' ? $request->nama_perusahaan : null,
                    'posisi_pekerjaan'  => $request->kategori_pilihan === 'kerja' ? $request->posisi_pekerjaan : null,
                    'estimasi_gaji'     => $request->kategori_pilihan === 'kerja' ? $request->estimasi_gaji : null,

                    // Bisnis fields
                    'bidang_bisnis'     => $request->kategori_pilihan === 'bisnis' ? $request->bidang_bisnis : null,
                    'nama_bisnis'       => $request->kategori_pilihan === 'bisnis' ? $request->nama_bisnis : null,
                    'modal_awal'        => $request->kategori_pilihan === 'bisnis' ? $request->modal_awal : null,
                ]
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Rencana karir alumni berhasil disimpan.',
                'data' => $tracking
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat menyimpan data: ' . $e->getMessage()
            ], 500);
        }
    }
}
