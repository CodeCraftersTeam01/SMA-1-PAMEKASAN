<?php

namespace App\Http\Controllers;

use App\Models\Pendaftaran;
use Illuminate\Http\Request;

class PendaftaranController extends Controller
{
    // READ semua data
    public function index()
    {
        if (Pendaftaran::all()->count() > 0) {
            return response()->json(Pendaftaran::all());
        }
        else {
            return response()->json([
                'message' => 'Data pendaftaran tidak ditemukan'
            ], 404);
        }
    }

    // CREATE data pendaftaran
    public function store(Request $request)
    {
        $request->validate([
            'no_pendaftaran' => 'required|unique:pendaftars',
            'nisn' => 'required|unique:pendaftars',
            'nama_lengkap' => 'required',
            'asal_sekolah' => 'required',
            'alamat' => 'required'
        ]);

        $data = Pendaftaran::create($request->all());

        return response()->json([
            'message' => 'Pendaftaran berhasil dibuat',
            'data' => $data
        ]);
    }

    // READ satu data
    public function show($id)
    {
        $data = Pendaftaran::findOrFail($id);

        return response()->json($data);
    }

    // UPDATE data
    public function update(Request $request, $id)
    {
        $data = Pendaftaran::findOrFail($id);

        $data->update($request->all());

        return response()->json([
            'message' => 'Data berhasil diupdate',
            'data' => $data
        ]);
    }

    // DELETE data
    public function destroy($id)
    {
        Pendaftaran::destroy($id);

        return response()->json([
            'message' => 'Data berhasil dihapus'
        ]);
    }
}