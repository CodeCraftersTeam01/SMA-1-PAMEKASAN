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
        return response()->json($facility);
    }

    public function destroy($id)
    {
        $facility = Facility::findOrFail($id);
        if ($facility->image_url && \Illuminate\Support\Facades\Storage::disk('public')->exists($facility->image_url)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($facility->image_url);
        }
        $facility->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
