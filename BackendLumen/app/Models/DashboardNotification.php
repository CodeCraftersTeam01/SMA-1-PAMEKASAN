<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DashboardNotification extends Model
{
    protected $table = 'dashboard_notifications';

    protected $fillable = [
        'type', 'title', 'message', 'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];
}
