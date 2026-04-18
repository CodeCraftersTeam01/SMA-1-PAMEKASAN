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

    // UPDATE siswa
    public function update(Request $request, $id)
    {
        $siswa = Siswa::find($id);
        if (!$siswa) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $siswa->update($request->only(['nis', 'nama_lengkap', 'is_active', 'tahun_lulus']));

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
