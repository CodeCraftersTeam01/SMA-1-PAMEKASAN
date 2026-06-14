<?php

namespace App\Http\Controllers;

use App\Models\NavbarItem;
use App\Models\Page;

class PublicContentController extends Controller
{
    public function getNavbars()
    {
        return response()->json(NavbarItem::whereNull('parent_id')->where('is_active', true)->with(['children' => function($query) {
            $query->where('is_active', true);
        }])->orderBy('order', 'asc')->get());
    }

    public function getPage($slug)
    {
        $page = Page::where('slug', $slug)->where('is_active', true)->first();
        if (!$page) return response()->json(['message' => 'Not found'], 404);
        return response()->json($page);
    }
}
