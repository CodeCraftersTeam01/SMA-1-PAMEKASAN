<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandingPageSetting extends Model
{
    protected $fillable = [
        'hero_title',
        'hero_subtitle',
        'hero_image',
        'video_link',
        'ppdb_link',
        'headmaster_name',
        'headmaster_title',
        'headmaster_message',
        'headmaster_photo',
        'contact_email',
        'contact_phone',
        'contact_address',
        'contact_map_url'
    ];
}
