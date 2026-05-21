<?php

namespace App\Services;

class OpenRouterService
{
    protected string $apiKey;
    protected string $model;
    protected string $baseUrl;

    public function __construct()
    {
        $this->apiKey  = env('OPENROUTER_API_KEY', '');
        $this->model   = env('OPENROUTER_MODEL', 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free');
        $this->baseUrl = rtrim(env('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1'), '/');
    }

    /**
     * Analisis file Excel secara dinamis:
     * 1. Deteksi baris mana yang merupakan header (bukan metadata/judul)
     * 2. Petakan header ke kolom database yang sesuai
     *
     * @param  array  $sampleRows   Baris-baris awal dari file (maks 10 baris)
     * @param  array  $dbSchema     Schema DB: [['column' => 'nisn', 'type' => 'varchar', 'required' => true, 'description' => '...'], ...]
     * @param  int|null $knownHeaderRow Jika sudah terdeteksi sebelumnya (misal dari border Excel)
     * @return array  ['header_row' => int, 'mapping' => ['ExcelCol' => 'db_col|null', ...]]
     */
    public function analyzeFile(array $sampleRows, array $dbSchema, string $tableName, ?int $knownHeaderRow = null): array
    {
        if (empty($this->apiKey)) {
            return $this->fallbackAnalyze($sampleRows, $dbSchema);
        }

        // Format baris sample untuk prompt
        $rowsText = '';
        foreach ($sampleRows as $i => $row) {
            $cells = array_map(fn($c) => '"' . str_replace('"', "'", (string)$c) . '"', $row);
            $rowsText .= "  Baris {$i}: [" . implode(', ', $cells) . "]\n";
        }

        // Format skema DB
        $schemaText = '';
        foreach ($dbSchema as $col) {
            $req = $col['required'] ? '(WAJIB)' : '(opsional)';
            $schemaText .= "  - {$col['column']} [{$col['type']}] {$req}: {$col['description']}\n";
        }

        $promptKnownHeader = $knownHeaderRow !== null 
            ? "\nPERHATIAN: Sistem telah mendeteksi secara pasti bahwa BARIS {$knownHeaderRow} adalah BARIS HEADER berdasarkan format/border file Excel. Kamu HARUS menggunakan baris {$knownHeaderRow} sebagai nilai 'header_row'.\n" 
            : "";

        $prompt = <<<PROMPT
Kamu adalah asisten cerdas untuk sistem manajemen sekolah Indonesia.

Diberikan data mentah dari file Excel (beberapa baris pertama):
{$rowsText}

Tabel database tujuan adalah "{$tableName}" dengan kolom-kolom berikut:
{$schemaText}{$promptKnownHeader}

TUGAS KAMU:
1. Tentukan indeks baris (0-based) yang merupakan BARIS HEADER sesungguhnya.
   - Baris header biasanya berisi nama-nama kolom seperti "Nama", "NISN", "Alamat", dll.
   - Abaikan baris metadata seperti judul sekolah, tanggal, alamat instansi.
   - Jika ada baris kosong atau nomor urut, bukan baris header.
   - PENTING: Jika sistem telah mendeteksi baris header secara otomatis, GUNAKAN indeks tersebut.
   
2. Dari baris header yang terdeteksi, petakan setiap nilai header ke kolom database yang PALING COCOK secara semantik dan SANGAT LOGIS.
   - Contoh: "Nama" atau "Nama Siswa" → nama_lengkap
   - Contoh: "NISN" atau "No NISN" atau "NIPD" → nisn
   - Contoh: "Sekolah Asal" atau "Asal SMP" → asal_sekolah
   - ATURAN KERAS (PENTING!):
     - DILARANG memetakan "No", "Nomor", "No Ujian", "No Ijazah" ke "no_pendaftaran". Kolom "no_pendaftaran" adalah kode unik sistem registrasi (auto-generate). Jika di Excel hanya ada "No" (nomor urut), petakan ke `null`.
     - DILARANG memetakan kolom jenis kelamin (JK/L/P) ke nama_lengkap atau nisn.
     - Jika kolom Excel tidak punya padanan yang benar-benar masuk akal di Database (misal: "Agama", "Tempat Lahir", "Tanggal Lahir", "No Ijazah"), petakan ke `null` (Abaikan).
     - Lebih baik memetakan ke `null` daripada salah memetakan data yang tidak logis.
   - Satu kolom DB hanya boleh dipetakan ke SATU header Excel.

Balas HANYA dengan JSON valid tanpa penjelasan, tanpa markdown fence, format:
{"header_row": <integer>, "mapping": {"<nilai header Excel>": "<db_column atau null>"}}

Contoh: {"header_row": 5, "mapping": {"Nama": "nama_lengkap", "NIPD": "nisn", "No Ijazah": null, "No": null}}
PROMPT;

        try {
            $response = $this->callApi($prompt);
            $result   = $this->parseJsonFromResponse($response);

            // Validasi struktur
            if (!isset($result['header_row']) || !isset($result['mapping'])) {
                throw new \RuntimeException('Struktur JSON dari AI tidak valid.');
            }

            $headerRow = (int) $result['header_row'];
            $mapping   = $result['mapping'];

            // Ambil nama kolom DB yang valid
            $validDbCols = array_column($dbSchema, 'column');

            // Bersihkan: pastikan setiap value adalah kolom DB valid atau null
            $cleanMapping = [];
            foreach ($mapping as $excelCol => $dbCol) {
                if ($dbCol && in_array($dbCol, $validDbCols)) {
                    $cleanMapping[(string)$excelCol] = $dbCol;
                } else {
                    $cleanMapping[(string)$excelCol] = null;
                }
            }

            return [
                'header_row' => $headerRow,
                'mapping'    => $cleanMapping,
            ];

        } catch (\Throwable $e) {
            return $this->fallbackAnalyze($sampleRows, $dbSchema);
        }
    }

    /**
     * Kirim request ke OpenRouter API.
     */
    protected function callApi(string $prompt): string
    {
        $payload = json_encode([
            'model'    => $this->model,
            'messages' => [
                [
                    'role'    => 'user',
                    'content' => $prompt,
                ],
            ],
            'temperature' => 0.1,
            'max_tokens'  => 800,
        ]);

        $ch = curl_init("{$this->baseUrl}/chat/completions");
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_TIMEOUT        => 45,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $this->apiKey,
                'HTTP-Referer: ' . env('APP_URL', 'http://localhost'),
                'X-Title: SMAN1-Pamekasan-AI-Import',
            ],
        ]);

        $result   = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr  = curl_error($ch);
        curl_close($ch);

        if ($curlErr) throw new \RuntimeException("cURL error: {$curlErr}");
        if ($httpCode !== 200) throw new \RuntimeException("OpenRouter HTTP {$httpCode}: {$result}");

        $decoded = json_decode($result, true);
        $content = $decoded['choices'][0]['message']['content'] ?? '';

        if (empty(trim($content))) {
            throw new \RuntimeException('Respons AI kosong.');
        }

        return $content;
    }

    /**
     * Ekstrak JSON dari respons AI (yang mungkin ada teks tambahan).
     */
    protected function parseJsonFromResponse(string $content): array
    {
        // Coba langsung
        $decoded = json_decode(trim($content), true);
        if (is_array($decoded)) return $decoded;

        // Coba ambil blok JSON { ... } pertama yang ada header_row
        if (preg_match('/\{[\s\S]*"header_row"[\s\S]*\}/U', $content, $matches)) {
            $decoded = json_decode($matches[0], true);
            if (is_array($decoded)) return $decoded;
        }

        // Coba hapus markdown fence
        $cleaned = preg_replace('/```(?:json)?|```/', '', $content);
        $decoded = json_decode(trim($cleaned), true);
        if (is_array($decoded)) return $decoded;

        throw new \RuntimeException("Gagal parse JSON dari AI: " . substr($content, 0, 200));
    }

    /**
     * Fallback: deteksi header + mapping menggunakan string similarity (tanpa AI).
     * Digunakan jika API key tidak diset atau AI gagal.
     */
    protected function fallbackAnalyze(array $sampleRows, array $dbSchema): array
    {
        $systemCols = ['id', 'created_at', 'updated_at', 'deleted_at', 'remember_token'];
        $dbCols     = array_column($dbSchema, 'column');
        $targetCols = array_diff($dbCols, $systemCols);

        // Deteksi header row: baris dengan paling banyak sel non-kosong
        // dan yang paling mirip dengan keyword kolom DB
        $headerRow = 0;
        $bestScore = -1;

        foreach ($sampleRows as $i => $row) {
            $nonEmpty   = count(array_filter($row, fn($c) => trim((string)$c) !== ''));
            $matchScore = 0;
            foreach ($row as $cell) {
                $norm = strtolower(preg_replace('/[\s_\-\.]+/', '_', (string)$cell));
                foreach ($targetCols as $dbCol) {
                    if (levenshtein($norm, strtolower($dbCol)) <= 3) {
                        $matchScore++;
                    }
                }
            }
            $score = $nonEmpty + ($matchScore * 3);
            if ($score > $bestScore && $nonEmpty >= 2) {
                $bestScore = $score;
                $headerRow = $i;
            }
        }

        // Mapping dari header yang terdeteksi
        $headers  = $sampleRows[$headerRow] ?? [];
        $mapping  = [];
        $usedDb   = [];

        foreach ($headers as $cell) {
            $cell = trim((string)$cell);
            if ($cell === '') { $mapping[$cell] = null; continue; }

            $norm      = strtolower(preg_replace('/[\s_\-\.]+/', '_', $cell));
            $bestMatch = null;
            $bestDist  = PHP_INT_MAX;

            foreach ($targetCols as $dbCol) {
                if (in_array($dbCol, $usedDb)) continue;
                if ($norm === strtolower($dbCol)) { $bestMatch = $dbCol; $bestDist = 0; break; }
                $d = levenshtein($norm, strtolower($dbCol));
                if ($d < $bestDist) { $bestDist = $d; $bestMatch = $dbCol; }
            }

            $threshold = max(strlen($norm), strlen($bestMatch ?? '')) * 0.6;
            if ($bestMatch && $bestDist <= $threshold) {
                $mapping[$cell] = $bestMatch;
                $usedDb[]       = $bestMatch;
            } else {
                $mapping[$cell] = null;
            }
        }

        return ['header_row' => $headerRow, 'mapping' => $mapping];
    }
}
