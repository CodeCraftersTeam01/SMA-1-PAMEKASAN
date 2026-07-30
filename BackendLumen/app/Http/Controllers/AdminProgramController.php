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
        if (is_string($request->input('features_json'))) {
            $request->merge([
                'features_json' => json_decode($request->input('features_json'), true)
            ]);
        }

        $this->validate($request, [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'features_json' => 'nullable|array',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            'order' => 'nullable|integer',
        ]);

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            $path = \App\Helpers\ImageHelper::compressAndStore($request->file('image'), 'programs');
            $data['image_path'] = url('storage/' . $path);
        }

        $program = Program::create($data);

        // Clear landing pages cache
        \Illuminate\Support\Facades\Cache::forget('public_programs');
        \Illuminate\Support\Facades\Cache::forget('landing_page_data');

        return response()->json($program, 201);
    }

    public function show($id)
    {
        return response()->json(Program::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $program = Program::findOrFail($id);

        if (is_string($request->input('features_json'))) {
            $request->merge([
                'features_json' => json_decode($request->input('features_json'), true)
            ]);
        }

        $this->validate($request, [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'features_json' => 'nullable|array',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            'order' => 'nullable|integer',
        ]);

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            if ($program->image_path) {
                $relativePath = str_replace(url('storage') . '/', '', $program->image_path);
                if (\Illuminate\Support\Facades\Storage::disk('public')->exists($relativePath)) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($relativePath);
                }
            }
            $path = \App\Helpers\ImageHelper::compressAndStore($request->file('image'), 'programs');
            $data['image_path'] = url('storage/' . $path);
        }

        $program->update($data);

        // Clear landing pages cache
        \Illuminate\Support\Facades\Cache::forget('public_programs');
        \Illuminate\Support\Facades\Cache::forget('landing_page_data');

        return response()->json($program);
    }

    public function destroy($id)
    {
        $program = Program::findOrFail($id);

        if ($program->image_path) {
            $relativePath = str_replace(url('storage') . '/', '', $program->image_path);
            if (\Illuminate\Support\Facades\Storage::disk('public')->exists($relativePath)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($relativePath);
            }
        }

        $program->delete();

        // Clear landing pages cache
        \Illuminate\Support\Facades\Cache::forget('public_programs');
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
