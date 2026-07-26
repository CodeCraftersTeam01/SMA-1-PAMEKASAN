<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DashboardNotification;

class NotificationController extends Controller
{
    /**
     * Get all notifications
     */
    public function index()
    {
        $notifications = DashboardNotification::orderBy('created_at', 'desc')->get();
        return response()->json($notifications);
    }

    /**
     * Get unread notifications count
     */
    public function unreadCount()
    {
        $count = DashboardNotification::where('is_read', false)->count();
        return response()->json(['count' => $count]);
    }

    /**
     * Mark all notifications as read
     */
    public function readAll()
    {
        DashboardNotification::where('is_read', false)->update(['is_read' => true]);
        return response()->json(['success' => true, 'message' => 'Semua notifikasi ditandai telah dibaca.']);
    }

    /**
     * Mark a single notification as read
     */
    public function read($id)
    {
        $notification = DashboardNotification::findOrFail($id);
        $notification->is_read = true;
        $notification->save();
        return response()->json(['success' => true, 'message' => 'Notifikasi ditandai telah dibaca.']);
    }

    /**
     * Clear all notifications
     */
    public function clear()
    {
        DashboardNotification::truncate();
        return response()->json(['success' => true, 'message' => 'Semua notifikasi berhasil dihapus.']);
    }
}
