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
        return $this->alumniList();
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

    /**
     * Get all alumni students (whose academic year is 3 years or more below the active year)
     */
    public function alumniList()
    {
        try {
            $activeTahunAjaran = \App\Models\TahunAjaran::where('is_active', true)->first();
            
            if (!$activeTahunAjaran) {
                return response()->json([
                    'status' => 'success',
                    'active_tahun_ajaran' => null,
                    'data' => []
                ], 200);
            }

            $parts = explode('/', $activeTahunAjaran->tahun);
            $activeYear = (int)$parts[0];

            $siswaList = Siswa::with(['pendaftaran', 'tahunAjaran', 'rencanaKarir'])->get();
            
            $alumni = $siswaList->filter(function ($siswa) use ($activeYear) {
                // If there's a graduation year explicitly set, check if it's less than or equal to active year
                if ($siswa->tahun_lulus) {
                    return true;
                }
                
                if (!$siswa->tahunAjaran) {
                    return false;
                }

                $parts = explode('/', $siswa->tahunAjaran->tahun);
                $siswaYear = (int)$parts[0];

                // Alumni logic: Difference is at least 3 years
                return ($activeYear - $siswaYear) >= 3;
            })->values();

            // Auto-sync all filtered student alumni to the alumnis table
            foreach ($alumni as $siswa) {
                $nisn = $siswa->nisn ?: ($siswa->pendaftaran ? $siswa->pendaftaran->nisn : '');
                if (!$nisn) {
                    $nisn = 'ALUMNI-' . $siswa->nis;
                }

                // Determine estimated graduation year if not filled
                $tahunLulus = $siswa->tahun_lulus;
                if (!$tahunLulus && $siswa->tahunAjaran) {
                    $parts = explode('/', $siswa->tahunAjaran->tahun);
                    $startYear = (int)$parts[0];
                    $tahunLulus = $startYear + 3;
                }
                if (!$tahunLulus) {
                    $tahunLulus = $activeYear;
                }

                $alumniRecord = \App\Models\Alumni::where('nisn', $nisn)->first();

                $alumniData = [
                    'nisn' => $nisn,
                    'nama_lengkap' => $siswa->nama_lengkap,
                    'tahun_lulus' => $tahunLulus,
                    'jurusan' => $siswa->kelas ?: 'MIPA',
                    'no_telepon' => $siswa->nomor_hp,
                    'email' => $siswa->email,
                    'alamat_domisili' => $siswa->alamat,
                    'latitude' => $siswa->lintang,
                    'longitude' => $siswa->bujur,
                ];

                if (!$alumniRecord) {
                    $alumniRecord = \App\Models\Alumni::create($alumniData);
                } else {
                    $alumniRecord->update($alumniData);
                }

                if ($siswa->rencanaKarir && !$siswa->rencanaKarir->alumni_id) {
                    $siswa->rencanaKarir->update(['alumni_id' => $alumniRecord->id]);
                }
            }

            $formatted = $alumni->map(function ($siswa) {
                $rk = $siswa->rencanaKarir;
                
                $nisn = $siswa->nisn ?: ($siswa->pendaftaran ? $siswa->pendaftaran->nisn : '');
                if (!$nisn) {
                    $nisn = 'ALUMNI-' . $siswa->nis;
                }
                $alumniRec = \App\Models\Alumni::where('nisn', $nisn)->first();
                
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

                // Determine estimated graduation year if not filled
                $tahunLulus = $siswa->tahun_lulus;
                if (!$tahunLulus && $siswa->tahunAjaran) {
                    $parts = explode('/', $siswa->tahunAjaran->tahun);
                    $startYear = (int)$parts[0];
                    $tahunLulus = $startYear + 3; // Standard high school is 3 years
                }

                return [
                    'id' => $siswa->id,
                    'alumni_id' => $alumniRec ? $alumniRec->id : null,
                    'nama' => $siswa->nama_lengkap,
                    'nis' => $siswa->nis,
                    'kelas_asal' => $siswa->pendaftaran->jalur ?? '-',
                    'tahun_masuk' => $siswa->tahun_masuk ?? ($siswa->tahunAjaran ? explode('/', $siswa->tahunAjaran->tahun)[0] : '-'),
                    'tahun_lulus' => $tahunLulus ?? '-',
                    'status_pengisian' => $rk ? 'Lengkap' : 'Pending',
                    'kategori_pilihan' => $rk ? $rk->kategori_pilihan : 'belum',
                    'pilihan_1' => $pilihan1,
                    'rencana_detail' => $rk,
                    'tahun_ajaran' => $siswa->tahunAjaran->tahun ?? '-',
                    'foto_url' => $alumniRec ? $alumniRec->foto_url : null,
                    
                    // Extra fields for details & contact
                    'nisn' => $siswa->nisn ?: ($siswa->pendaftaran->nisn ?? 'Tidak tersedia'),
                    'no_pendaftaran' => $siswa->pendaftaran->no_pendaftaran ?? 'Tidak tersedia',
                    'asal_sekolah' => $siswa->pendaftaran->asal_sekolah ?? 'Tidak tersedia',
                    'alamat' => $alumniRec ? $alumniRec->alamat_domisili : ($siswa->alamat ?? 'Tidak tersedia'),
                    'alamat_domisili' => $alumniRec ? $alumniRec->alamat_domisili : ($siswa->alamat ?? 'Tidak tersedia'),
                    'no_telepon' => $alumniRec ? $alumniRec->no_telepon : ($siswa->nomor_hp ?? '-'),
                    'email' => $alumniRec ? $alumniRec->email : ($siswa->email ?? '-'),
                    'latitude' => $alumniRec ? $alumniRec->latitude : ($siswa->lintang ?? null),
                    'longitude' => $alumniRec ? $alumniRec->longitude : ($siswa->bujur ?? null),
                ];
            });

            // Include standalone manual alumni from alumnis table
            $existingNisns = $formatted->pluck('nisn')->filter()->toArray();
            $standaloneAlumni = \App\Models\Alumni::with('rencanaKarir')->get()->filter(function($al) use ($existingNisns) {
                return !in_array($al->nisn, $existingNisns);
            });

            $standaloneFormatted = $standaloneAlumni->map(function($al) {
                $rk = $al->rencanaKarir;
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
                    'id' => 'MANUAL-' . $al->id,
                    'alumni_id' => $al->id,
                    'nama' => $al->nama_lengkap,
                    'nis' => '-',
                    'kelas_asal' => $al->jurusan ?: 'Manual',
                    'tahun_masuk' => $al->tahun_lulus ? ($al->tahun_lulus - 3) : '-',
                    'tahun_lulus' => $al->tahun_lulus ?? '-',
                    'status_pengisian' => $rk ? 'Lengkap' : 'Pending',
                    'kategori_pilihan' => $rk ? $rk->kategori_pilihan : 'belum',
                    'pilihan_1' => $pilihan1,
                    'rencana_detail' => $rk,
                    'tahun_ajaran' => '-',
                    'foto_url' => $al->foto_url,
                    
                    // Extra fields for details & contact
                    'nisn' => $al->nisn ?: 'Tidak tersedia',
                    'no_pendaftaran' => '-',
                    'asal_sekolah' => 'Manual Entry',
                    'alamat' => $al->alamat_domisili ?: 'Tidak tersedia',
                    'alamat_domisili' => $al->alamat_domisili ?: 'Tidak tersedia',
                    'no_telepon' => $al->no_telepon ?? '-',
                    'email' => $al->email ?? '-',
                    'latitude' => $al->latitude ?? null,
                    'longitude' => $al->longitude ?? null,
                ];
            });

            $formatted = $formatted->concat($standaloneFormatted)->values();

            return response()->json([
                'status' => 'success',
                'active_tahun_ajaran' => $activeTahunAjaran->tahun,
                'data' => $formatted
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil daftar alumni: ' . $e->getMessage()
            ], 500);
        }
    }
}
