<?php

namespace App\Http\Controllers;

use App\Models\Siswa;
use App\Models\Pendaftaran;
use App\Models\TahunAjaran;
use App\Services\NisGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SiswaController extends Controller
{

    // GET semua siswa (with relasi)
    public function index(Request $request)
    {
        $query = Siswa::with([
            'pendaftaran:id,nama_lengkap,asal_sekolah',
            'tahunAjaran:id,tahun',
        ]);

        // Server-side search (NIS, nama, NISN, kelas)
        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                    ->orWhere('nis', 'like', "%{$search}%")
                    ->orWhere('nisn', 'like', "%{$search}%")
                    ->orWhere('kelas', 'like', "%{$search}%");
            });
        }

        // Optional filters
        if ($request->filled('tahun_masuk')) {
            $query->where('tahun_masuk', $request->query('tahun_masuk'));
        }
        if ($request->filled('tahun_ajaran_id')) {
            $query->where('tahun_ajaran_id', $request->query('tahun_ajaran_id'));
        }

        $query->orderByDesc('id');

        // Server-side pagination (opt-in via per_page / page).
        // Without these params we keep returning the full list for
        // backward compatibility with existing screens.
        if ($request->filled('per_page') || $request->filled('page')) {
            $perPage = (int) $request->query('per_page', 25);
            $perPage = max(1, min($perPage, 200));
            return response()->json($query->paginate($perPage));
        }

        $data = $query->get();

        if ($data->count() > 0) {
            return response()->json($data);
        }

        return response()->json(['message' => 'Data siswa tidak ditemukan'], 404);
    }

    // GET satu siswa
    public function show($id)
    {
        $data = Siswa::with(['pendaftaran', 'tahunAjaran'])->find($id);

        if (!$data) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        return response()->json($data);
    }

    // CREATE siswa
    public function store(Request $request)
    {
        $allowedFields = [
            'nis', 'kelas', 'nama_lengkap', 'jenis_kelamin', 'nisn', 'tempat_lahir',
            'tanggal_lahir', 'agama', 'alamat', 'rt', 'rw', 'dusun', 'kelurahan', 'kode_pos',
            'jenis_tinggal', 'alat_transportasi', 'lintang', 'bujur', 'nomor_hp', 'email',
            'penerima_kps', 'nomor_kps', 'penerima_kip', 'nomor_kip',
            'is_active', 'tahun_masuk', 'tahun_ajaran_id', 'tahun_lulus',
            'kelas_10', 'kelas_11', 'kelas_12',
        ];

        $data = $request->only($allowedFields);
        $data['is_active'] = filter_var($data['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN);

        if (empty($data['tahun_ajaran_id'])) {
            $activeTa = \App\Models\TahunAjaran::where('is_active', 1)->first();
            $data['tahun_ajaran_id'] = $activeTa ? $activeTa->id : null;
        }

        if (empty($data['tahun_masuk'])) {
            $baseYear = (int) date('Y');
            if (!empty($data['tahun_ajaran_id'])) {
                $ta = \App\Models\TahunAjaran::find($data['tahun_ajaran_id']);
                if ($ta) {
                    $baseYear = (int) substr($ta->tahun, 0, 4);
                }
            }

            $kelasUpper = strtoupper(trim($data['kelas'] ?? ''));
            $tahunMasuk = $baseYear;
            if (str_starts_with($kelasUpper, 'XII') || str_starts_with($kelasUpper, '12')) {
                $tahunMasuk = $baseYear - 2;
            } elseif (str_starts_with($kelasUpper, 'XI') || str_starts_with($kelasUpper, '11')) {
                $tahunMasuk = $baseYear - 1;
            }
            $data['tahun_masuk'] = $tahunMasuk;
        }

        if (empty($data['nis'])) {
            $nisGenerator = new NisGeneratorService();
            $data['nis'] = $nisGenerator->generateNis($data['tahun_masuk']);
        }

        $siswa = Siswa::create($data);
        \App\Services\GraduationService::checkByIds([$siswa->id]);

        return response()->json(['message' => 'Data siswa berhasil ditambahkan', 'data' => $siswa], 201);
    }

    // UPDATE siswa
    public function update(Request $request, $id)
    {
        $siswa = Siswa::find($id);
        if (!$siswa) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $allowedFields = [
            'nis', 'kelas', 'nama_lengkap', 'jenis_kelamin', 'nisn', 'tempat_lahir',
            'tanggal_lahir', 'agama', 'alamat', 'rt', 'rw', 'dusun', 'kelurahan', 'kode_pos',
            'jenis_tinggal', 'alat_transportasi', 'lintang', 'bujur', 'nomor_hp', 'email',
            'penerima_kps', 'nomor_kps', 'penerima_kip', 'nomor_kip',
            'is_active', 'tahun_lulus', 'tahun_ajaran_id',
            'kelas_10', 'kelas_11', 'kelas_12',
        ];
        $data = $request->only($allowedFields);
        $siswa->update($data);
        \App\Services\GraduationService::checkByIds([$siswa->id]);

        return response()->json(['message' => 'Data siswa berhasil diperbarui', 'data' => $siswa]);
    }

    // DELETE siswa
    public function destroy($id)
    {
        $siswa = Siswa::find($id);
        if (!$siswa) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $siswa->delete();
        return response()->json(['message' => 'Data siswa berhasil dihapus']);
    }

    // BULK DELETE
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:siswas,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        $count = Siswa::whereIn('id', $request->ids)->delete();
        return response()->json(['message' => "{$count} data siswa berhasil dihapus"]);
    }

    // BULK UPDATE
    public function bulkUpdate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:siswas,id',
            'data' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        $allowedFields = [
            'nis', 'kelas', 'nama_lengkap', 'jenis_kelamin', 'nisn', 'tempat_lahir',
            'tanggal_lahir', 'agama', 'alamat', 'rt', 'rw', 'dusun', 'kelurahan', 'kode_pos',
            'jenis_tinggal', 'alat_transportasi', 'lintang', 'bujur', 'nomor_hp', 'email',
            'penerima_kps', 'nomor_kps', 'penerima_kip', 'nomor_kip',
            'is_active', 'tahun_lulus', 'tahun_ajaran_id',
            'kelas_10', 'kelas_11', 'kelas_12',
        ];

        $updateData = array_intersect_key($request->data, array_flip($allowedFields));

        if (isset($updateData['is_active'])) {
            $updateData['is_active'] = filter_var($updateData['is_active'], FILTER_VALIDATE_BOOLEAN);
        }

        if (empty($updateData)) {
            return response()->json(['message' => 'Tidak ada field yang valid untuk diupdate'], 422);
        }

        $count = Siswa::whereIn('id', $request->ids)->update($updateData);
        \App\Services\GraduationService::checkByIds($request->ids);

        return response()->json(['message' => "{$count} data siswa berhasil diperbarui"]);
    }

    // BULK UPDATE PER-USER
    public function bulkUpdatePerUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'updates' => 'required|array',
            'updates.*.id' => 'required|integer|exists:siswas,id',
            'updates.*.data' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        $allowedFields = [
            'nis', 'kelas', 'nama_lengkap', 'jenis_kelamin', 'nisn', 'tempat_lahir',
            'tanggal_lahir', 'agama', 'alamat', 'rt', 'rw', 'dusun', 'kelurahan', 'kode_pos',
            'jenis_tinggal', 'alat_transportasi', 'lintang', 'bujur', 'nomor_hp', 'email',
            'penerima_kps', 'nomor_kps', 'penerima_kip', 'nomor_kip',
            'is_active', 'tahun_lulus',
            'kelas_10', 'kelas_11', 'kelas_12',
        ];

        $count = 0;
        foreach ($request->updates as $update) {
            $updateData = array_intersect_key($update['data'], array_flip($allowedFields));
            if (empty($updateData)) continue;

            if (isset($updateData['is_active'])) {
                $updateData['is_active'] = filter_var($updateData['is_active'], FILTER_VALIDATE_BOOLEAN);
            }

            Siswa::where('id', $update['id'])->update($updateData);
            $count++;
        }

        \App\Services\GraduationService::checkByIds(array_column($request->updates, 'id'));

        return response()->json(['message' => "{$count} data siswa berhasil diperbarui"]);
    }

    /**
     * MIGRATE: Ambil semua pendaftar dengan status 'pending',
     * ubah status ke 'diterima', dan buatkan record siswa otomatis.
     * NIS di-generate otomatis oleh NisGeneratorService.
     */
    public function migrate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tahun_ajaran_id' => 'required|exists:tahun_ajarans,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        $tahunAjaran = TahunAjaran::find($request->tahun_ajaran_id);
        $tahunMasuk = (int) substr($tahunAjaran->tahun, 0, 4); // ambil tahun pertama dari format "2025/2026"

        $pendaftaranMenunggu = Pendaftaran::where('status', 'pending')->get();

        if ($pendaftaranMenunggu->count() === 0) {
            return response()->json(['message' => 'Tidak ada pendaftar dengan status menunggu.'], 404);
        }

        $migratedCount = 0;
        $skippedCount = 0;

        foreach ($pendaftaranMenunggu as $pendaftar) {
            // Cek apakah sudah pernah dimigrasikan (sudah ada record siswa dari pendaftar ini)
            $sudahAda = Siswa::where('pendaftar_id', $pendaftar->id)->exists();
            if ($sudahAda) {
                $skippedCount++;
                continue;
            }

        // Generate NIS
            $nisGenerator = new NisGeneratorService();
            $nis = $nisGenerator->generateNis($tahunMasuk);

            // Buat record Siswa
            Siswa::create([
                'pendaftar_id'    => $pendaftar->id,
                'tahun_ajaran_id' => $request->tahun_ajaran_id,
                'nis'             => $nis,
                'nama_lengkap'    => $pendaftar->nama_lengkap,
                'is_active'       => true,
                'tahun_masuk'     => $tahunMasuk,
            ]);

            // Ubah status pendaftar menjadi diterima
            $pendaftar->update(['status' => 'diterima']);

            $migratedCount++;
        }

        return response()->json([
            'message'        => "{$migratedCount} pendaftar berhasil dimigrasikan menjadi siswa.",
            'migrated_count' => $migratedCount,
            'skipped_count'  => $skippedCount,
        ]);
    }
}
