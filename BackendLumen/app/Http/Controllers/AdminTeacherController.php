<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminTeacherController extends Controller
{
    public function index()
    {
        // Custom order based on jabatan
        $teachers = Teacher::all()->sortBy(function($teacher) {
            $jabatan = strtolower($teacher->jabatan);
            if (str_contains($jabatan, 'kepala sekolah') && !str_contains($jabatan, 'wakil')) return 1;
            if (str_contains($jabatan, 'wakil kepala') || str_contains($jabatan, 'wakasek')) return 2;
            return 3;
        })->values();
        return response()->json($teachers);
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'name' => 'required|string|max:255',
            'subject' => 'nullable|string|max:255',
            'jabatan' => 'nullable|string|max:255',
            'kelas' => 'nullable|string|max:50',
            'photo' => 'nullable|image|max:2048'
        ]);

        $data = $request->except('photo');
        
        if ($request->hasFile('photo')) {
            $path = \App\Helpers\ImageHelper::compressAndStore($request->file('photo'), 'teachers');
            $data['photo'] = $path;
        }

        $teacher = Teacher::create($data);
        return response()->json($teacher, 201);
    }

    public function show($id)
    {
        return response()->json(Teacher::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $teacher = Teacher::findOrFail($id);

        $this->validate($request, [
            'name' => 'required|string|max:255',
            'subject' => 'nullable|string|max:255',
            'jabatan' => 'nullable|string|max:255',
            'kelas' => 'nullable|string|max:50',
            'photo' => 'nullable|image|max:2048'
        ]);

        $data = $request->except('photo');

        if ($request->hasFile('photo')) {
            if ($teacher->photo && Storage::disk('public')->exists($teacher->photo)) {
                Storage::disk('public')->delete($teacher->photo);
            }
            $path = \App\Helpers\ImageHelper::compressAndStore($request->file('photo'), 'teachers');
            $data['photo'] = $path;
        }

        $teacher->update($data);
        return response()->json($teacher);
    }

    public function destroy($id)
    {
        $teacher = Teacher::findOrFail($id);
        if ($teacher->photo && Storage::disk('public')->exists($teacher->photo)) {
            Storage::disk('public')->delete($teacher->photo);
        }
        $teacher->delete();
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

    public function bulkUpdatePerUser(Request $request)
    {
        $this->validate($request, [
            'updates' => 'required|array',
            'updates.*.id' => 'required|integer|exists:teachers,id',
            'updates.*.data' => 'required|array',
        ]);

        $count = 0;
        foreach ($request->updates as $update) {
            $teacher = Teacher::find($update['id']);
            if ($teacher) {
                $teacher->update([
                    'kelas' => isset($update['data']['kelas']) ? ($update['data']['kelas'] ?: null) : $teacher->kelas
                ]);
                $count++;
            }
        }

        return response()->json(['message' => "{$count} data guru berhasil diperbarui"]);
    }

}
