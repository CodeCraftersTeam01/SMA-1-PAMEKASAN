<?php

namespace App\Http\Controllers;

use App\Models\Kelas;
use App\Models\Siswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class KelasController extends Controller
{
    public function index()
    {
        $data = Kelas::orderBy('tingkat')->orderBy('nama_kelas')->get();

        $data->each(function ($kelas) {
            $kelas->total_siswa = Siswa::where('kelas', $kelas->nama_kelas)->count();
            $kelas->siswa_aktif = Siswa::where('kelas', $kelas->nama_kelas)->where('is_active', true)->count();
        });

        if ($data->count() > 0) {
            return response()->json($data);
        }

        return response()->json(['message' => 'Data kelas tidak ditemukan'], 404);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_kelas' => 'required|string|max:50|unique:kelas,nama_kelas',
            'tingkat' => 'required|string|max:10',
            'jurusan' => 'nullable|string|max:50',
            'rombel' => 'nullable|string|max:10',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        $data = Kelas::create([
            'nama_kelas' => $request->nama_kelas,
            'tingkat' => $request->tingkat,
            'jurusan' => $request->jurusan,
            'rombel' => $request->rombel,
            'is_active' => $request->has('is_active') ? $request->is_active : true,
        ]);

        return response()->json([
            'message' => 'Kelas berhasil ditambahkan',
            'data' => $data,
        ], 201);
    }

    public function show($id)
    {
        $data = Kelas::find($id);

        if (!$data) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $data->total_siswa = Siswa::where('kelas', $data->nama_kelas)->count();
        $data->siswa_aktif = Siswa::where('kelas', $data->nama_kelas)->where('is_active', true)->count();

        return response()->json($data);
    }

    public function update(Request $request, $id)
    {
        $data = Kelas::find($id);

        if (!$data) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nama_kelas' => 'sometimes|required|string|max:50|unique:kelas,nama_kelas,' . $id,
            'tingkat' => 'sometimes|required|string|max:10',
            'jurusan' => 'nullable|string|max:50',
            'rombel' => 'nullable|string|max:10',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        $data->update($request->only(['nama_kelas', 'tingkat', 'jurusan', 'rombel', 'is_active']));

        return response()->json([
            'message' => 'Kelas berhasil diperbarui',
            'data' => $data,
        ]);
    }

    public function destroy($id)
    {
        $data = Kelas::find($id);

        if (!$data) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $countSiswa = Siswa::where('kelas', $data->nama_kelas)->count();
        if ($countSiswa > 0) {
            return response()->json([
                'message' => "Tidak dapat menghapus kelas {$data->nama_kelas} karena masih ada {$countSiswa} siswa terdaftar",
            ], 409);
        }

        $data->delete();

        return response()->json([
            'message' => 'Kelas berhasil dihapus',
        ]);
    }
}
