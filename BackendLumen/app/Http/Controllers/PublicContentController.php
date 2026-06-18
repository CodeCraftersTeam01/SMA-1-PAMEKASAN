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

    public function getVisitors(\Illuminate\Http\Request $request)
    {
        $ip = $request->ip();
        $today = date('Y-m-d');
        
        // Record visit if not visited today from this IP
        $visited = \App\Models\WebsiteVisitor::where('ip_address', $ip)
            ->where('visited_date', $today)
            ->exists();
            
        if (!$visited) {
            \App\Models\WebsiteVisitor::create([
                'ip_address' => $ip,
                'user_agent' => $request->userAgent(),
                'visited_date' => $today
            ]);
        }

        // Get stats
        $todayCount = \App\Models\WebsiteVisitor::where('visited_date', $today)->count();
        $monthCount = \App\Models\WebsiteVisitor::whereMonth('visited_date', date('m'))
                                                 ->whereYear('visited_date', date('Y'))
                                                 ->count();
        $yearCount = \App\Models\WebsiteVisitor::whereYear('visited_date', date('Y'))->count();

        return response()->json([
            'today' => $todayCount,
            'month' => $monthCount,
            'year' => $yearCount
        ]);
    }
}
