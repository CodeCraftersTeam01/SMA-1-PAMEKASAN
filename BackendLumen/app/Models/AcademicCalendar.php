<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AcademicCalendar extends Model
{
    protected $table = 'academic_calendars';

    protected $fillable = [
        'title',
        'description',
        'event_date',
        'type', // 'kegiatan', 'libur', 'ujian'
    ];

    protected $casts = [
        'event_date' => 'date',
    ];
}
