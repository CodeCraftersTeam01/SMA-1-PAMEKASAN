<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pendaftaran extends Model
{
    protected $fillable = [
        'no_pendaftaran',
        'nisn',
        'nama_lengkap',
        'nama_ayah',
        'pekerjaan_ayah', 'no_hp_ayah', 'alamat_ayah', 'pendidikan_ayah', 'penghasilan_ayah',
        'nama_ibu', 'pekerjaan_ibu', 'no_hp_ibu', 'alamat_ibu', 'pendidikan_ibu', 'penghasilan_ibu',
        'nama_wali', 'pekerjaan_wali', 'no_hp_wali', 'alamat_wali', 'pendidikan_wali', 'penghasilan_wali',
        'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir',
        'nik',
        'agama',
        'asal_sekolah',
        'kecamatan',
        'status',
        'alamat',
        'email',
        'nomor_hp',
        'jalur',
        'rt', 'rw', 'dusun', 'kelurahan', 'kode_pos', 'jenis_tinggal', 'alat_transportasi', 'lintang', 'bujur',
    ];

    protected static function boot()
    {
        parent::boot();

        static::created(function ($pendaftaran) {
            static::linkMatchingSiswa($pendaftaran);
        });

        static::updated(function ($pendaftaran) {
            static::linkMatchingSiswa($pendaftaran);
        });
    }

    public static function linkMatchingSiswa($pendaftaran)
    {
        // Don't search if a student is already linked to this registration
        $alreadyLinked = \App\Models\Siswa::where('pendaftar_id', $pendaftaran->id)->exists();
        if ($alreadyLinked) {
            return;
        }

        // Search for any existing student that matches this registration data but doesn't have a pendaftar_id yet
        $matchingSiswa = \App\Models\Siswa::whereNull('pendaftar_id')
            ->where(function ($query) use ($pendaftaran) {
                if (!empty($pendaftaran->nisn)) {
                    $query->orWhere('nisn', $pendaftaran->nisn);
                }
                if (!empty($pendaftaran->email)) {
                    $query->orWhere('email', $pendaftaran->email);
                }
                if (!empty($pendaftaran->nomor_hp)) {
                    $query->orWhere('nomor_hp', $pendaftaran->nomor_hp);
                }
                if (!empty($pendaftaran->nama_lengkap) && !empty($pendaftaran->tanggal_lahir)) {
                    $query->orWhere(function ($sub) use ($pendaftaran) {
                        $sub->where('nama_lengkap', $pendaftaran->nama_lengkap)
                            ->where('tanggal_lahir', $pendaftaran->tanggal_lahir);
                    });
                }
            })->first();

        if ($matchingSiswa) {
            $matchingSiswa->update([
                'pendaftar_id' => $pendaftaran->id,
                'nisn' => $matchingSiswa->nisn ?: $pendaftaran->nisn,
                'jenis_kelamin' => $matchingSiswa->jenis_kelamin ?: $pendaftaran->jenis_kelamin,
                'tempat_lahir' => $matchingSiswa->tempat_lahir ?: $pendaftaran->tempat_lahir,
                'tanggal_lahir' => $matchingSiswa->tanggal_lahir ?: $pendaftaran->tanggal_lahir,
                'agama' => $matchingSiswa->agama ?: $pendaftaran->agama,
                'alamat' => $matchingSiswa->alamat ?: $pendaftaran->alamat,
                'nomor_hp' => $matchingSiswa->nomor_hp ?: $pendaftaran->nomor_hp,
                'email' => $matchingSiswa->email ?: $pendaftaran->email,
            ]);

            // Automatically set status to 'diterima' (accepted)
            $pendaftaran->status = 'diterima';
            $pendaftaran->saveQuietly();
        }
    }

    public function tahunAjaran()
    {
        return $this->belongsTo(TahunAjaran::class);
    }

    public function siswa()
    {
        return $this->hasOne(Siswa::class, 'pendaftar_id');
    }
}
