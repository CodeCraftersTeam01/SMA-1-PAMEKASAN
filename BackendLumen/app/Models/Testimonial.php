<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    protected $table = 'testimonials';

    protected $fillable = [
        'name', 'role', 'graduation_year', 'current_occupation', 'message', 'avatar_url', 'status', 'rating',
    ];
}
