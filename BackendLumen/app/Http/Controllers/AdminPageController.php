<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminPageController extends Controller
{
    public function index()
    {
        return response()->json(Page::orderBy('created_at', 'desc')->get());
    }

    public function show($id)
    {
        $page = Page::find($id);
        if (!$page) return response()->json(['message' => 'Not found'], 404);
        return response()->json($page);
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $slug = Str::slug($request->input('title'));
        // Ensure unique slug
        $originalSlug = $slug;
        $counter = 1;
        while (Page::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        $page = Page::create([
            'title' => $request->input('title'),
            'slug' => $slug,
            'content' => $request->input('content'),
            'is_active' => $request->input('is_active', true),
        ]);

        return response()->json($page, 201);
    }

    public function update(Request $request, $id)
    {
        $page = Page::find($id);
        if (!$page) return response()->json(['message' => 'Not found'], 404);

        $this->validate($request, [
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $slug = Str::slug($request->input('title'));
        // Check uniqueness excluding current
        $originalSlug = $slug;
        $counter = 1;
        while (Page::where('slug', $slug)->where('id', '!=', $id)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        $page->update([
            'title' => $request->input('title'),
            'slug' => $slug,
            'content' => $request->input('content'),
            'is_active' => $request->input('is_active', true),
        ]);

        return response()->json($page);
    }

    public function destroy($id)
    {
        $page = Page::find($id);
        if ($page) {
            $page->delete();
        }
        return response()->json(['message' => 'Deleted']);
    }
}
