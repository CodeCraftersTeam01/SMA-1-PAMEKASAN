<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Alumni;
use App\Models\TahunAjaran;
use App\Models\RencanaKarir;

class Siswa extends Model
{
    protected static function boot()
    {
        parent::boot();

        static::saved(function ($siswa) {
            $nisn = $siswa->nisn ?: ($siswa->pendaftaran ? $siswa->pendaftaran->nisn : '');
            if (!$nisn) {
                $nisn = 'ALUMNI-' . $siswa->nis;
            }

            if ($siswa->tahun_lulus) {
                // Find or update or create alumni by NISN
                $alumni = Alumni::where('nisn', $nisn)->first();

                $alumniData = [
                    'nisn' => $nisn,
                    'nama_lengkap' => $siswa->nama_lengkap,
                    'tahun_lulus' => $siswa->tahun_lulus,
                    'jurusan' => $siswa->kelas ?: 'MIPA',
                    'no_telepon' => $siswa->nomor_hp,
                    'email' => $siswa->email,
                    'alamat_domisili' => $siswa->alamat,
                    'latitude' => $siswa->lintang,
                    'longitude' => $siswa->bujur,
                ];

                if (!$alumni) {
                    $alumni = Alumni::create($alumniData);
                } else {
                    $alumni->update($alumniData);
                }

                // Associate existing plans
                if ($siswa->rencanaKarir) {
                    $siswa->rencanaKarir->update(['alumni_id' => $alumni->id]);
                }
            } else {
                // If they are marked as not graduated (no tahun_lulus), delete from alumnis
                $alumni = Alumni::where('nisn', $nisn)->first();
                if ($alumni) {
                    RencanaKarir::where('alumni_id', $alumni->id)->update(['alumni_id' => null]);
                    $alumni->delete();
                }
            }
        });

        static::deleted(function ($siswa) {
            $nisn = $siswa->nisn ?: ($siswa->pendaftaran ? $siswa->pendaftaran->nisn : '');
            if (!$nisn) {
                $nisn = 'ALUMNI-' . $siswa->nis;
            }

            $alumni = Alumni::where('nisn', $nisn)->first();
            if ($alumni) {
                RencanaKarir::where('alumni_id', $alumni->id)->update(['alumni_id' => null]);
                $alumni->delete();
            }
        });
    }
        protected $fillable = [
                'pendaftar_id',
                'tahun_ajaran_id',
                'nis',
                'kelas',
                'nama_lengkap',
                'jenis_kelamin',
                'nisn',
                'tempat_lahir',
                'tanggal_lahir',
                'agama',
                'alamat',
                'rt',
                'rw',
                'dusun',
                'kelurahan',
                'kode_pos',
                'jenis_tinggal',
                'alat_transportasi',
                'lintang',
                'bujur',
                'nomor_hp',
                'email',
                'penerima_kps',
                'nomor_kps',
                'penerima_kip',
                'nomor_kip',
                'is_active',
                'tahun_masuk',
                'tahun_lulus',
                'kelas_10',
                'kelas_11',
                'kelas_12',
        ];



        // Relasi ke Pendaftaran
        public function pendaftaran()
        {
                return $this->belongsTo(Pendaftaran::class, 'pendaftar_id');
        }

        // Relasi ke TahunAjaran
        public function tahunAjaran()
        {
                return $this->belongsTo(TahunAjaran::class, 'tahun_ajaran_id');
        }



        // Relasi ke RencanaKarir
        public function rencanaKarir()
        {
                return $this->hasOne(RencanaKarir::class, 'siswa_id');
        }

        // Relasi ke Prestasi (Achievements)
        public function achievements()
        {
                return $this->belongsToMany(Achievement::class, 'achievement_siswa', 'siswa_id', 'achievement_id');
        }
}

