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
    public function index()
    {
        $data = Siswa::with(['pendaftaran', 'tahunAjaran'])->get();

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
            'tanggal_lahir', 'agama', 'alamat', 'nomor_hp', 'email',
            'penerima_kps', 'nomor_kps', 'penerima_kip', 'nomor_kip',
            'is_active', 'tahun_masuk', 'tahun_ajaran_id',
        ];

        $data = $request->only($allowedFields);
        $data['is_active'] = filter_var($data['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN);

        if (empty($data['tahun_masuk'])) {
            $data['tahun_masuk'] = (int) date('Y');
        }

        if (empty($data['tahun_ajaran_id'])) {
            $activeTa = \App\Models\TahunAjaran::where('is_active', 1)->first();
            $data['tahun_ajaran_id'] = $activeTa ? $activeTa->id : null;
        }

        $siswa = Siswa::create($data);
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
            'tanggal_lahir', 'agama', 'alamat', 'nomor_hp', 'email',
            'penerima_kps', 'nomor_kps', 'penerima_kip', 'nomor_kip',
            'is_active', 'tahun_lulus',
        ];
        $siswa->update($request->only($allowedFields));

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
            'tanggal_lahir', 'agama', 'alamat', 'nomor_hp', 'email',
            'penerima_kps', 'nomor_kps', 'penerima_kip', 'nomor_kip',
            'is_active', 'tahun_lulus', 'tahun_ajaran_id',
        ];

        $updateData = array_intersect_key($request->data, array_flip($allowedFields));

        if (isset($updateData['is_active'])) {
            $updateData['is_active'] = filter_var($updateData['is_active'], FILTER_VALIDATE_BOOLEAN);
        }

        if (empty($updateData)) {
            return response()->json(['message' => 'Tidak ada field yang valid untuk diupdate'], 422);
        }

        $count = Siswa::whereIn('id', $request->ids)->update($updateData);
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
            'tanggal_lahir', 'agama', 'alamat', 'nomor_hp', 'email',
            'penerima_kps', 'nomor_kps', 'penerima_kip', 'nomor_kip',
            'is_active', 'tahun_lulus',
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
