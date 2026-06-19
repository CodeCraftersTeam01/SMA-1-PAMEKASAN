<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
$cols = Illuminate\Support\Facades\DB::select('SHOW COLUMNS FROM siswas');
foreach ($cols as $col) { echo $col->Field . PHP_EOL; }
