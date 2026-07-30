<?php

namespace App\Http\Controllers;

use App\Models\Facility;
use Illuminate\Http\Request;

class AdminFacilityController extends Controller
{
    public function index()
    {
        return response()->json(Facility::orderBy('order', 'asc')->get());
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'icon' => 'nullable|string',
            'image_url' => 'nullable|image|max:2048',
            'order' => 'nullable|integer',
        ]);

        $data = $request->except('image_url');
        
        if ($request->hasFile('image_url')) {
            $path = \App\Helpers\ImageHelper::compressAndStore($request->file('image_url'), 'facilities');
            $data['image_url'] = $path;
        }

        $facility = Facility::create($data);

        // Clear facilities and landing page caches
        \Illuminate\Support\Facades\Cache::forget('public_facilities');
        \Illuminate\Support\Facades\Cache::forget('landing_page_data');

        return response()->json($facility, 201);
    }

    public function show($id)
    {
        return response()->json(Facility::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $facility = Facility::findOrFail($id);

        $this->validate($request, [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'icon' => 'nullable|string',
            'image_url' => 'nullable|image|max:2048',
            'order' => 'nullable|integer',
        ]);

        $data = $request->except('image_url');

        if ($request->hasFile('image_url')) {
            if ($facility->image_url && \Illuminate\Support\Facades\Storage::disk('public')->exists($facility->image_url)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($facility->image_url);
            }
            $path = \App\Helpers\ImageHelper::compressAndStore($request->file('image_url'), 'facilities');
            $data['image_url'] = $path;
        }

        $facility->update($data);

        // Clear facilities and landing page caches
        \Illuminate\Support\Facades\Cache::forget('public_facilities');
        \Illuminate\Support\Facades\Cache::forget('landing_page_data');

        return response()->json($facility);
    }

    public function destroy($id)
    {
        $facility = Facility::findOrFail($id);
        if ($facility->image_url && \Illuminate\Support\Facades\Storage::disk('public')->exists($facility->image_url)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($facility->image_url);
        }
        $facility->delete();

        // Clear facilities and landing page caches
        \Illuminate\Support\Facades\Cache::forget('public_facilities');
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
