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
            'image_url' => 'nullable|string',
            'order' => 'nullable|integer',
        ]);

        $facility = Facility::create($request->all());
        return response()->json($facility, 201);
    }

    public function show($id)
    {
        return response()->json(Facility::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $this->validate($request, [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        $facility = Facility::findOrFail($id);
        $facility->update($request->all());
        return response()->json($facility);
    }

    public function destroy($id)
    {
        Facility::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
