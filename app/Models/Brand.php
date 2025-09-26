<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Brand extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'status',
        'created_by',
        // Extended fields
        'audience',
        'other_details',
        'started_on',
        'in_progress',
        'logo_path',
        'file_path',
    ];

    /**
     * Get all tasks associated with this brand
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Get managers assigned to this brand
     */
    public function managers(): BelongsToMany
    {
        // Return users associated as managers for this brand. Role checks should be
        // handled separately (policies/controllers) because role names/casing may vary.
        return $this->belongsToMany(User::class, 'brand_managers');
    }

    /**
     * Get team users assigned to this brand
     */
    public function teamUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'brand_users');
    }

    /**
     * Get the user who created this brand
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

}
