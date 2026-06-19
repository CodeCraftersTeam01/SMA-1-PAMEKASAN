<?php

namespace App\Http\Controllers;

use App\Models\Achievement;
use Illuminate\Http\Request;

class AdminAchievementController extends Controller
{
    public function index()
    {
        return response()->json(Achievement::with(['siswas:id,nama_lengkap,kelas'])->orderBy('year', 'desc')->get());
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'year' => 'required|integer',
            'level' => 'required|string',
            'category' => 'nullable|string',
            'student_name' => 'nullable|string|max:255',
            'siswa_ids' => 'nullable|array',
            'siswa_ids.*' => 'exists:siswas,id',
        ]);

        $achievement = Achievement::create($request->except('siswa_ids'));
        
        if ($request->has('siswa_ids') && is_array($request->siswa_ids)) {
            $achievement->siswas()->sync($request->siswa_ids);
        }

        return response()->json($achievement->load('siswas:id,nama_lengkap,kelas'), 201);
    }

    public function show($id)
    {
        return response()->json(Achievement::with('siswas')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $this->validate($request, [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'year' => 'required|integer',
            'level' => 'required|string',
            'student_name' => 'nullable|string|max:255',
            'siswa_ids' => 'nullable|array',
            'siswa_ids.*' => 'exists:siswas,id',
        ]);

        $achievement = Achievement::findOrFail($id);
        $achievement->update($request->except('siswa_ids'));
        
        if ($request->has('siswa_ids') && is_array($request->siswa_ids)) {
            $achievement->siswas()->sync($request->siswa_ids);
        } else {
            $achievement->siswas()->detach();
        }

        return response()->json($achievement->load('siswas:id,nama_lengkap,kelas'));
    }

    public function destroy($id)
    {
        $achievement = Achievement::findOrFail($id);
        $achievement->siswas()->detach();
        $achievement->delete();
        return response()->json(['message' => 'Deleted successfully']);
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
