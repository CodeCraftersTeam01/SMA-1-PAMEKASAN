<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminTeacherController extends Controller
{
    public function index()
    {
        return response()->json(Teacher::orderBy('order', 'asc')->orderBy('name', 'asc')->get());
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'name' => 'required|string|max:255',
            'subject' => 'nullable|string|max:255',
            'order' => 'nullable|integer',
            'photo' => 'nullable|image|max:2048'
        ]);

        $data = $request->except('photo');
        
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('teachers', 'public');
            $data['photo'] = $path;
        }

        $teacher = Teacher::create($data);
        return response()->json($teacher, 201);
    }

    public function show($id)
    {
        return response()->json(Teacher::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $teacher = Teacher::findOrFail($id);

        $this->validate($request, [
            'name' => 'required|string|max:255',
            'subject' => 'nullable|string|max:255',
            'order' => 'nullable|integer',
            'photo' => 'nullable|image|max:2048'
        ]);

        $data = $request->except('photo');

        if ($request->hasFile('photo')) {
            if ($teacher->photo && Storage::disk('public')->exists($teacher->photo)) {
                Storage::disk('public')->delete($teacher->photo);
            }
            $path = $request->file('photo')->store('teachers', 'public');
            $data['photo'] = $path;
        }

        $teacher->update($data);
        return response()->json($teacher);
    }

    public function destroy($id)
    {
        $teacher = Teacher::findOrFail($id);
        if ($teacher->photo && Storage::disk('public')->exists($teacher->photo)) {
            Storage::disk('public')->delete($teacher->photo);
        }
        $teacher->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
