<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index()
    {
        $announcements = Announcement::orderBy('created_at', 'desc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $announcements
        ]);
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'type' => 'string|in:agenda,custom',
            'is_active' => 'boolean'
        ]);

        $data = $request->all();
        // default type to custom if not provided
        if (!isset($data['type'])) {
            $data['type'] = 'custom';
        }

        $announcement = Announcement::create($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Pengumuman berhasil ditambahkan',
            'data' => $announcement
        ], 201);
    }

    public function show($id)
    {
        $announcement = Announcement::findOrFail($id);
        return response()->json([
            'status' => 'success',
            'data' => $announcement
        ]);
    }

    public function update(Request $request, $id)
    {
        $announcement = Announcement::findOrFail($id);

        $this->validate($request, [
            'title' => 'string|max:255',
            'content' => 'nullable|string',
            'type' => 'string|in:agenda,custom',
            'is_active' => 'boolean'
        ]);

        $announcement->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Pengumuman berhasil diupdate',
            'data' => $announcement
        ]);
    }

    public function destroy($id)
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Pengumuman berhasil dihapus'
        ]);
    }
}
