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
            'image_url' => 'nullable|string',
        ]);

        $news = News::create([
            'title' => $request->input('title'),
            'slug' => \Illuminate\Support\Str::slug($request->input('title')),
            'content' => $request->input('content'),
            'excerpt' => \Illuminate\Support\Str::limit(strip_tags($request->input('content')), 150),
            'category' => $request->input('category', 'Berita Sekolah'),
            'image_url' => $request->input('image_url'),
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
        ]);

        $news = News::findOrFail($id);
        $news->update([
            'title' => $request->input('title'),
            'slug' => \Illuminate\Support\Str::slug($request->input('title')),
            'content' => $request->input('content'),
            'excerpt' => \Illuminate\Support\Str::limit(strip_tags($request->input('content')), 150),
            'category' => $request->input('category', $news->category),
            'image_url' => $request->input('image_url', $news->image_url),
        ]);

        return response()->json($news);
    }

    public function destroy($id)
    {
        News::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
