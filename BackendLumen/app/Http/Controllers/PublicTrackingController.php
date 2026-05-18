<?php

namespace App\Http\Controllers;

use App\Models\Siswa;
use App\Models\PengaturanTracking;
use App\Models\RencanaKarir;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PublicTrackingController extends Controller
{
    /**
     * Check if the tracking portal is currently open
     */
    public function status()
    {
        $config = PengaturanTracking::with('tahunAjaran')->first();
        return response()->json([
            'is_open' => $config ? (bool)$config->is_open : false,
            'tahun_ajaran' => $config && $config->tahunAjaran ? $config->tahunAjaran->tahun_ajaran : null,
            'message' => ($config && $config->is_open) ? 'Portal Buka' : 'Akses Ditolak: Pengisian penelusuran alumni mandiri saat ini sedang ditutup oleh pihak sekolah.'
        ]);
    }

    /**
     * Verify student by NIS and NISN + check tracking eligibility
     */
    public function verify(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nis'  => 'required|string',
            'nisn' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'NIS dan NISN wajib diisi.',
                'errors' => $validator->errors()
            ], 422);
        }

        // 1. Ambil pengaturan tracking
        $config = PengaturanTracking::first();
        if (!$config || !$config->is_open) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses Ditolak: Pengisian penelusuran alumni mandiri saat ini sedang ditutup oleh pihak sekolah.'
            ], 403);
        }

        // 2. Cari Siswa berdasarkan NIS
        $siswa = Siswa::where('nis', $request->nis)->first();
        if (!$siswa) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data siswa dengan NIS tersebut tidak ditemukan.'
            ], 404);
        }

        // 3. Verifikasi NISN dari relasi Pendaftaran
        $pendaftaran = $siswa->pendaftaran;
        if (!$pendaftaran || $pendaftaran->nisn !== $request->nisn) {
            return response()->json([
                'status' => 'error',
                'message' => 'Verifikasi Gagal: Kombinasi NIS dan NISN tidak cocok.'
            ], 400);
        }

        // 4. Verifikasi batasan Tahun Ajaran
        if ($siswa->tahun_ajaran_id != $config->tahun_ajaran_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses Ditolak: Tahun Ajaran Anda tidak diperbolehkan untuk mengisi penelusuran alumni saat ini.'
            ], 403);
        }

        // 5. Muat data rencana karir jika sudah ada
        $rencanaKarir = RencanaKarir::where('siswa_id', $siswa->id)->first();

        return response()->json([
            'status' => 'success',
            'message' => 'Verifikasi berhasil.',
            'siswa' => [
                'id' => $siswa->id,
                'nama' => $siswa->nama_lengkap,
                'nis' => $siswa->nis,
                'nisn' => $pendaftaran->nisn,
                'tahun_lulus' => $siswa->tahun_lulus,
                'kelas_asal' => $siswa->kelas_asal,
            ],
            'rencana_karir' => $rencanaKarir
        ]);
    }

    /**
     * Submit tracking questionnaire publicly
     */
    public function submit(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nis'  => 'required|string',
            'nisn' => 'required|string',
            'kategori_pilihan'  => 'required|string|in:kuliah,kerja,bisnis',
            
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
                'message' => 'Data tidak valid.',
                'errors' => $validator->errors()
            ], 422);
        }

        // 1. Ambil pengaturan tracking
        $config = PengaturanTracking::first();
        if (!$config || !$config->is_open) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses Ditolak: Pengisian penelusuran alumni mandiri saat ini sedang ditutup.'
            ], 403);
        }

        // 2. Cari Siswa
        $siswa = Siswa::where('nis', $request->nis)->first();
        if (!$siswa) {
            return response()->json([
                'status' => 'error',
                'message' => 'Siswa tidak ditemukan.'
            ], 404);
        }

        // 3. Verifikasi NISN
        $pendaftaran = $siswa->pendaftaran;
        if (!$pendaftaran || $pendaftaran->nisn !== $request->nisn) {
            return response()->json([
                'status' => 'error',
                'message' => 'Verifikasi Gagal: Data tidak cocok.'
            ], 400);
        }

        // 4. Verifikasi Tahun Ajaran
        if ($siswa->tahun_ajaran_id != $config->tahun_ajaran_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses Ditolak: Tahun Ajaran Anda tidak memiliki akses.'
            ], 403);
        }

        try {
            $tracking = RencanaKarir::updateOrCreate(
                ['siswa_id' => $siswa->id],
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
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat menyimpan data.'
            ], 500);
        }
    }
}
