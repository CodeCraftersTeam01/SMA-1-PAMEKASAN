<?php

namespace App\Http\Controllers;

use App\Models\Extracurricular;
use Illuminate\Http\Request;

class ExtracurricularController extends Controller
{
    /**
     * Display a listing of extracurriculars.
     */
    public function index()
    {
        $items = \Illuminate\Support\Facades\Cache::remember('public_extracurriculars', 60, function () {
            return Extracurricular::orderBy('name', 'asc')->get();
        });
        return response()->json($items);
    }

    /**
     * Store a newly created extracurricular in storage.
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $path = \App\Helpers\ImageHelper::compressAndStore($request->file('image'), 'extracurriculars');
            $imagePath = url('storage/' . $path);
        } elseif ($request->input('image_path')) {
            $imagePath = $request->input('image_path');
        }

        $item = Extracurricular::create([
            'name' => $request->input('name'),
            'description' => $request->input('description'),
            'image_path' => $imagePath,
        ]);

        // Clear extracurriculars and landing page caches
        \Illuminate\Support\Facades\Cache::forget('public_extracurriculars');
        \Illuminate\Support\Facades\Cache::forget('landing_page_data');

        return response()->json($item, 201);
    }

    /**
     * Display the specified extracurricular.
     */
    public function show($id)
    {
        $item = Extracurricular::findOrFail($id);
        return response()->json($item);
    }

    /**
     * Update the specified extracurricular in storage.
     */
    public function update(Request $request, $id)
    {
        $this->validate($request, [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
        ]);

        $item = Extracurricular::findOrFail($id);

        $imagePath = $item->image_path;
        if ($request->hasFile('image')) {
            $path = \App\Helpers\ImageHelper::compressAndStore($request->file('image'), 'extracurriculars');
            $imagePath = url('storage/' . $path);
        } elseif ($request->has('image_path')) {
            $imagePath = $request->input('image_path');
        }

        $item->update([
            'name' => $request->input('name'),
            'description' => $request->input('description'),
            'image_path' => $imagePath,
        ]);

        // Clear extracurriculars and landing page caches
        \Illuminate\Support\Facades\Cache::forget('public_extracurriculars');
        \Illuminate\Support\Facades\Cache::forget('landing_page_data');

        return response()->json($item);
    }

    /**
     * Remove the specified extracurricular from storage.
     */
    public function destroy($id)
    {
        $item = Extracurricular::findOrFail($id);
        $item->delete();

        // Clear extracurriculars and landing page caches
        \Illuminate\Support\Facades\Cache::forget('public_extracurriculars');
        \Illuminate\Support\Facades\Cache::forget('landing_page_data');

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
