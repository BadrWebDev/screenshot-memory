<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Screenshot extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'image_url',
        'image_hash',
        'summary',
        'category',
        'extracted_text',
        'tags',
    ];

    protected $casts = [
        'tags' => 'array',
    ];
}