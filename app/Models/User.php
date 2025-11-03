<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Permission\Traits\HasRoles;
use App\Models\Brand;


/**
 * @method bool hasRole(string|array $roles)
 * @method \Illuminate\Support\Collection getRoleNames()
 * @method void assignRole(string $role)
 * @method BelongsToMany managedBrands()
 * @method BelongsToMany assignedBrands()
 */
class User extends Authenticatable implements MustVerifyEmail, \App\Contracts\HasRoleContract
{
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'email_verified_at'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get brands that this user manages
     */
    public function managedBrands(): BelongsToMany
    {
        return $this->belongsToMany(Brand::class, 'brand_managers');
    }

    /**
     * Get brands that this user is part of as a team member
     */
    public function assignedBrands(): BelongsToMany
    {
        return $this->belongsToMany(Brand::class, 'brand_users');
    }

    /**
     * Get tasks assigned to the user
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function assignedTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'assigned_user_id');
    }

    // Define the projects relationship
    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function client(): HasOne
    {
        return $this->hasOne(Client::class, 'manager_user_id');
    }
}
