<?php

namespace App\Http\Controllers;

use App\Models\Achievement;
use Illuminate\Http\Request;

class AdminAchievementController extends Controller
{
    public function index()
    {
        return response()->json(Achievement::orderBy('year', 'desc')->get());
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'year' => 'required|integer',
            'level' => 'required|string',
            'category' => 'nullable|string',
        ]);

        $achievement = Achievement::create($request->all());
        return response()->json($achievement, 201);
    }

    public function show($id)
    {
        return response()->json(Achievement::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $this->validate($request, [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'year' => 'required|integer',
            'level' => 'required|string',
        ]);

        $achievement = Achievement::findOrFail($id);
        $achievement->update($request->all());
        return response()->json($achievement);
    }

    public function destroy($id)
    {
        Achievement::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
