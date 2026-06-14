<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    protected $fillable = [
        'title',
        'description',
        'features_json',
        'order',
    ];

    protected $casts = [
        'features_json' => 'array',
    ];
}
