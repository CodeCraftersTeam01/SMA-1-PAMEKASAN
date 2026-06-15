<?php

namespace App\Models;

use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Lumen\Auth\Authorizable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Model implements AuthenticatableContract, AuthorizableContract, JWTSubject
{
    use Authenticatable, Authorizable, HasFactory;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'photo',
        'permissions',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'permissions' => 'array',
    ];

    protected static $defaultPermissions = [
        'dashboard'   => ['view' => true, 'create' => false, 'edit' => false, 'delete' => false],
        'pendaftaran' => ['view' => true, 'create' => false, 'edit' => false, 'delete' => false],
        'siswa'       => ['view' => true, 'create' => false, 'edit' => false, 'delete' => false],
        'kelas'       => ['view' => true, 'create' => false, 'edit' => false, 'delete' => false],
        'tahun_ajaran'=> ['view' => true, 'create' => false, 'edit' => false, 'delete' => false],
        'laporan'     => ['view' => true, 'create' => false, 'edit' => false, 'delete' => false],
        'alumni'      => ['view' => true, 'create' => false, 'edit' => false, 'delete' => false],
        'alumni_tracking' => ['view' => true, 'create' => false, 'edit' => false, 'delete' => false],
        'berita'      => ['view' => false, 'create' => false, 'edit' => false, 'delete' => false],
        'prestasi'    => ['view' => false, 'create' => false, 'edit' => false, 'delete' => false],
        'fasilitas'   => ['view' => false, 'create' => false, 'edit' => false, 'delete' => false],
        'halaman'     => ['view' => false, 'create' => false, 'edit' => false, 'delete' => false],
        'navigasi'    => ['view' => false, 'create' => false, 'edit' => false, 'delete' => false],
        'teachers'    => ['view' => false, 'create' => false, 'edit' => false, 'delete' => false],
        'features'    => ['view' => false, 'create' => false, 'edit' => false, 'delete' => false],
        'programs'    => ['view' => false, 'create' => false, 'edit' => false, 'delete' => false],
        'pengaturan'  => ['view' => true, 'create' => false, 'edit' => false, 'delete' => false],
    ];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    public function hasPermission($resource, $action)
    {
        if ($this->role === 'admin') {
            return true;
        }

        $permissions = $this->permissions ?? static::$defaultPermissions;

        if (!isset($permissions[$resource])) {
            return false;
        }

        return ($permissions[$resource][$action] ?? false) === true;
    }

    public function hasAnyPermission($resource, array $actions)
    {
        foreach ($actions as $action) {
            if ($this->hasPermission($resource, $action)) {
                return true;
            }
        }
        return false;
    }

    public function getDefaultPermissions()
    {
        return static::$defaultPermissions;
    }
}
