<?php

namespace App\Http\Controllers;

use App\Models\Pendaftaran;
use Illuminate\Http\Request;

class PendaftaranController extends Controller
{
    // READ semua data
    public function index()
    {
        if (Pendaftaran::all()->count() > 0) {
            return response()->json(Pendaftaran::all());
        }
        else {
            return response()->json([
                'message' => 'Data pendaftaran tidak ditemukan'
            ], 404);
        }
    }

    // CREATE data pendaftaran
    public function store(Request $request)
    {
        $request->validate([
            'no_pendaftaran' => 'required|unique:pendaftarans',
            'nisn' => 'required|unique:pendaftarans',
            'nama_lengkap' => 'required',
            'asal_sekolah' => 'required',
            'alamat' => 'required'
        ]);

        $data = Pendaftaran::create($request->all());

        return response()->json([
            'message' => 'Pendaftaran berhasil dibuat',
            'data' => $data
        ]);
    }

    // READ satu data
    public function show($id)
    {
        $data = Pendaftaran::findOrFail($id);

        return response()->json($data);
    }

    // UPDATE data
    public function update(Request $request, $id)
    {
        $data = Pendaftaran::findOrFail($id);

        $data->update($request->all());

        return response()->json([
            'message' => 'Data berhasil diupdate',
            'data' => $data
        ]);
    }

    // DELETE data
    public function destroy($id)
    {
        Pendaftaran::destroy($id);

        return response()->json([
            'message' => 'Data berhasil dihapus'
        ]);
    }

    // IMPORT data (CSV)
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimetypes:text/csv,text/plain,application/csv,text/comma-separated-values,text/x-comma-separated-values,text/tab-separated-values,application/vnd.ms-excel'
        ]);

        $file = $request->file('file');
        
        // Secondary strict extension check to prevent execution of malicious TXT files
        if ($file->getClientOriginalExtension() !== 'csv') {
             return response()->json([
                'message' => 'The file must be a CSV file with a .csv extension.'
             ], 422);
        }

        $successCount = 0;

        try {
            // Check if Maatwebsite Excel is installed
            if (class_exists(\Maatwebsite\Excel\Facades\Excel::class)) {
                $data = \Maatwebsite\Excel\Facades\Excel::toArray([], $file);
                if (!empty($data) && !empty($data[0])) {
                    $rows = $data[0];
                    foreach ($rows as $index => $row) {
                        if ($index === 0) continue; // Skip header

                        if (empty($row[0]) || empty($row[1])) continue;

                        $dateStr = date('Ymd');
                        $randomStr = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
                        $no_pendaftaran = "REG-{$dateStr}-{$randomStr}";

                        Pendaftaran::create([
                            'no_pendaftaran' => $no_pendaftaran,
                            'nisn' => $row[0],
                            'nama_lengkap' => $row[1],
                            'asal_sekolah' => $row[2] ?? '-',
                            'alamat' => $row[3] ?? '-',
                            'status' => 'pending'
                        ]);
                        $successCount++;
                    }
                    return response()->json(['message' => "$successCount data berhasil diimport."]);
                }
            }
            
            // Fallback for native CSV functionality
            if ($file->getClientOriginalExtension() === 'csv') {
                $handle = fopen($file->getPathname(), "r");
                $header = true;
                
                while ($row = fgetcsv($handle, 1000, ",")) {
                    if ($header) {
                        $header = false;
                        continue;
                    }
                    
                    if (empty($row[0]) || empty($row[1])) continue;

                    $dateStr = date('Ymd');
                    $randomStr = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
                    $no_pendaftaran = "REG-{$dateStr}-{$randomStr}";

                    Pendaftaran::create([
                        'no_pendaftaran' => $no_pendaftaran,
                        'nisn' => $row[0],
                        'nama_lengkap' => $row[1],
                        'asal_sekolah' => $row[2] ?? '-',
                        'alamat' => $row[3] ?? '-',
                        'status' => 'pending'
                    ]);
                    $successCount++;
                }
                fclose($handle);
                return response()->json(['message' => "$successCount data berhasil diimport."]);
            }

            return response()->json([
                'message' => 'Format file tidak didukung.'
            ], 400);

        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat import: ' . $th->getMessage()
            ], 500);
        }
    }
}