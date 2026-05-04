<?php

namespace App\Http\Controllers;

use App\Models\Siswa;
use App\Models\Pendaftaran;
use App\Models\User;
use App\Models\TahunAjaran;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $totalSiswa = Siswa::count();
        $totalPendaftar = Pendaftaran::count();
        $totalAdmin = User::count();
        
        $tahunAjaranAktif = TahunAjaran::where('is_active', true)->first();

        // Ambil aktivitas pendaftar terbaru
        $recentPendaftar = Pendaftaran::orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($item) {
                return [
                    'act' => 'Pendaftar Baru',
                    'by' => $item->nama_lengkap,
                    'date' => $item->created_at->diffForHumans(),
                    'created_at_raw' => $item->created_at,
                    'status' => 'Pendaftar',
                    'statusColor' => 'bg-blue-50 text-blue-500 border-blue-100',
                ];
            });

        // Ambil aktivitas siswa terbaru (migrasi terbaru)
        $recentSiswa = Siswa::orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($item) {
                return [
                    'act' => 'Siswa Baru',
                    'by' => $item->nama_lengkap,
                    'date' => $item->created_at->diffForHumans(),
                    'created_at_raw' => $item->created_at,
                    'status' => 'Siswa',
                    'statusColor' => 'bg-emerald-50 text-emerald-500 border-emerald-100',
                ];
            });

        // Gabungkan dan urutkan berdasarkan waktu
        $recentActivities = $recentPendaftar->concat($recentSiswa)
            ->sortByDesc('created_at_raw')
            ->take(5)
            ->values();

        // hapus created_at_raw dari final output
        $recentActivities = $recentActivities->map(function ($item) {
            unset($item['created_at_raw']);
            return $item;
        });

        return response()->json([
            'stats' => [
                'total_siswa' => $totalSiswa,
                'total_pendaftar' => $totalPendaftar,
                'total_admin' => $totalAdmin,
                'tahun_ajaran' => $tahunAjaranAktif ? $tahunAjaranAktif->tahun : 'Belum diset',
            ],
            'recent_activities' => $recentActivities
        ]);
    }
}
