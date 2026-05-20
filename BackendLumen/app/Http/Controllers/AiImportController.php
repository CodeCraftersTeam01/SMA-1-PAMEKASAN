<?php

namespace App\Http\Controllers;

use App\Services\OpenRouterService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AiImportController extends Controller
{
    protected array $systemColumns = [
        'id', 'created_at', 'updated_at', 'deleted_at',
        'remember_token', 'email_verified_at',
    ];

    protected array $columnDescriptions = [
        'pendaftarans' => [
            'no_pendaftaran' => 'Nomor pendaftaran unik, biasanya auto-generate, abaikan jika tidak ada di Excel',
            'nisn'           => 'Nomor Induk Siswa Nasional (10 digit), kolom utama identitas siswa',
            'nama_lengkap'   => 'Nama lengkap siswa, bisa berupa "Nama", "Nama Siswa", "Nama Peserta Didik"',
            'asal_sekolah'   => 'Nama sekolah asal (SMP/MTs), bisa berupa "Sekolah Asal", "Asal Sekolah", "SMP Asal"',
            'alamat'         => 'Alamat tempat tinggal siswa, bisa berupa "Alamat", "Domisili", "Alamat Rumah"',
            'jalur'          => 'Jalur pendaftaran: zonasi/afirmasi/prestasi/perpindahan_tugas',
            'status'         => 'Status pendaftaran: pending/diterima/ditolak, biasanya tidak ada di Excel',
        ],
        'siswas' => [
            'nis'             => 'Nomor Induk Siswa atau NIPD, identitas unik di sekolah',
            'nama_lengkap'    => 'Nama lengkap siswa',
            'kelas'           => 'Kelas atau Rombel siswa, misal X.G, XI IPS 1, 10, 11, 12. Sangat penting untuk menentukan tahun masuk.',
            'is_active'       => 'Status aktif (1) atau alumni (0)',
        ],
    ];

    // ────────────────────────────────────────────────────────────────────────
    // ANALYZE
    // POST /api/ai-import/analyze
    // ────────────────────────────────────────────────────────────────────────
    public function analyze(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file'         => 'required|file',
            'target_table' => 'required|string|alpha_dash',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        $targetTable = $request->input('target_table');

        $tableExists = DB::select(
            "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
            [$targetTable]
        );
        if (!($tableExists[0]->cnt ?? 0)) {
            return response()->json(['message' => "Tabel '{$targetTable}' tidak ditemukan."], 422);
        }

        $file = $request->file('file');
        $ext  = strtolower($file->getClientOriginalExtension());

        if (!in_array($ext, ['csv', 'xlsx', 'xls'])) {
            return response()->json(['message' => 'Format file harus .csv, .xlsx, atau .xls'], 422);
        }

        try {
            $parseResult = ($ext === 'csv')
                ? $this->parseCsv($file->getPathname())
                : $this->parseXlsx($file->getPathname());

            $allRows = $parseResult['rows'] ?? $parseResult;
            $detectedHeaderRow = $parseResult['header_row_index'] ?? null;

            if (empty($allRows)) {
                return response()->json(['message' => 'File kosong atau tidak bisa dibaca.'], 422);
            }

            $sampleRows = array_slice($allRows, 0, 15); // Ambil 15 baris agar AI lebih paham konteks

            $dbColumnsRaw = DB::select(
                "SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, CHARACTER_MAXIMUM_LENGTH
                 FROM INFORMATION_SCHEMA.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
                 ORDER BY ORDINAL_POSITION",
                [$targetTable]
            );

            $descriptions = $this->columnDescriptions[$targetTable] ?? [];

            $dbSchema = [];
            foreach ($dbColumnsRaw as $col) {
                $colName = $col->COLUMN_NAME;
                if (in_array($colName, $this->systemColumns)) continue;
                if ($targetTable === 'siswas' && in_array($colName, ['tahun_ajaran_id', 'tahun_masuk', 'pendaftar_id'])) continue;

                $isRequired = ($col->IS_NULLABLE === 'NO' && $col->COLUMN_DEFAULT === null);
                if ($targetTable === 'siswas' && $colName === 'is_active') $isRequired = false;
                
                $dbSchema[] = [
                    'column'      => $colName,
                    'type'        => $col->DATA_TYPE . ($col->CHARACTER_MAXIMUM_LENGTH ? "({$col->CHARACTER_MAXIMUM_LENGTH})" : ''),
                    'required'    => $isRequired,
                    'description' => $descriptions[$colName] ?? "Kolom {$colName} di tabel {$targetTable}",
                ];
            }

            if ($targetTable === 'siswas') {
                $dbSchema[] = [
                    'column'      => 'kelas',
                    'type'        => 'varchar(50)',
                    'required'    => true,
                    'description' => $descriptions['kelas'] ?? 'Kelas/Rombel (X, XI, XII)',
                ];
            }

            $dbColumnNames = array_column($dbSchema, 'column');

            $openRouter = new OpenRouterService();
            $aiResult   = $openRouter->analyzeFile($sampleRows, $dbSchema, $targetTable, $detectedHeaderRow);

            $headerRow  = $aiResult['header_row'];
            $aiMapping  = $aiResult['mapping'];

            if (!isset($allRows[$headerRow])) {
                $headerRow = 0;
            }

            // Mendukung header 2 tingkat (seperti export Dapodik)
            $rawHeaders = $allRows[$headerRow];
            $prevHeaders = ($headerRow > 0) ? $allRows[$headerRow - 1] : [];
            
            $headers = [];
            $headerCounts = [];
            $seenH2 = [];
            $currentTop = '';

            $maxCols = max(count($rawHeaders), count($prevHeaders));
            for ($idx = 0; $idx < $maxCols; $idx++) {
                $h1Raw = trim((string)($prevHeaders[$idx] ?? ''));
                $h2 = trim((string)($rawHeaders[$idx] ?? ''));

                if ($h1Raw !== '') {
                    $currentTop = $h1Raw;
                } elseif ($currentTop !== '') {
                    if (!preg_match('/nama|tahun|lahir|pendidikan|pekerjaan|penghasilan|nik|kebutuhan|kps|pkh|kip|kks/i', $h2)) {
                        $currentTop = '';
                    }
                }

                if ($h2 === '' && $h1Raw === '') {
                    continue;
                }

                $finalName = $h2;
                $shouldPrefix = false;
                
                if ($h2 === '') {
                    $finalName = $h1Raw;
                } else {
                    if ($h1Raw !== '') {
                        $shouldPrefix = true;
                    } elseif (preg_match('/ayah|ibu|wali|orang tua/i', $currentTop)) {
                        $shouldPrefix = true;
                    } elseif (in_array($h2, $seenH2)) {
                        $shouldPrefix = true;
                    }

                    if ($shouldPrefix && $currentTop !== '' && $currentTop !== $h2) {
                        $finalName = $currentTop . ' - ' . $h2;
                    }

                    $seenH2[] = $h2;
                }

                if (isset($headerCounts[$finalName])) {
                    $headerCounts[$finalName]++;
                    $headers[$idx] = $finalName . ' (' . $headerCounts[$finalName] . ')';
                } else {
                    $headerCounts[$finalName] = 1;
                    $headers[$idx] = $finalName;
                }
            }

            $cleanMapping = [];
            foreach ($headers as $idx => $h) {
                $mappedTo = $aiMapping[$h] ?? null;

                // Jika AI gagal menemukan (karena nama kolom beda jauh atau 2-level header), gunakan smart auto-mapping
                if (!$mappedTo) {
                    $lowerH = strtolower($h);
                    $isParentCol = preg_match('/ayah|ibu|wali|periodik|kesejahteraan/i', $lowerH);
                    
                    if ($targetTable === 'siswas') {
                        if (!$isParentCol && preg_match('/^(nama|nama lengkap|nama siswa)$/i', trim(explode('-', $h)[1] ?? $h))) {
                            $mappedTo = 'nama_lengkap';
                        } elseif (!$isParentCol && preg_match('/^(nisn|no nisn)$/i', $lowerH)) {
                            $mappedTo = 'nisn';
                        } elseif (!$isParentCol && preg_match('/^(nis|nipd|no induk)$/i', $lowerH)) {
                            $mappedTo = 'nis';
                        } elseif (!$isParentCol && preg_match('/kelas|rombel/i', $lowerH)) {
                            $mappedTo = 'kelas';
                        }
                    } elseif ($targetTable === 'pendaftarans') {
                        if (!$isParentCol && preg_match('/^(nama|nama lengkap|nama siswa)$/i', trim(explode('-', $h)[1] ?? $h))) {
                            $mappedTo = 'nama_lengkap';
                        } elseif (!$isParentCol && preg_match('/^(nisn|no nisn)$/i', $lowerH)) {
                            $mappedTo = 'nisn';
                        } elseif (preg_match('/asal sekolah|smp/i', $lowerH)) {
                            $mappedTo = 'asal_sekolah';
                        } elseif (preg_match('/alamat/i', $lowerH)) {
                            $mappedTo = 'alamat';
                        } elseif (preg_match('/no.*hp|no.*telepon|telepon|hp/i', $lowerH)) {
                            $mappedTo = 'no_hp';
                        }
                    }
                }

                if ($mappedTo && in_array($mappedTo, $dbColumnNames)) {
                    $cleanMapping[$h] = $mappedTo;
                } else {
                    $cleanMapping[$h] = null;
                }
            }

            $dataRows = array_slice($allRows, $headerRow + 1);

            $dataRows = array_values(array_filter($dataRows, function ($row) {
                return count(array_filter($row, fn($c) => trim((string)$c) !== '')) > 0;
            }));

            $previewRows = [];
            foreach (array_slice($dataRows, 0, 5) as $row) {
                $preview = [];
                foreach ($headers as $idx => $h) {
                    $preview[$h] = $row[$idx] ?? '';
                }
                $previewRows[] = $preview;
            }

            $firstDataRow = $dataRows[0] ?? [];
            $excelColumnsWithSample = [];
            foreach ($headers as $idx => $h) {
                $sample = trim((string)($firstDataRow[$idx] ?? ''));
                if (mb_strlen($sample) > 30) {
                    $sample = mb_substr($sample, 0, 27) . '...';
                }
                $excelColumnsWithSample[] = [
                    'header' => $h,
                    'sample' => $sample
                ];
            }

            return response()->json([
                'success'        => true,
                'header_row'     => $headerRow,
                'header_detected_by_border' => $detectedHeaderRow !== null,
                'excel_columns'  => array_values($headers),
                'excel_columns_with_sample' => $excelColumnsWithSample,
                'db_columns'     => $dbColumnNames,
                'db_schema'      => $dbSchema,
                'ai_mapping'     => $cleanMapping,
                'preview_rows'   => $previewRows,
                'total_rows'     => count($dataRows),
                'target_table'   => $targetTable,
            ]);

        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat menganalisis: ' . $th->getMessage(),
            ], 500);
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // EXECUTE
    // POST /api/ai-import/execute
    // ────────────────────────────────────────────────────────────────────────
    public function execute(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file'         => 'required|file',
            'target_table' => 'required|string|alpha_dash',
            'mapping'      => 'required|string',
            'header_row'   => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        $targetTable = $request->input('target_table');
        $headerRow   = (int) $request->input('header_row');
        $mapping     = json_decode($request->input('mapping'), true);

        if (!is_array($mapping)) {
            return response()->json(['message' => 'Format mapping tidak valid.'], 422);
        }

        $activeMapping = array_filter($mapping, fn($v) => $v !== null && $v !== '');

        if (empty($activeMapping)) {
            return response()->json(['message' => 'Tidak ada kolom yang berhasil dipetakan.'], 422);
        }

        $tableExists = DB::select(
            "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
            [$targetTable]
        );
        if (!($tableExists[0]->cnt ?? 0)) {
            return response()->json(['message' => "Tabel '{$targetTable}' tidak ditemukan."], 422);
        }

        $file = $request->file('file');
        $ext  = strtolower($file->getClientOriginalExtension());

        try {
            $parseResult = ($ext === 'csv')
                ? $this->parseCsv($file->getPathname())
                : $this->parseXlsx($file->getPathname());
            $allRows = $parseResult['rows'] ?? $parseResult;

            if (!isset($allRows[$headerRow])) {
                return response()->json(['message' => 'Header row tidak valid.'], 422);
            }

            // Mendukung header 2 tingkat (seperti export Dapodik)
            $rawHeaders = $allRows[$headerRow];
            $prevHeaders = ($headerRow > 0) ? $allRows[$headerRow - 1] : [];
            
            $headers = [];
            $headerCounts = [];
            $seenH2 = [];
            $currentTop = '';

            $maxCols = max(count($rawHeaders), count($prevHeaders));
            for ($idx = 0; $idx < $maxCols; $idx++) {
                $h1Raw = trim((string)($prevHeaders[$idx] ?? ''));
                $h2 = trim((string)($rawHeaders[$idx] ?? ''));

                if ($h1Raw !== '') {
                    $currentTop = $h1Raw;
                } elseif ($currentTop !== '') {
                    if (!preg_match('/nama|tahun|lahir|pendidikan|pekerjaan|penghasilan|nik|kebutuhan|kps|pkh|kip|kks/i', $h2)) {
                        $currentTop = '';
                    }
                }

                if ($h2 === '' && $h1Raw === '') {
                    continue;
                }

                $finalName = $h2;
                $shouldPrefix = false;
                
                if ($h2 === '') {
                    $finalName = $h1Raw;
                } else {
                    if ($h1Raw !== '') {
                        $shouldPrefix = true;
                    } elseif (preg_match('/ayah|ibu|wali|orang tua/i', $currentTop)) {
                        $shouldPrefix = true;
                    } elseif (in_array($h2, $seenH2)) {
                        $shouldPrefix = true;
                    }

                    if ($shouldPrefix && $currentTop !== '' && $currentTop !== $h2) {
                        $finalName = $currentTop . ' - ' . $h2;
                    }

                    $seenH2[] = $h2;
                }

                if (isset($headerCounts[$finalName])) {
                    $headerCounts[$finalName]++;
                    $headers[$idx] = $finalName . ' (' . $headerCounts[$finalName] . ')';
                } else {
                    $headerCounts[$finalName] = 1;
                    $headers[$idx] = $finalName;
                }
            }

            $dataRows = array_slice($allRows, $headerRow + 1);

            $successCount = 0;
            $failCount    = 0;
            $errors       = [];

            foreach ($dataRows as $rowIdx => $row) {
                $nonEmpty = array_filter($row, fn($c) => trim((string)$c) !== '');
                if (empty($nonEmpty)) continue;

                $data = [];
                foreach ($mapping as $dbCol => $mapData) {
                    if (!isset($mapData['type']) || !isset($mapData['value'])) continue;
                    
                    if ($mapData['type'] === 'fixed') {
                        // Jika fixed, gunakan nilai yang diberikan user untuk semua baris
                        $val = trim((string)$mapData['value']);
                        $data[$dbCol] = ($val === '') ? null : $val;
                    } else if ($mapData['type'] === 'column') {
                        // Jika column, ambil dari data excel
                        $excelCol = $mapData['value'];
                        $colIdx = array_search($excelCol, $headers);
                        if ($colIdx !== false) {
                            $val = isset($row[$colIdx]) ? trim((string)$row[$colIdx]) : null;
                            $data[$dbCol] = ($val === '') ? null : $val;
                        }
                    }
                }

                $now = date('Y-m-d H:i:s');
                $data['created_at'] = $now;
                $data['updated_at'] = $now;

                if ($targetTable === 'pendaftarans' && empty($data['no_pendaftaran'])) {
                    do {
                        $noPend = 'REG-' . date('Ymd') . '-' . str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
                    } while (DB::table('pendaftarans')->where('no_pendaftaran', $noPend)->exists());
                    $data['no_pendaftaran'] = $noPend;
                }

                if ($targetTable === 'pendaftarans' && !isset($data['status'])) {
                    $data['status'] = 'pending';
                }

                if ($targetTable === 'siswas') {
                    if (!isset($data['is_active'])) {
                        $data['is_active'] = 1;
                    }
                    
                    $kelas = $data['kelas'] ?? '';
                    unset($data['kelas']);
                    
                    $activeTa = DB::table('tahun_ajarans')->where('is_active', 1)->first();
                    $baseYear = (int)date('Y');
                    if ($activeTa && preg_match('/^(\d{4})/', $activeTa->tahun, $matches)) {
                        $baseYear = (int)$matches[1];
                    }
                    
                    $tahunMasuk = $baseYear;
                    $kelasUpper = strtoupper(trim($kelas));
                    if (str_starts_with($kelasUpper, 'XII') || str_starts_with($kelasUpper, '12')) {
                        $tahunMasuk = $baseYear - 2;
                    } elseif (str_starts_with($kelasUpper, 'XI') || str_starts_with($kelasUpper, '11')) {
                        $tahunMasuk = $baseYear - 1;
                    }
                    $data['tahun_masuk'] = $tahunMasuk;
                    
                    $entryTa = DB::table('tahun_ajarans')->where('tahun', 'LIKE', $tahunMasuk . '/%')->first();
                    if ($entryTa) {
                        $data['tahun_ajaran_id'] = $entryTa->id;
                    } elseif ($activeTa) {
                        $data['tahun_ajaran_id'] = $activeTa->id;
                    } else {
                        // Fallback jika tidak ada tahun ajaran sama sekali
                        $taId = DB::table('tahun_ajarans')->insertGetId([
                            'tahun' => $tahunMasuk . '/' . ($tahunMasuk + 1),
                            'is_active' => 0,
                            'created_at' => date('Y-m-d H:i:s'),
                            'updated_at' => date('Y-m-d H:i:s')
                        ]);
                        $data['tahun_ajaran_id'] = $taId;
                    }
                }

                try {
                    // Use Eloquent Models to trigger events (e.g., AkunSiswa creation for Siswa)
                    if ($targetTable === 'siswas') {
                        \App\Models\Siswa::create($data);
                    } elseif ($targetTable === 'pendaftarans') {
                        \App\Models\Pendaftaran::create($data);
                    } else {
                        DB::table($targetTable)->insert($data);
                    }
                    $successCount++;
                } catch (\Throwable $e) {
                    $failCount++;
                    $errors[] = 'Baris ' . ($rowIdx + $headerRow + 2) . ': ' . $e->getMessage();
                }
            }

            return response()->json([
                'success'       => true,
                'message'       => "{$successCount} data berhasil diimport, {$failCount} gagal.",
                'success_count' => $successCount,
                'fail_count'    => $failCount,
                'errors'        => array_slice($errors, 0, 10),
            ]);

        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat eksekusi: ' . $th->getMessage(),
            ], 500);
        }
    }

    // ── CSV Parser ────────────────────────────────────────────────────────────
    private function parseCsv(string $path): array
    {
        $rows   = [];
        $handle = fopen($path, 'r');

        $bom = fread($handle, 3);
        if ($bom !== "\xEF\xBB\xBF") rewind($handle);

        $firstLine = fgets($handle);
        rewind($handle);
        if ($bom !== "\xEF\xBB\xBF") rewind($handle);
        else fread($handle, 3);

        $trimmed = trim($firstLine);
        $sep = ',';
        if (str_starts_with($trimmed, 'sep=')) {
            $sep = trim(str_replace('sep=', '', $trimmed));
            fgets($handle);
        } elseif (substr_count($firstLine, ';') > substr_count($firstLine, ',')) {
            $sep = ';';
        }

        while (($row = fgetcsv($handle, 0, $sep)) !== false) {
            $rows[] = $row;
        }
        fclose($handle);
        return ['rows' => $rows, 'header_row_index' => null];
    }

    // ── XLSX Parser (With Border Detection) ───────────────────────────────────
    private function parseXlsx(string $path): array
    {
        $zip = new \ZipArchive();
        if ($zip->open($path) !== true) throw new \Exception('Gagal membuka file XLSX.');

        // 1. Ekstrak Strings
        $sharedStrings = [];
        $ssXml = $zip->getFromName('xl/sharedStrings.xml');
        if ($ssXml) {
            $ss = simplexml_load_string($ssXml);
            foreach ($ss->si as $si) {
                if (isset($si->t))      $sharedStrings[] = (string)$si->t;
                elseif (isset($si->r)) { $s = ''; foreach ($si->r as $r) $s .= (string)$r->t; $sharedStrings[] = $s; }
                else                   $sharedStrings[] = '';
            }
        }

        // 2. Ekstrak Styles (untuk deteksi border)
        $stylesXml = $zip->getFromName('xl/styles.xml');
        $borderStyles = []; // index -> bool (punya border)
        if ($stylesXml) {
            $styles = simplexml_load_string($stylesXml);
            $bordersMap = []; // borderId -> bool
            
            if (isset($styles->borders->border)) {
                $idx = 0;
                foreach ($styles->borders->border as $border) {
                    $hasBorder = false;
                    foreach (['left', 'right', 'top', 'bottom'] as $dir) {
                        if (isset($border->$dir) && isset($border->$dir['style']) && (string)$border->$dir['style'] !== 'none' && (string)$border->$dir['style'] !== '') {
                            $hasBorder = true;
                            break;
                        }
                    }
                    $bordersMap[$idx++] = $hasBorder;
                }
            }
            
            if (isset($styles->cellXfs->xf)) {
                $idx = 0;
                foreach ($styles->cellXfs->xf as $xf) {
                    $borderId = isset($xf['borderId']) ? (int)$xf['borderId'] : 0;
                    $borderStyles[$idx++] = $bordersMap[$borderId] ?? false;
                }
            }
        }

        // 3. Ekstrak Sheet & Data
        $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
        $zip->close();
        if (!$sheetXml) throw new \Exception('Sheet tidak ditemukan.');

        $xml  = simplexml_load_string($sheetXml);
        $rows = [];
        
        $headerRowIndex = null;
        $currentRowIdx = 0;

        foreach ($xml->sheetData->row as $row) {
            $rowData = [];
            $lastCol = -1;
            
            $borderedCellCount = 0;
            $nonEmptyCellCount = 0;

            foreach ($row->c as $cell) {
                preg_match('/([A-Z]+)(\d+)/', (string)$cell['r'], $m);
                $colIdx = 0;
                foreach (str_split($m[1]) as $ch) {
                    $colIdx = $colIdx * 26 + (ord($ch) - ord('A') + 1);
                }
                $colIdx--;
                while (++$lastCol < $colIdx) {
                    $rowData[] = '';
                }
                
                $type  = (string)$cell['t'];
                $value = isset($cell->v) ? (string)$cell->v : '';
                if ($type === 's') {
                    $value = $sharedStrings[(int)$value] ?? '';
                } elseif ($type === 'inlineStr' && isset($cell->is->t)) {
                    $value = (string)$cell->is->t;
                }
                $rowData[] = $value;
                
                // Cek border berdasarkan style (s attribute)
                $styleIdx = isset($cell['s']) ? (int)$cell['s'] : 0;
                $hasBorder = $borderStyles[$styleIdx] ?? false;
                
                if (trim($value) !== '') {
                    $nonEmptyCellCount++;
                    if ($hasBorder) {
                        $borderedCellCount++;
                    }
                }
                
                $lastCol = $colIdx;
            }
            $rows[] = $rowData;
            
            $currentRowIdx++;
        }
        
        return [
            'rows' => $rows, 
            'header_row_index' => $headerRowIndex
        ];
    }
}
