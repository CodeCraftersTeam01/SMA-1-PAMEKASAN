<?php

namespace App\Http\Controllers;

use App\Models\Alumni;
use Illuminate\Http\Request;

class AlumniController extends Controller
{
    public function index()
    {
        return response()->json(Alumni::all());
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'nisn' => 'required|unique:alumnis',
            'nama_lengkap' => 'required|string',
            'tahun_lulus' => 'required|integer',
        ]);

        $alumni = Alumni::create($request->all());
        return response()->json($alumni, 201);
    }

    public function bulkDelete(\Illuminate\Http\Request $request)
    {
        $ids = $request->input('ids', []);
        $deleted = 0;
        foreach ($ids as $id) {
            try {
                $this->destroy($id);
                $deleted++;
            } catch (\Exception $e) {
                // skip
            }
        }
        return response()->json(['message' => "$deleted data berhasil dihapus"]);
    }

}
