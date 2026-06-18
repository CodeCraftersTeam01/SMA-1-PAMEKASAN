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
        return response()->json($feature);
    }

    public function destroy($id)
    {
        $feature = Feature::findOrFail($id);
        $feature->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
