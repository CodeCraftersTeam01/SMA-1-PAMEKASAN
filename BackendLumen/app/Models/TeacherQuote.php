<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeacherQuote extends Model
{
    protected $fillable = [
        'teacher_name',
        'quote',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
