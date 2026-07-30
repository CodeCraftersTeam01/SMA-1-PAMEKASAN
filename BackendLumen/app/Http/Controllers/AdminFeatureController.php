<?php

namespace App\Http\Controllers;

use App\Models\Feature;
use Illuminate\Http\Request;

class AdminFeatureController extends Controller
{
    public function index()
    {
        return response()->json(Feature::orderBy('order', 'asc')->get());
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'icon' => 'nullable|string|max:255',
            'order' => 'nullable|integer',
        ]);

        $feature = Feature::create($request->all());

        // Clear features and landing page caches
        \Illuminate\Support\Facades\Cache::forget('public_features');
        \Illuminate\Support\Facades\Cache::forget('landing_page_data');

        return response()->json($feature, 201);
    }

    public function show($id)
    {
        return response()->json(Feature::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $feature = Feature::findOrFail($id);

        $this->validate($request, [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'icon' => 'nullable|string|max:255',
            'order' => 'nullable|integer',
        ]);

        $feature->update($request->all());

        // Clear features and landing page caches
        \Illuminate\Support\Facades\Cache::forget('public_features');
        \Illuminate\Support\Facades\Cache::forget('landing_page_data');

        return response()->json($feature);
    }

    public function destroy($id)
    {
        $feature = Feature::findOrFail($id);
        $feature->delete();

        // Clear features and landing page caches
        \Illuminate\Support\Facades\Cache::forget('public_features');
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
