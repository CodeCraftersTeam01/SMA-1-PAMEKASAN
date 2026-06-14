<?php

namespace App\Http\Controllers;

use App\Models\Pendaftaran;
use App\Models\Siswa;
use App\Models\TahunAjaran;
use App\Services\NisGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PendaftaranController extends Controller
{
    // READ semua data
    public function index()
    {
        $this->autoCheckAndUpdateTahunAjaran();

        $data = Pendaftaran::all();
        if ($data->count() > 0) {
            return response()->json($data);
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
        $this->autoCheckAndUpdateTahunAjaran();

        $no_pendaftaran = $request->input('no_pendaftaran');
        if (empty($no_pendaftaran)) {
            do {
                $dateStr = date('Ymd');
                $randomStr = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
                $no_pendaftaran = "REG-{$dateStr}-{$randomStr}";
            } while (Pendaftaran::where('no_pendaftaran', $no_pendaftaran)->exists());
            
            $request->merge(['no_pendaftaran' => $no_pendaftaran]);
        }

        if (empty($request->input('status'))) {
            $request->merge(['status' => 'pending']);
        }

        $validator = Validator::make($request->all(), [
            'no_pendaftaran' => 'required|unique:pendaftarans',
            'nisn' => 'required|unique:pendaftarans',
            'nama_lengkap' => 'required',
            'jenis_kelamin' => 'nullable|in:L,P',
            'tempat_lahir' => 'nullable|string|max:100',
            'tanggal_lahir' => 'nullable|date',
            'nik' => 'nullable|string|max:20',
            'agama' => 'nullable|string|max:50',
            'asal_sekolah' => 'required',
            'kecamatan' => 'nullable|string|max:100',
            'alamat' => 'required',
            'email' => 'nullable|email|max:100',
            'nomor_hp' => 'nullable|string|max:20',
            'status' => 'nullable|in:pending,diterima,ditolak',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        $data = Pendaftaran::create($request->all());

        try {
            $this->syncSiswaStatus($data);
        } catch (\Throwable $th) {
            $data->delete();
            return response()->json([
                'message' => 'Pendaftaran berhasil dibuat tetapi gagal membuat data siswa: ' . $th->getMessage()
            ], 500);
        }

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
        $this->autoCheckAndUpdateTahunAjaran();

        $data = Pendaftaran::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'no_pendaftaran' => 'sometimes|required|unique:pendaftarans,no_pendaftaran,' . $id,
            'nisn' => 'sometimes|required|unique:pendaftarans,nisn,' . $id,
            'nama_lengkap' => 'sometimes|required',
            'jenis_kelamin' => 'nullable|in:L,P',
            'tempat_lahir' => 'nullable|string|max:100',
            'tanggal_lahir' => 'nullable|date',
            'nik' => 'nullable|string|max:20',
            'agama' => 'nullable|string|max:50',
            'asal_sekolah' => 'sometimes|required',
            'kecamatan' => 'nullable|string|max:100',
            'alamat' => 'sometimes|required',
            'email' => 'nullable|email|max:100',
            'nomor_hp' => 'nullable|string|max:20',
            'status' => 'sometimes|required|in:pending,diterima,ditolak',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        $data->update($request->all());

        try {
            $this->syncSiswaStatus($data);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'Pendaftaran berhasil diperbarui tetapi gagal menyinkronkan data siswa: ' . $th->getMessage()
            ], 500);
        }

        return response()->json([
            'message' => 'Data berhasil diupdate',
            'data' => $data
        ]);
    }

    // DELETE data
    public function destroy($id)
    {
        Siswa::where('pendaftar_id', $id)->delete();

        Pendaftaran::destroy($id);

        return response()->json([
            'message' => 'Data berhasil dihapus'
        ]);
    }

    // BULK DELETE
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:pendaftarans,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        Siswa::whereIn('pendaftar_id', $request->ids)->delete();
        $count = Pendaftaran::whereIn('id', $request->ids)->delete();
        return response()->json(['message' => "{$count} data pendaftar berhasil dihapus"]);
    }

    // BULK UPDATE
    public function bulkUpdate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:pendaftarans,id',
            'data' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        $allowedFields = [
            'no_pendaftaran', 'nisn', 'nama_lengkap', 'jenis_kelamin',
            'tempat_lahir', 'tanggal_lahir', 'nik', 'agama',
            'asal_sekolah', 'kecamatan', 'status', 'alamat',
            'email', 'nomor_hp', 'jalur',
        ];
        $updateData = array_intersect_key($request->data, array_flip($allowedFields));

        if (empty($updateData)) {
            return response()->json(['message' => 'Tidak ada field yang valid untuk diupdate'], 422);
        }

        $count = Pendaftaran::whereIn('id', $request->ids)->update($updateData);

        // Sync siswa status for each updated record
        if (isset($updateData['status'])) {
            $records = Pendaftaran::whereIn('id', $request->ids)->get();
            foreach ($records as $record) {
                try { $this->syncSiswaStatus($record); } catch (\Throwable $e) {}
            }
        }

        return response()->json(['message' => "{$count} data pendaftar berhasil diperbarui"]);
    }

    // BULK UPDATE PER-USER
    public function bulkUpdatePerUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'updates' => 'required|array',
            'updates.*.id' => 'required|integer|exists:pendaftarans,id',
            'updates.*.data' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        $allowedFields = [
            'no_pendaftaran', 'nisn', 'nama_lengkap', 'jenis_kelamin',
            'tempat_lahir', 'tanggal_lahir', 'nik', 'agama',
            'asal_sekolah', 'kecamatan', 'status', 'alamat',
            'email', 'nomor_hp', 'jalur',
        ];

        $count = 0;
        foreach ($request->updates as $update) {
            $updateData = array_intersect_key($update['data'], array_flip($allowedFields));
            if (empty($updateData)) continue;

            Pendaftaran::where('id', $update['id'])->update($updateData);

            if (isset($updateData['status'])) {
                $record = Pendaftaran::find($update['id']);
                if ($record) {
                    try { $this->syncSiswaStatus($record); } catch (\Throwable $e) {}
                }
            }

            $count++;
        }

        return response()->json(['message' => "{$count} data pendaftar berhasil diperbarui"]);
    }

    // IMPORT data (CSV & Excel)
    public function import(Request $request)
    {
        $this->autoCheckAndUpdateTahunAjaran();

        $validator = Validator::make($request->all(), [
            'file' => 'required|mimetypes:text/csv,text/plain,application/csv,' .
                      'text/comma-separated-values,text/x-comma-separated-values,' .
                      'text/tab-separated-values,application/vnd.ms-excel,' .
                      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,' .
                      'application/octet-stream,application/zip'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        $file    = $request->file('file');
        $ext     = strtolower($file->getClientOriginalExtension());

        if (!in_array($ext, ['csv', 'xlsx'])) {
            return response()->json([
                'message' => 'File harus berformat .csv atau .xlsx'
            ], 422);
        }

        $successCount = 0;

        try {
            // Ambil baris data sesuai tipe file
            $rows = ($ext === 'xlsx')
                ? $this->parseXlsx($file->getPathname())
                : $this->parseCsv($file->getPathname());

            foreach ($rows as $index => $row) {
                if ($index === 0) continue; // Skip header

                $nisn  = $row[0] ?? null;
                $nama  = $row[1] ?? null;

                if (empty($nisn) || empty($nama)) continue;

                $dateStr      = date('Ymd');
                $randomStr    = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
                $no_pendaftaran = "REG-{$dateStr}-{$randomStr}";

                Pendaftaran::create([
                    'no_pendaftaran' => $no_pendaftaran,
                    'nisn'           => $nisn,
                    'nama_lengkap'   => $nama,
                    'asal_sekolah'   => $row[2] ?? '-',
                    'alamat'         => $row[3] ?? '-',
                    'jalur'          => $row[4] ?? 'zonasi',
                    'status'         => 'pending',
                ]);

                $successCount++;
            }

            return response()->json(['message' => "$successCount data berhasil diimport."]);

        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat import: ' . $th->getMessage()
            ], 500);
        }
    }

    // Parse CSV (support separator koma atau titik koma)
    private function parseCsv(string $path): array
    {
        $rows   = [];
        $handle = fopen($path, 'r');

        // Deteksi BOM UTF-8
        $bom = fread($handle, 3);
        if ($bom !== "\xEF\xBB\xBF") rewind($handle);

        // Baca baris pertama untuk deteksi separator
        $firstLine = fgets($handle);
        rewind($handle);
        if ($bom !== "\xEF\xBB\xBF") rewind($handle);
        else fread($handle, 3); // skip BOM lagi

        // Jika ada "sep=;" di baris pertama, skip baris itu
        $trimmed = trim($firstLine);
        $sep = ',';
        if (str_starts_with($trimmed, 'sep=')) {
            $sep = trim(str_replace('sep=', '', $trimmed));
            fgets($handle); // skip baris sep=
        } elseif (substr_count($firstLine, ';') > substr_count($firstLine, ',')) {
            $sep = ';';
        }

        while (($row = fgetcsv($handle, 0, $sep)) !== false) {
            $rows[] = $row;
        }

        fclose($handle);
        return $rows;
    }

    // Parse XLSX secara native menggunakan ZipArchive + SimpleXML (tanpa library tambahan)
    private function parseXlsx(string $path): array
    {
        $zip = new \ZipArchive();
        if ($zip->open($path) !== true) {
            throw new \Exception('Gagal membuka file XLSX.');
        }

        // Baca shared strings
        $sharedStrings = [];
        $ssXml = $zip->getFromName('xl/sharedStrings.xml');
        if ($ssXml) {
            $ss = simplexml_load_string($ssXml);
            foreach ($ss->si as $si) {
                if (isset($si->t)) {
                    $sharedStrings[] = (string) $si->t;
                } elseif (isset($si->r)) {
                    $str = '';
                    foreach ($si->r as $r) $str .= (string) $r->t;
                    $sharedStrings[] = $str;
                } else {
                    $sharedStrings[] = '';
                }
            }
        }

        // Baca sheet pertama
        $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
        $zip->close();

        if (!$sheetXml) throw new \Exception('Sheet tidak ditemukan di file XLSX.');

        $xml  = simplexml_load_string($sheetXml);
        $rows = [];

        foreach ($xml->sheetData->row as $row) {
            $rowData = [];
            $lastCol = -1;

            foreach ($row->c as $cell) {
                // Hitung index kolom dari referensi seperti A1, B2, dsb
                preg_match('/([A-Z]+)(\d+)/', (string) $cell['r'], $m);
                $colIndex = 0;
                foreach (str_split($m[1]) as $ch) {
                    $colIndex = $colIndex * 26 + (ord($ch) - ord('A') + 1);
                }
                $colIndex--; // 0-based

                // Isi kolom yang terlewat (sparse cells)
                while (++$lastCol < $colIndex) $rowData[] = '';

                $type  = (string) $cell['t'];
                $value = isset($cell->v) ? (string) $cell->v : '';

                if ($type === 's') {
                    $value = $sharedStrings[(int) $value] ?? '';
                }

                $rowData[] = $value;
                $lastCol   = $colIndex;
            }

            $rows[] = $rowData;
        }

        return $rows;
    }

    /**
     * Sync data pendaftaran ke data siswa.
     * Jika status 'diterima', buat record siswa jika belum ada.
     * Jika status selain 'diterima', hapus record siswa jika ada.
     */
    private function syncSiswaStatus(Pendaftaran $pendaftaran)
    {
        if ($pendaftaran->status === 'diterima') {
            // Check if student already exists for this registration
            $sudahAda = Siswa::where('pendaftar_id', $pendaftaran->id)->exists();
            if (!$sudahAda) {
                // Get active/latest school year
                $tahunAjaranAktif = TahunAjaran::where('is_active', true)->first() 
                    ?? TahunAjaran::first();
                if (!$tahunAjaranAktif) {
                    throw new \Exception('Data Tahun Ajaran belum diset di sistem.');
                }
                
                $tahunMasuk = (int) substr($tahunAjaranAktif->tahun, 0, 4);

                // Generate NIS
                $nisGenerator = new NisGeneratorService();
                $nis = $nisGenerator->generateNis($tahunMasuk);

                // Create Siswa record
                Siswa::create([
                    'pendaftar_id'    => $pendaftaran->id,
                    'tahun_ajaran_id' => $tahunAjaranAktif->id,
                    'nis'             => $nis,
                    'nama_lengkap'    => $pendaftaran->nama_lengkap,
                    'jenis_kelamin'   => $pendaftaran->jenis_kelamin,
                    'tempat_lahir'    => $pendaftaran->tempat_lahir,
                    'tanggal_lahir'   => $pendaftaran->tanggal_lahir,
                    'agama'           => $pendaftaran->agama,
                    'alamat'          => $pendaftaran->alamat,
                    'nomor_hp'        => $pendaftaran->nomor_hp,
                    'email'           => $pendaftaran->email,
                    'is_active'       => true,
                    'tahun_masuk'     => $tahunMasuk,
                ]);
            }
        } else {
            // Delete student record if status is not 'diterima'
            Siswa::where('pendaftar_id', $pendaftaran->id)->delete();
        }
    }

    /**
     * Auto check and update active school year based on current calendar year.
     * For example, if current year is 2026 and active school year is 2025/2026,
     * it will automatically create and activate 2026/2027.
     */
    private function autoCheckAndUpdateTahunAjaran()
    {
        $currentYear = (int) date('Y');
        
        $activeTahunAjaran = TahunAjaran::where('is_active', true)->first();
        
        if ($activeTahunAjaran) {
            $startYear = (int) substr($activeTahunAjaran->tahun, 0, 4);
            if ($currentYear > $startYear) {
                $newTahunStr = "{$currentYear}/" . ($currentYear + 1);
                
                // Find or create new school year
                $newTahunAjaran = TahunAjaran::where('tahun', $newTahunStr)->first();
                if (!$newTahunAjaran) {
                    $newTahunAjaran = TahunAjaran::create([
                        'tahun' => $newTahunStr,
                        'is_active' => true
                    ]);
                }
                
                // Ensure only this new school year is active
                TahunAjaran::where('id', '!=', $newTahunAjaran->id)->update(['is_active' => false]);
                $newTahunAjaran->update(['is_active' => true]);
            }
        } else {
            // If no active school year exists, find latest or create new
            $latestTahunAjaran = TahunAjaran::orderBy('tahun', 'desc')->first();
            if ($latestTahunAjaran) {
                $latestTahunAjaran->update(['is_active' => true]);
            } else {
                $newTahunStr = "{$currentYear}/" . ($currentYear + 1);
                TahunAjaran::create([
                    'tahun' => $newTahunStr,
                    'is_active' => true
                ]);
            }
        }
    }
}