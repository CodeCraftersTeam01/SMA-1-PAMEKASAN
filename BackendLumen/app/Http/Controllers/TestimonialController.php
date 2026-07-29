<?php

namespace App\Http\Controllers;

use App\Models\Testimonial;
use App\Models\Siswa;
use App\Models\Alumni;
use App\Models\Pendaftaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class TestimonialController extends Controller
{
    /**
     * PUBLIC: Get approved testimonials
     */
    public function getPublicTestimonials()
    {
        $testimonials = Testimonial::where('status', 'approved')
            ->inRandomOrder()
            ->limit(10)
            ->get();

        if ($testimonials->count() < 10) {
            $existingIds = $testimonials->pluck('id')->toArray();
            $additional = Testimonial::whereNotIn('id', $existingIds)
                ->inRandomOrder()
                ->limit(10 - $testimonials->count())
                ->get();
            $testimonials = $testimonials->concat($additional);
        }

        $testimonials->transform(function ($item) {
            if ($item->avatar_url && !str_starts_with($item->avatar_url, 'http')) {
                $path = ltrim($item->avatar_url, '/');
                if (str_starts_with($path, 'storage/')) {
                    $path = substr($path, 8);
                }
                $item->avatar_url = url('storage/' . $path);
            }
            return $item;
        });

        return response()->json([
            'status' => 'success',
            'success' => true,
            'data' => $testimonials->values()
        ]);
    }

    /**
     * PUBLIC: Submit a new testimonial
     */
    public function submitPublicTestimonial(Request $request)
    {
        $this->validate($request, [
            'name' => 'required|string|max:255',
            'role' => 'required|in:alumni,siswa,orangtua',
            'message' => 'required|string',
            'graduation_year' => 'nullable|integer',
            'current_occupation' => 'nullable|string|max:255',
            'image' => 'nullable|image|max:2048',
            'rating' => 'required|integer|min:1|max:5'
        ]);

        $data = $request->except(['image', 'status']);
        
        // SECURE LOGIC: Force status to pending for public submission
        $data['status'] = 'pending';

        // ==========================================
        // AI VALIDATION LOGIC
        // ==========================================
        $name = trim($request->name);
        $role = $request->role;

        $words = explode(' ', $name);
        $words = array_filter($words, function($w) { return strlen($w) > 2; });
        if (empty($words)) {
            $words = [$name];
        }

        $candidates = collect();

        if ($role === 'orangtua') {
            $query = Pendaftaran::query();
            $query->where(function($q) use ($words) {
                foreach ($words as $word) {
                    $q->orWhere('nama_ayah', 'LIKE', "%{$word}%")
                      ->orWhere('nama_ibu', 'LIKE', "%{$word}%")
                      ->orWhere('nama_wali', 'LIKE', "%{$word}%");
                }
            });
            $candidates = $query->limit(10)->get()->flatMap(function($item) {
                return array_filter([$item->nama_ayah, $item->nama_ibu, $item->nama_wali]);
            })->unique()->map(function($nama) {
                return [
                    'nama' => $nama,
                    'sudah_isi_tracking' => true,
                    'pekerjaan_di_database' => 'Tidak Wajib untuk Orang Tua'
                ];
            })->values();
        } else {
            // Search Siswa
            $querySiswa = Siswa::with('rencanaKarir');
            $querySiswa->where(function($q) use ($words) {
                foreach ($words as $word) {
                    $q->orWhere('nama_lengkap', 'LIKE', "%{$word}%");
                }
            });
            $candidatesSiswa = $querySiswa->limit(10)->get()->map(function($item) {
                $karir = $item->rencanaKarir;
                $pekerjaan = null;
                if ($karir) {
                    if (strtolower($karir->kategori_pilihan) === 'kerja') $pekerjaan = $karir->nama_perusahaan . ' - ' . $karir->posisi_pekerjaan;
                    elseif (strtolower($karir->kategori_pilihan) === 'kuliah') $pekerjaan = $karir->univ_pilihan_1 . ' - ' . $karir->jurusan_pilihan_1;
                    elseif (strtolower($karir->kategori_pilihan) === 'bisnis') $pekerjaan = $karir->bidang_bisnis . ' - ' . $karir->nama_bisnis;
                    else $pekerjaan = 'Belum/Tidak Bekerja';
                }
                return [
                    'nama' => $item->nama_lengkap,
                    'status_di_database' => $item->is_active ? 'Siswa Aktif' : 'Alumni',
                    'tahun_lulus_di_database' => $item->tahun_lulus,
                    'pekerjaan_di_database' => $pekerjaan
                ];
            });

            // Search Alumni
            $queryAlumni = Alumni::with('rencanaKarir');
            $queryAlumni->where(function($q) use ($words) {
                foreach ($words as $word) {
                    $q->orWhere('nama_lengkap', 'LIKE', "%{$word}%");
                }
            });
            $candidatesAlumni = $queryAlumni->limit(10)->get()->map(function($item) {
                $karir = $item->rencanaKarir;
                $pekerjaan = null;
                if ($karir) {
                    if (strtolower($karir->kategori_pilihan) === 'kerja') $pekerjaan = $karir->nama_perusahaan . ' - ' . $karir->posisi_pekerjaan;
                    elseif (strtolower($karir->kategori_pilihan) === 'kuliah') $pekerjaan = $karir->univ_pilihan_1 . ' - ' . $karir->jurusan_pilihan_1;
                    elseif (strtolower($karir->kategori_pilihan) === 'bisnis') $pekerjaan = $karir->bidang_bisnis . ' - ' . $karir->nama_bisnis;
                    else $pekerjaan = 'Belum/Tidak Bekerja';
                }
                return [
                    'nama' => $item->nama_lengkap,
                    'status_di_database' => 'Alumni',
                    'tahun_lulus_di_database' => $item->tahun_lulus,
                    'pekerjaan_di_database' => $pekerjaan
                ];
            });

            $candidates = $candidatesSiswa->toBase()->concat($candidatesAlumni->toBase())->take(10)->values();
        }

        if ($candidates->isEmpty()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Anda tidak ditemukan di database sekolah kami.'
            ], 422);
        }

        $apiKey = env('OPENROUTER_API_KEY');
        $model = env('OPENROUTER_MODEL', 'meta-llama/llama-3-8b-instruct:free');
        $occupation = trim($request->current_occupation);
        $gradYear = trim($request->graduation_year);
        
        if ($apiKey) {
            $prompt = "Tugas: Validasi Data Testimoni.
Input User:
- Nama: '{$name}'
- Peran: '{$role}'
- Tahun Lulus Input: '{$gradYear}'
- Pekerjaan/Kampus Input: '{$occupation}'

Daftar kandidat dari database: " . json_encode($candidates) . "

Aturan Validasi:
1. Cari kandidat yang namanya paling cocok dengan 'Nama' (Pertimbangkan typo). Jika tidak ada yang cocok, is_valid: false, reason: 'Nama Anda tidak ditemukan di database kami.'
2. Jika ada yang cocok, bandingkan 'Peran' dengan 'status_di_database'. Jika Peran='alumni' tapi status di DB masih 'Siswa Aktif', is_valid: false, reason: 'Anda terdaftar sebagai Siswa Aktif. Silakan pilih peran Siswa.'
3. Jika Peran bukan 'orangtua', bandingkan 'Tahun Lulus Input' dengan 'tahun_lulus_di_database' (jika ada). Jika sangat berbeda, is_valid: false, reason: 'Tahun lulus tidak sesuai.'
4. Jika Peran bukan 'orangtua', periksa 'pekerjaan_di_database'. Jika null, is_valid: false, reason: 'Silakan isi Rencana Karir / Tracking Alumni Anda terlebih dahulu.'
5. Jika Peran bukan 'orangtua' dan 'pekerjaan_di_database' tidak null, bandingkan dengan 'Pekerjaan/Kampus Input'. Jika maknanya jauh berbeda atau tidak nyambung, is_valid: false, reason: 'Pekerjaan/Kampus tidak sesuai dengan data Tracking Alumni Anda.'
6. Jika Peran adalah 'orangtua' atau semua syarat di atas terpenuhi, is_valid: true, reason: 'Valid'.

Output harus HANYA format JSON murni:
{
  \"is_valid\": true atau false,
  \"reason\": \"alasan sesuai aturan\"
}";

            try {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Content-Type' => 'application/json',
                ])->timeout(10)->post('https://openrouter.ai/api/v1/chat/completions', [
                    'model' => $model,
                    'messages' => [
                        ['role' => 'user', 'content' => $prompt]
                    ]
                ]);

                if ($response->successful()) {
                    $aiData = $response->json();
                    $content = $aiData['choices'][0]['message']['content'] ?? '{}';
                    
                    $content = trim(str_replace(['```json', '```'], '', $content));
                    $content = preg_replace('/^.*?({.*}).*?$/s', '$1', $content); // extract json block
                    $result = json_decode($content, true);

                    if (is_array($result) && isset($result['is_valid']) && $result['is_valid'] === false) {
                        return response()->json([
                            'status' => 'error',
                            'message' => 'Validasi ditolak oleh sistem: ' . ($result['reason'] ?? 'Nama tidak cocok dengan data.')
                        ], 422);
                    }
                } else {
                    Log::warning('OpenRouter API failed during testimonial validation: ' . $response->body());
                }
            } catch (\Exception $e) {
                Log::error('OpenRouter Exception: ' . $e->getMessage());
            }
        }
        // ==========================================

        if ($request->hasFile('image')) {
            $path = \App\Helpers\ImageHelper::compressAndStore($request->file('image'), 'testimonials');
            $data['avatar_url'] = 'storage/' . $path;
        }

        $testimonial = Testimonial::create($data);

        try {
            \App\Models\DashboardNotification::create([
                'type' => 'testimonial',
                'title' => 'Testimoni Baru',
                'message' => "Testimoni baru dari {$testimonial->name} ({$testimonial->role}) memerlukan persetujuan.",
                'is_read' => false
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create notification: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Testimonial berhasil dikirim! Menunggu persetujuan admin.',
            'data' => $testimonial
        ], 201);
    }

    /**
     * ADMIN: Get all testimonials
     */
    public function index()
    {
        $testimonials = Testimonial::orderBy('created_at', 'desc')->get();
        return response()->json($testimonials);
    }

    /**
     * ADMIN: Show specific testimonial
     */
    public function show($id)
    {
        $testimonial = Testimonial::findOrFail($id);
        return response()->json($testimonial);
    }

    /**
     * ADMIN: Store new testimonial
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'name' => 'required|string|max:255',
            'role' => 'required|in:alumni,siswa,orangtua',
            'message' => 'required|string',
            'status' => 'required|in:pending,approved',
            'graduation_year' => 'nullable|integer',
            'current_occupation' => 'nullable|string|max:255',
            'image' => 'nullable|image|max:2048',
            'rating' => 'required|integer|min:1|max:5'
        ]);

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            $path = \App\Helpers\ImageHelper::compressAndStore($request->file('image'), 'testimonials');
            $data['avatar_url'] = 'storage/' . $path;
        }

        $testimonial = Testimonial::create($data);
        Cache::forget('public_testimonials');

        return response()->json($testimonial, 201);
    }

    /**
     * ADMIN: Update testimonial
     */
    public function update(Request $request, $id)
    {
        $testimonial = Testimonial::findOrFail($id);

        $this->validate($request, [
            'name' => 'sometimes|required|string|max:255',
            'role' => 'sometimes|required|in:alumni,siswa,orangtua',
            'message' => 'sometimes|required|string',
            'status' => 'sometimes|required|in:pending,approved',
            'graduation_year' => 'nullable|integer',
            'current_occupation' => 'nullable|string|max:255',
            'image' => 'nullable|image|max:2048',
            'rating' => 'sometimes|required|integer|min:1|max:5'
        ]);

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            $path = \App\Helpers\ImageHelper::compressAndStore($request->file('image'), 'testimonials');
            $data['avatar_url'] = 'storage/' . $path;
        }

        $testimonial->update($data);
        Cache::forget('public_testimonials');

        return response()->json($testimonial);
    }

    /**
     * ADMIN: Destroy testimonial
     */
    public function destroy($id)
    {
        $testimonial = Testimonial::findOrFail($id);
        $testimonial->delete();
        Cache::forget('public_testimonials');

        return response()->json(['message' => 'Testimonial deleted successfully']);
    }

    /**
     * ADMIN: Toggle Status quickly
     */
    public function toggleStatus($id)
    {
        $testimonial = Testimonial::findOrFail($id);
        $testimonial->status = $testimonial->status === 'approved' ? 'pending' : 'approved';
        $testimonial->save();
        Cache::forget('public_testimonials');

        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully',
            'status' => $testimonial->status
        ], 200);
    }

    /**
     * ADMIN: Bulk delete testimonials
     */
    public function bulkDelete(Request $request)
    {
        $this->validate($request, [
            'ids' => 'required|array',
            'ids.*' => 'exists:testimonials,id'
        ]);

        Testimonial::whereIn('id', $request->ids)->delete();
        Cache::forget('public_testimonials');

        return response()->json([
            'success' => true,
            'message' => 'Testimoni terpilih berhasil dihapus.'
        ], 200);
    }
}
