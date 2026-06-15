<?php

namespace App\Http\Controllers;

use App\Models\Program;
use Illuminate\Http\Request;

class AdminProgramController extends Controller
{
    public function index()
    {
        return response()->json(Program::orderBy('order', 'asc')->get());
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'features_json' => 'nullable|array',
            'order' => 'nullable|integer',
        ]);

        $program = Program::create($request->all());
        return response()->json($program, 201);
    }

    public function show($id)
    {
        return response()->json(Program::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $program = Program::findOrFail($id);

        $this->validate($request, [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'features_json' => 'nullable|array',
            'order' => 'nullable|integer',
        ]);

        $program->update($request->all());
        return response()->json($program);
    }

    public function destroy($id)
    {
        $program = Program::findOrFail($id);
        $program->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
