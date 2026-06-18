<?php

namespace App\Http\Controllers;

use App\Models\NavbarItem;
use Illuminate\Http\Request;

class AdminNavbarController extends Controller
{
    public function index()
    {
        return response()->json(NavbarItem::orderBy('order', 'asc')->get());
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'label' => 'required|string|max:255',
            'url' => 'nullable|string|max:255',
            'order' => 'integer',
            'is_active' => 'boolean',
            'parent_id' => 'nullable|exists:navbar_items,id'
        ]);

        $item = NavbarItem::create([
            'label' => $request->input('label'),
            'url' => $request->input('url'),
            'order' => $request->input('order', 0),
            'is_active' => $request->input('is_active', true),
            'parent_id' => $request->input('parent_id'),
        ]);

        return response()->json($item, 201);
    }

    public function update(Request $request, $id)
    {
        $item = NavbarItem::find($id);
        if (!$item) return response()->json(['message' => 'Not found'], 404);

        $this->validate($request, [
            'label' => 'required|string|max:255',
            'url' => 'nullable|string|max:255',
            'order' => 'integer',
            'is_active' => 'boolean',
            'parent_id' => 'nullable|exists:navbar_items,id'
        ]);

        // Prevent self-referencing
        if ($request->input('parent_id') == $id) {
            return response()->json(['message' => 'Cannot set self as parent'], 400);
        }

        $item->update([
            'label' => $request->input('label'),
            'url' => $request->input('url'),
            'order' => $request->input('order', 0),
            'is_active' => $request->input('is_active', true),
            'parent_id' => $request->input('parent_id'),
        ]);

        return response()->json($item);
    }

    public function destroy($id)
    {
        $item = NavbarItem::find($id);
        if ($item) {
            $item->delete();
        }
        return response()->json(['message' => 'Deleted']);
    }
}
