<?php

namespace App\Http\Controllers;

use App\Models\TahunAjaran;
use Illuminate\Http\Request;

class TahunAjaranController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = TahunAjaran::all();
        if ($data->count() > 0) {
            return response()->json($data);
        } else {
            return response()->json([
                'message' => 'Data tahun ajaran tidak ditemukan'
            ], 404);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'tahun' => 'required|string|unique:tahun_ajarans,tahun',
            'is_active' => 'boolean'
        ]);

        // Jika diset aktif, pastikan yang lain menjadi tidak aktif (opsional - sesuai kebutuhan)
        if ($request->has('is_active') && $request->is_active) {
            TahunAjaran::where('is_active', true)->update(['is_active' => false]);
        }

        $data = TahunAjaran::create([
            'tahun' => $request->tahun,
            'is_active' => $request->has('is_active') ? $request->is_active : false
        ]);

        return response()->json([
            'message' => 'Tahun ajaran berhasil dibuat',
            'data' => $data
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $data = TahunAjaran::find($id);

        if (!$data) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        return response()->json($data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $data = TahunAjaran::find($id);

        if (!$data) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $request->validate([
            'tahun' => 'sometimes|required|string|unique:tahun_ajarans,tahun,' . $id,
            'is_active' => 'boolean'
        ]);

        // Jika diset aktif, pastikan yang lain menjadi tidak aktif
        if ($request->has('is_active') && $request->is_active) {
            TahunAjaran::where('id', '!=', $id)->where('is_active', true)->update(['is_active' => false]);
        }

        $data->update($request->only(['tahun', 'is_active']));

        return response()->json([
            'message' => 'Data berhasil diupdate',
            'data' => $data
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $data = TahunAjaran::find($id);

        if (!$data) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $data->delete();

        return response()->json([
            'message' => 'Data berhasil dihapus'
        ]);
    }
}
