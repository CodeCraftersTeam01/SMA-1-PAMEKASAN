<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Add indexes to speed up listing, searching, filtering and sorting
 * on the large tables (siswas, pendaftarans) when data grows.
 *
 * Defensive: only adds an index if the column exists and the index
 * is not already present, so it is safe to run on any environment.
 */
class AddPerformanceIndexes extends Migration
{
    public function up()
    {
        $this->addIndexes('siswas', [
            'idx_siswas_nama'        => ['nama_lengkap'],
            'idx_siswas_nis'         => ['nis'],
            'idx_siswas_nisn'        => ['nisn'],
            'idx_siswas_kelas'       => ['kelas'],
            'idx_siswas_tahun_masuk' => ['tahun_masuk'],
            'idx_siswas_ta_id'       => ['tahun_ajaran_id'],
            'idx_siswas_pendaftar'   => ['pendaftar_id'],
        ]);

        $this->addIndexes('pendaftarans', [
            'idx_pend_nama'    => ['nama_lengkap'],
            'idx_pend_no'      => ['no_pendaftaran'],
            'idx_pend_nisn'    => ['nisn'],
            'idx_pend_status'  => ['status'],
            'idx_pend_sekolah' => ['asal_sekolah'],
        ]);
    }

    public function down()
    {
        $this->dropIndexes('siswas', [
            'idx_siswas_nama', 'idx_siswas_nis', 'idx_siswas_nisn',
            'idx_siswas_kelas', 'idx_siswas_tahun_masuk', 'idx_siswas_ta_id',
            'idx_siswas_pendaftar',
        ]);

        $this->dropIndexes('pendaftarans', [
            'idx_pend_nama', 'idx_pend_no', 'idx_pend_nisn',
            'idx_pend_status', 'idx_pend_sekolah',
        ]);
    }

    private function addIndexes(string $table, array $indexes): void
    {
        if (!Schema::hasTable($table)) {
            return;
        }

        Schema::table($table, function (Blueprint $t) use ($table, $indexes) {
            foreach ($indexes as $name => $columns) {
                foreach ($columns as $col) {
                    if (!Schema::hasColumn($table, $col)) {
                        continue 2;
                    }
                }
                if (!$this->indexExists($table, $name)) {
                    $t->index($columns, $name);
                }
            }
        });
    }

    private function dropIndexes(string $table, array $names): void
    {
        if (!Schema::hasTable($table)) {
            return;
        }

        Schema::table($table, function (Blueprint $t) use ($table, $names) {
            foreach ($names as $name) {
                if ($this->indexExists($table, $name)) {
                    $t->dropIndex($name);
                }
            }
        });
    }

    private function indexExists(string $table, string $index): bool
    {
        $driver = DB::connection()->getDriverName();
        if ($driver === 'sqlite') {
            $result = DB::select(
                "SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = ? AND name = ?",
                [$table, $index]
            );
            return !empty($result);
        }

        $result = DB::select(
            "SHOW INDEX FROM `{$table}` WHERE Key_name = ?",
            [$index]
        );
        return !empty($result);
    }
}
