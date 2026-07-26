<?php

namespace App\Http\Controllers;

use App\Models\Siswa;
use App\Models\PengaturanTracking;
use App\Models\RencanaKarir;
use App\Models\Alumni;
use App\Models\TahunAjaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class PublicTrackingController extends Controller
{
    /**
     * Check if the tracking portal is currently open
     */
    public function status()
    {
        $config = PengaturanTracking::with('tahunAjaran')->first();
        // Default to open if no config record exists yet
        $isOpen = $config ? (bool)$config->is_open : true;
        return response()->json([
            'is_open' => $isOpen,
            'tahun_ajaran' => $config && $config->tahunAjaran ? $config->tahunAjaran->tahun : null,
            'message' => $isOpen ? 'Portal Buka' : 'Akses Ditolak: Pengisian penelusuran alumni mandiri saat ini sedang ditutup oleh pihak sekolah.'
        ]);
    }

    /**
     * Generate simple SVG CAPTCHA code and store in cache
     */
    public function captcha()
    {
        $code = '';
        for ($i = 0; $i < 5; $i++) {
            $code .= rand(0, 9);
        }
        
        $key = bin2hex(random_bytes(16));
        Cache::put('captcha_'.$key, $code, 300); // Expires in 5 minutes

        // Generate clean inline SVG
        $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="150" height="50" viewBox="0 0 150 50">';
        $svg .= '<rect width="100%" height="100%" fill="#f3f4f6"/>';
        
        // Add random grid lines for noise
        for ($i = 0; $i < 5; $i++) {
            $svg .= '<line x1="'.rand(0, 50).'" y1="'.rand(0, 50).'" x2="'.rand(100, 150).'" y2="'.rand(0, 50).'" stroke="#d1d5db" stroke-width="'.rand(1, 2).'"/>';
        }
        
        // Render captcha characters
        for ($i = 0; $i < strlen($code); $i++) {
            $char = $code[$i];
            $x = 20 + ($i * 24);
            $y = rand(30, 40);
            $rotate = rand(-15, 15);
            $font_size = rand(24, 30);
            $colors = ['#1e3a8a', '#b45309', '#047857', '#4338ca', '#be185d'];
            $color = $colors[array_rand($colors)];
            $svg .= '<text x="'.$x.'" y="'.$y.'" font-size="'.$font_size.'" font-weight="bold" fill="'.$color.'" transform="rotate('.$rotate.', '.$x.', '.$y.')" font-family="Courier, monospace">'.$char.'</text>';
        }
        $svg .= '</svg>';

        return response()->json([
            'status' => 'success',
            'captcha_key' => $key,
            'captcha_image' => 'data:image/svg+xml;base64,' . base64_encode($svg)
        ]);
    }

    /**
     * Verify student by NIS and Date of Birth + CAPTCHA + check academic year eligibility
     */
    public function verify(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nis'  => 'required|string',
            'tanggal_lahir' => 'required|date_format:Y-m-d',
            'captcha_key' => 'required|string',
            'captcha_code' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Harap lengkapi semua field dengan benar.',
                'errors' => $validator->errors()
            ], 422);
        }

        // 1. Validasi CAPTCHA
        $cachedCode = Cache::get('captcha_'.$request->captcha_key);
        if (!$cachedCode || $cachedCode !== $request->captcha_code) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kode CAPTCHA tidak valid atau sudah kedaluwarsa.'
            ], 422);
        }

        // 2. Ambil pengaturan tracking (default open jika tidak ada record)
        $config = PengaturanTracking::with('tahunAjaran')->first();
        $isOpen = $config ? (bool)$config->is_open : true;
        if (!$isOpen) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses Ditolak: Pengisian penelusuran alumni mandiri saat ini sedang ditutup oleh pihak sekolah.'
            ], 403);
        }

        // 3. Cari Siswa berdasarkan NIS dan Tanggal Lahir
        $siswa = Siswa::where('nis', $request->nis)
            ->where('tanggal_lahir', $request->tanggal_lahir)
            ->first();
            
        if (!$siswa) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data siswa dengan kombinasi NIS dan Tanggal Lahir tersebut tidak ditemukan.'
            ], 404);
        }

        // 4. Verifikasi batasan Tahun Ajaran berdasarkan pengaturan tracking
        if ($config && $config->tahun_ajaran_id) {
            if ($siswa->tahun_ajaran_id != $config->tahun_ajaran_id) {
                $allowedTahun = $config->tahunAjaran ? $config->tahunAjaran->tahun : 'yang telah ditentukan';
                return response()->json([
                    'status' => 'error',
                    'message' => 'Akses Ditolak: Hanya siswa dari Tahun Ajaran ' . $allowedTahun . ' yang diizinkan mengisi form ini.'
                ], 403);
            }
        }

        $activeTahunAjaran = TahunAjaran::where('is_active', true)->first();
        if (!$activeTahunAjaran) {
            $activeTahunAjaran = TahunAjaran::orderBy('tahun', 'desc')->first();
        }

        // 5. Muat data rencana karir jika sudah ada
        $rencanaKarir = RencanaKarir::where('siswa_id', $siswa->id)->first();

        // Ambil NISN dari relasi pendaftaran jika tidak ada langsung di siswa
        $nisn = $siswa->nisn ?: ($siswa->pendaftaran ? $siswa->pendaftaran->nisn : '');

        return response()->json([
            'status' => 'success',
            'message' => 'Verifikasi berhasil.',
            'siswa' => [
                'id' => $siswa->id,
                'nama' => $siswa->nama_lengkap,
                'nis' => $siswa->nis,
                'nisn' => $nisn,
                'tahun_lulus' => $siswa->tahun_lulus ?: ($siswa->tahun_masuk ? $siswa->tahun_masuk + 3 : ((int)substr($activeTahunAjaran->tahun ?? date('Y'), 0, 4))),
                'kelas' => $siswa->kelas,
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
            'tanggal_lahir' => 'required|date_format:Y-m-d',
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

        // 1. Ambil pengaturan tracking (default open jika tidak ada record)
        $config = PengaturanTracking::with('tahunAjaran')->first();
        $isOpen = $config ? (bool)$config->is_open : true;
        if (!$isOpen) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses Ditolak: Pengisian penelusuran alumni mandiri saat ini sedang ditutup.'
            ], 403);
        }

        // 2. Cari Siswa
        $siswa = Siswa::where('nis', $request->nis)
            ->where('tanggal_lahir', $request->tanggal_lahir)
            ->first();

        if (!$siswa) {
            return response()->json([
                'status' => 'error',
                'message' => 'Siswa tidak ditemukan.'
            ], 404);
        }

        // 3. Verifikasi batasan tahun ajaran berdasarkan pengaturan tracking
        if ($config && $config->tahun_ajaran_id) {
            if ($siswa->tahun_ajaran_id != $config->tahun_ajaran_id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Akses Ditolak: Tahun Ajaran Anda tidak memiliki akses.'
                ], 403);
            }
        }

        $activeTahunAjaran = TahunAjaran::where('is_active', true)->first();
        if (!$activeTahunAjaran) {
            $activeTahunAjaran = TahunAjaran::orderBy('tahun', 'desc')->first();
        }

        try {
            // 4. Petakan status alumni saat ini
            $kategori_pilihan = $request->kategori_pilihan;
            $status_saat_ini = 'mencari_kerja';
            $nama_instansi = null;
            $posisi_jurusan = null;

            if ($kategori_pilihan === 'kuliah') {
                $status_saat_ini = 'kuliah';
                $nama_instansi = $request->univ_pilihan_1;
                $posisi_jurusan = $request->jurusan_pilihan_1;
            } elseif ($kategori_pilihan === 'kerja') {
                $status_saat_ini = 'kerja';
                $nama_instansi = $request->nama_perusahaan;
                $posisi_jurusan = $request->posisi_pekerjaan;
            } elseif ($kategori_pilihan === 'bisnis') {
                $status_saat_ini = 'wirausaha';
                $nama_instansi = $request->nama_bisnis;
                $posisi_jurusan = $request->bidang_bisnis;
            }

            // Tentukan NISN unik (alumni table constraint)
            $nisn = $siswa->nisn ?: ($siswa->pendaftaran ? $siswa->pendaftaran->nisn : '');
            if (!$nisn) {
                $nisn = 'ALUMNI-' . $siswa->nis; // Fallback jika nisn kosong
            }

            // Atur email dengan menghindari duplikat error jika email sama dimiliki siswa lain
            $email = $siswa->email;
            if ($email) {
                $existingEmail = Alumni::where('email', $email)->where('nisn', '!=', $nisn)->exists();
                if ($existingEmail) {
                    $email = null;
                }
            }

            // 5. Update atau buat record di tabel alumnis
            $alumni = Alumni::updateOrCreate(
                ['nisn' => $nisn],
                [
                    'nama_lengkap' => $siswa->nama_lengkap,
                    'tahun_lulus' => $siswa->tahun_lulus ?: ($siswa->tahun_masuk ? $siswa->tahun_masuk + 3 : ((int)substr($activeTahunAjaran->tahun ?? date('Y'), 0, 4))),
                    'jurusan' => $siswa->kelas ?: 'MIPA',
                    'status_saat_ini' => $status_saat_ini,
                    'nama_instansi' => $nama_instansi,
                    'posisi_jurusan' => $posisi_jurusan,
                    'no_telepon' => $siswa->nomor_hp,
                    'email' => $email,
                    'alamat_domisili' => $siswa->alamat,
                ]
            );

            // 6. Update atau buat record di tabel rencana_karirs (relasi ke alumni)
            $tracking = RencanaKarir::updateOrCreate(
                ['siswa_id' => $siswa->id],
                [
                    'alumni_id' => $alumni->id,
                    'kategori_pilihan'  => $kategori_pilihan,
                    
                    // Kuliah fields
                    'univ_pilihan_1'    => $kategori_pilihan === 'kuliah' ? $request->univ_pilihan_1 : null,
                    'jurusan_pilihan_1' => $kategori_pilihan === 'kuliah' ? $request->jurusan_pilihan_1 : null,
                    'univ_pilihan_2'    => $kategori_pilihan === 'kuliah' ? $request->univ_pilihan_2 : null,
                    'jurusan_pilihan_2' => $kategori_pilihan === 'kuliah' ? $request->jurusan_pilihan_2 : null,
                    'jalur_seleksi'     => $kategori_pilihan === 'kuliah' ? $request->jalur_seleksi : null,
                    'status_seleksi'    => $kategori_pilihan === 'kuliah' ? $request->status_seleksi : null,

                    // Kerja fields
                    'nama_perusahaan'   => $kategori_pilihan === 'kerja' ? $request->nama_perusahaan : null,
                    'posisi_pekerjaan'  => $kategori_pilihan === 'kerja' ? $request->posisi_pekerjaan : null,
                    'estimasi_gaji'     => $kategori_pilihan === 'kerja' ? $request->estimasi_gaji : null,

                    // Bisnis fields
                    'bidang_bisnis'     => $kategori_pilihan === 'bisnis' ? $request->bidang_bisnis : null,
                    'nama_bisnis'       => $kategori_pilihan === 'bisnis' ? $request->nama_bisnis : null,
                    'modal_awal'        => $kategori_pilihan === 'bisnis' ? $request->modal_awal : null,
                ]
            );

            try {
                \App\Models\DashboardNotification::create([
                    'type' => 'alumni_tracking',
                    'title' => 'Pengisian Tracking Alumni',
                    'message' => "Alumni {$siswa->nama_lengkap} telah mengisi data penelusuran/tracking karir ({$kategori_pilihan}).",
                    'is_read' => false
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to create notification: ' . $e->getMessage());
            }

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
}
