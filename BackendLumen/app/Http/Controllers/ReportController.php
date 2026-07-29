<?php

namespace App\Http\Controllers;

use App\Models\Pendaftaran;
use App\Models\Siswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class ReportController extends Controller
{
    /**
     * Laporan Pendaftaran
     */
    public function pendaftaranReport(Request $request)
    {
        $query = Pendaftaran::query();

        // Filter Rentang Waktu
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [$request->start_date . ' 00:00:00', $request->end_date . ' 23:59:59']);
        }

        $data = $query->get();

        $format = $request->query('format', 'json');

        if ($format === 'csv') {
            return $this->exportCsv('laporan_pendaftaran_' . date('Ymd_His'), [
                'No Pendaftaran', 'NISN', 'Nama Lengkap', 'Asal Sekolah', 'Jalur', 'Status', 'Tanggal Daftar'
            ], $data->map(function ($item) {
                return [
                    $item->no_pendaftaran,
                    $item->nisn,
                    $item->nama_lengkap,
                    $item->asal_sekolah,
                    $item->jalur,
                    $item->status,
                    $item->created_at,
                ];
            })->toArray());
        }

        if ($format === 'xlsx' || $format === 'excel') {
            return $this->exportExcel('laporan_pendaftaran_' . date('Ymd_His'), [
                'No Pendaftaran', 'NISN', 'Nama Lengkap', 'Asal Sekolah', 'Jalur', 'Status', 'Tanggal Daftar'
            ], $data->map(function ($item) {
                return [
                    $item->no_pendaftaran,
                    $item->nisn,
                    $item->nama_lengkap,
                    $item->asal_sekolah,
                    $item->jalur,
                    $item->status,
                    $item->created_at,
                ];
            })->toArray());
        }

        return response()->json($data);
    }

    /**
     * Laporan Siswa
     */
    public function siswaReport(Request $request)
    {
        $query = Siswa::with(['tahunAjaran']);

        // Filter Rentang Waktu
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [$request->start_date . ' 00:00:00', $request->end_date . ' 23:59:59']);
        }

        $data = $query->get();

        $format = $request->query('format', 'json');

        if ($format === 'csv') {
            return $this->exportCsv('laporan_siswa_' . date('Ymd_His'), [
                'NIS', 'Nama Lengkap', 'Tahun Masuk', 'Tahun Ajaran', 'Status Aktif', 'Tanggal Data Dibuat'
            ], $data->map(function ($item) {
                return [
                    $item->nis,
                    $item->nama_lengkap,
                    $item->tahun_masuk,
                    $item->tahunAjaran->tahun ?? '-',
                    $item->is_active ? 'Aktif' : 'Tidak Aktif',
                    $item->created_at,
                ];
            })->toArray());
        }

        if ($format === 'xlsx' || $format === 'excel') {
            return $this->exportExcel('laporan_siswa_' . date('Ymd_His'), [
                'NIS', 'Nama Lengkap', 'Tahun Masuk', 'Tahun Ajaran', 'Status Aktif', 'Tanggal Data Dibuat'
            ], $data->map(function ($item) {
                return [
                    $item->nis,
                    $item->nama_lengkap,
                    $item->tahun_masuk,
                    $item->tahunAjaran->tahun ?? '-',
                    $item->is_active ? 'Aktif' : 'Tidak Aktif',
                    $item->created_at,
                ];
            })->toArray());
        }

        return response()->json($data);
    }

    /**
     * Helper Export CSV
     */
    private function exportCsv($filename, $header, $data)
    {
        $callback = function () use ($header, $data) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $header);

            foreach ($data as $row) {
                fputcsv($file, $row);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename={$filename}.csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ]);
    }

    /**
     * Helper Export Excel (HTML Trick)
     */
    private function exportExcel($filename, $header, $data)
    {
        $html = '<table border="1">';
        $html .= '<thead><tr>';
        foreach ($header as $h) {
            $html .= '<th style="background-color: #f2f2f2;">' . htmlspecialchars($h) . '</th>';
        }
        $html .= '</tr></thead>';
        $html .= '<tbody>';
        foreach ($data as $row) {
            $html .= '<tr>';
            foreach ($row as $value) {
                $html .= '<td>' . htmlspecialchars($value) . '</td>';
            }
            $html .= '</tr>';
        }
        $html .= '</tbody></table>';

        return response($html, 200, [
            "Content-type"        => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition" => "attachment; filename={$filename}.xlsx",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ]);
    }
}
