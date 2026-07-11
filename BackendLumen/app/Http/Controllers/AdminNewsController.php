<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;

class AdminNewsController extends Controller
{
    public function index()
    {
        return response()->json(News::orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'title' => 'required|string|max:255',
            'content' => 'required',
            'category' => 'nullable|string',
            'image' => 'nullable|image|max:5120',
        ]);

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('news', 'public');
            $imageUrl = url('storage/' . $path);
        }

        $news = News::create([
            'title' => $request->input('title'),
            'slug' => \Illuminate\Support\Str::slug($request->input('title')),
            'content' => $request->input('content'),
            'excerpt' => \Illuminate\Support\Str::limit(strip_tags($request->input('content')), 150),
            'category' => $request->input('category', 'Berita Sekolah'),
            'image_url' => $imageUrl,
            'author' => auth()->user()->name ?? 'Admin',
            'published_at' => \Carbon\Carbon::now(),
        ]);

        return response()->json($news, 201);
    }

    public function show($id)
    {
        return response()->json(News::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $this->validate($request, [
            'title' => 'required|string|max:255',
            'content' => 'required',
            'image' => 'nullable|image|max:5120',
        ]);

        $news = News::findOrFail($id);

        $imageUrl = $news->image_url;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('news', 'public');
            $imageUrl = url('storage/' . $path);
        }

        $news->update([
            'title' => $request->input('title'),
            'slug' => \Illuminate\Support\Str::slug($request->input('title')),
            'content' => $request->input('content'),
            'excerpt' => \Illuminate\Support\Str::limit(strip_tags($request->input('content')), 150),
            'category' => $request->input('category', $news->category),
            'image_url' => $imageUrl,
        ]);

        return response()->json($news);
    }

    public function destroy($id)
    {
        News::findOrFail($id)->delete();
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



