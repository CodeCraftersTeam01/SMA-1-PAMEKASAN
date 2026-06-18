<?php
require 'vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$ta = \Illuminate\Support\Facades\DB::table('tahun_ajarans')->where('is_active', 1)->first();
$s = \Illuminate\Support\Facades\DB::table('siswas')->where('id', 1067)->first();
$s_ta = \Illuminate\Support\Facades\DB::table('tahun_ajarans')->where('id', $s->tahun_ajaran_id ?? 0)->first();

echo json_encode([
    'activeTa' => $ta, 
    'siswa' => $s,
    'siswaTa' => $s_ta
], JSON_PRETTY_PRINT);
