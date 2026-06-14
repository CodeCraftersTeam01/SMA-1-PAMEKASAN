<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NavbarItem extends Model
{
    protected $fillable = [
        'label',
        'url',
        'order',
        'is_active',
        'parent_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    public function parent()
    {
        return $this->belongsTo(NavbarItem::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(NavbarItem::class, 'parent_id')->orderBy('order', 'asc');
    }
}
