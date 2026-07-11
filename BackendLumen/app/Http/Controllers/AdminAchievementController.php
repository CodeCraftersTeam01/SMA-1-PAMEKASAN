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
            'status' => 'nullable|in:pending,approved,rejected',
        ]);

        $data = $request->except('siswa_ids');
        if (!isset($data['status'])) {
            $data['status'] = 'approved';
        }

        $achievement = Achievement::create($data);
        
        if ($request->has('siswa_ids') && is_array($request->siswa_ids)) {
            $achievement->siswas()->sync($request->siswa_ids);
        }

        if ($achievement->status === 'approved') {
            $this->generateAnnouncement($achievement);
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
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'year' => 'sometimes|required|integer',
            'level' => 'sometimes|required|string',
            'student_name' => 'nullable|string|max:255',
            'siswa_ids' => 'nullable|array',
            'siswa_ids.*' => 'exists:siswas,id',
            'status' => 'nullable|in:pending,approved,rejected',
        ]);

        $achievement = Achievement::findOrFail($id);
        $oldStatus = $achievement->status;
        
        $achievement->update($request->except('siswa_ids'));
        
        if ($request->has('siswa_ids') && is_array($request->siswa_ids)) {
            $achievement->siswas()->sync($request->siswa_ids);
        } else {
            $achievement->siswas()->detach();
        }

        $achievement->refresh();

        if ($oldStatus !== 'approved' && $achievement->status === 'approved') {
            $this->generateAnnouncement($achievement);
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

    private function generateAnnouncement(Achievement $achievement)
    {
        $studentName = $achievement->student_name;
        if (empty($studentName) && $achievement->siswas()->count() > 0) {
            $studentName = $achievement->siswas()->pluck('nama_lengkap')->implode(', ');
        }

        $aiService = new \App\Services\OpenRouterService();
        $content = $aiService->generateAchievementAnnouncement(
            $achievement->title,
            $studentName ?? '',
            $achievement->level ?? '',
            $achievement->category ?? ''
        );

        \App\Models\News::create([
            'title' => 'Prestasi Baru: ' . $achievement->title,
            'slug' => \Illuminate\Support\Str::slug('Prestasi ' . $achievement->title . ' ' . time()),
            'excerpt' => 'Selamat atas prestasi baru yang diraih oleh siswa SMAN 1 Pamekasan.',
            'content' => $content,
            'category' => 'Pengumuman',
            'author' => 'Sistem AI',
            'published_at' => \Carbon\Carbon::now(),
        ]);
    }

}
