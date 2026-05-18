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
        
        // Ensure the logged in user is authorized
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized.'
            ], 401);
        }

        // Determinisasi apakah admin
        $isAdmin = isset($user->role) && ($user->role === 'admin' || $user->role === 'staff');
        
        $siswaId = null;

        if ($isAdmin) {
            // Jika admin, wajib mengirimkan siswa_id
            $siswaId = $request->input('siswa_id');
            if (!$siswaId) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Siswa ID wajib dikirimkan.'
                ], 422);
            }
            // Pastikan siswa ini ada
            $siswa = \App\Models\Siswa::find($siswaId);
            if (!$siswa) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Data siswa tidak ditemukan.'
                ], 404);
            }
        } else {
            // Jika siswa, pastikan role/id sesuai
            if (!isset($user->siswa_id) && $user->role !== 'siswa') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized: Hanya akun siswa atau admin yang dapat mengisi data ini.'
                ], 403);
            }
            
            // Cek batasan akses tahun ajaran dari PengaturanTracking (hanya untuk siswa!)
            $config = \App\Models\PengaturanTracking::first();
            if (!$config || !$config->is_open) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Akses Ditolak: Halaman kuesioner alumni tracking saat ini sedang ditutup oleh Admin.'
                ], 403);
            }

            $siswa = $user->siswa;
            if (!$siswa || $siswa->tahun_ajaran_id != $config->tahun_ajaran_id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Akses Ditolak: Tahun Ajaran Anda tidak memiliki akses untuk mengisi penelusuran alumni.'
                ], 403);
            }
            $siswaId = $user->siswa_id;
        }

        $validator = Validator::make($request->all(), [
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

        try {
            $tracking = RencanaKarir::updateOrCreate(
                ['siswa_id' => $siswaId],
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
                'message' => 'Terjadi kesalahan saat menyimpan data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a list of all students and their alumni tracking status/details.
     */
    public function index(Request $request)
    {
        try {
            // Load all students with their career plan
            $students = \App\Models\Siswa::with(['rencanaKarir', 'pendaftaran', 'tahunAjaran'])->get();
            
            // Map the data into the structure that the frontend expects
            $mappedData = $students->map(function ($siswa) {
                $rk = $siswa->rencanaKarir;
                
                // Determine completion status
                $statusPengisian = 'Pending';
                if ($rk) {
                    if ($rk->kategori_pilihan === 'kuliah' && $rk->univ_pilihan_1 && $rk->jurusan_pilihan_1) {
                        $statusPengisian = 'Lengkap';
                    } elseif ($rk->kategori_pilihan === 'kerja' && $rk->nama_perusahaan && $rk->posisi_pekerjaan) {
                        $statusPengisian = 'Lengkap';
                    } elseif ($rk->kategori_pilihan === 'bisnis' && $rk->bidang_bisnis && $rk->nama_bisnis) {
                        $statusPengisian = 'Lengkap';
                    }
                }
                
                // Construct choice mappings based on selected path
                $pilihan1 = ['universitas' => '', 'jurusan' => ''];
                $pilihan2 = ['universitas' => '', 'jurusan' => ''];

                if ($rk) {
                    if ($rk->kategori_pilihan === 'kuliah') {
                        $pilihan1 = [
                            'universitas' => $rk->univ_pilihan_1 ?: '',
                            'jurusan' => $rk->jurusan_pilihan_1 ?: '',
                        ];
                        $pilihan2 = [
                            'universitas' => $rk->univ_pilihan_2 ?: '',
                            'jurusan' => $rk->jurusan_pilihan_2 ?: '',
                        ];
                    } elseif ($rk->kategori_pilihan === 'kerja') {
                        $pilihan1 = [
                            'universitas' => $rk->nama_perusahaan ?: '',
                            'jurusan' => $rk->posisi_pekerjaan ?: '',
                        ];
                    } elseif ($rk->kategori_pilihan === 'bisnis') {
                        $pilihan1 = [
                            'universitas' => $rk->nama_bisnis ?: '',
                            'jurusan' => $rk->bidang_bisnis ?: '',
                        ];
                    }
                }

                return [
                    'id' => $siswa->id,
                    'nama' => $siswa->nama_lengkap,
                    'nis' => $siswa->nis,
                    'nisn' => $siswa->pendaftaran ? $siswa->pendaftaran->nisn : 'Tidak tersedia',
                    'no_pendaftaran' => $siswa->pendaftaran ? $siswa->pendaftaran->no_pendaftaran : 'Tidak tersedia',
                    'asal_sekolah' => $siswa->pendaftaran ? $siswa->pendaftaran->asal_sekolah : 'Tidak tersedia',
                    'alamat' => $siswa->pendaftaran ? $siswa->pendaftaran->alamat : 'Tidak tersedia',
                    'kelas_asal' => $siswa->pendaftaran && $siswa->pendaftaran->jalur ? $siswa->pendaftaran->jalur : 'Tidak tersedia',
                    'tahun_masuk' => $siswa->tahun_masuk ?: 'Tidak tersedia',
                    'tahun_lulus' => $siswa->tahun_lulus ?: ($siswa->tahun_masuk ? (string)($siswa->tahun_masuk + 3) : '2024'),
                    'tahun_ajaran' => $siswa->tahunAjaran ? $siswa->tahunAjaran->tahun_ajaran : 'Tidak tersedia',
                    'status_pengisian' => $statusPengisian,
                    'kategori_pilihan' => $rk ? $rk->kategori_pilihan : null,
                    'pilihan_1' => $pilihan1,
                    'pilihan_2' => $pilihan2,
                    
                    // Full tracking details for modal display
                    'rencana_detail' => $rk ? [
                        'kategori_pilihan' => $rk->kategori_pilihan,
                        'univ_pilihan_1' => $rk->univ_pilihan_1,
                        'jurusan_pilihan_1' => $rk->jurusan_pilihan_1,
                        'univ_pilihan_2' => $rk->univ_pilihan_2,
                        'jurusan_pilihan_2' => $rk->jurusan_pilihan_2,
                        'jalur_seleksi' => $rk->jalur_seleksi,
                        'status_seleksi' => $rk->status_seleksi,
                        'nama_perusahaan' => $rk->nama_perusahaan,
                        'posisi_pekerjaan' => $rk->posisi_pekerjaan,
                        'estimasi_gaji' => $rk->estimasi_gaji,
                        'bidang_bisnis' => $rk->bidang_bisnis,
                        'nama_bisnis' => $rk->nama_bisnis,
                        'modal_awal' => $rk->modal_awal,
                    ] : null,
                    
                    // Rapor mock data - empty since no table exists
                    'nilai_rapor' => [
                        'semester_1' => null,
                        'semester_2' => null,
                        'semester_3' => null,
                        'semester_4' => null,
                        'semester_5' => null,
                    ]
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => $mappedData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data penelusuran alumni: ' . $e->getMessage()
            ], 500);
        }
    }
}
