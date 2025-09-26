<?php

use App\Http\Controllers\BrandController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CommentController; //comments Import

Route::redirect('/', '/dashboard');



Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    // Brand routes
    Route::resource('brands', BrandController::class);
    Route::get('/brands/{brand}', [BrandController::class, 'show'])
        ->name('brands.show');
    // Secure file serving for brand assets
    Route::get('/brands/{brand}/logo', [BrandController::class, 'logo'])
        ->name('brands.logo');
    Route::get('/brands/{brand}/guideline', [BrandController::class, 'guideline'])
        ->name('brands.guideline');
    Route::post('/brands/{brand}/managers', [BrandController::class, 'assignManagers'])
        ->name('brands.assign-managers');

    // Admin routes
    Route::middleware(['role:Admin'])->group(function () {
        Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
        Route::post('/roles/sync', [RoleController::class, 'syncUserRoles'])->name('roles.sync');

        // Brand management routes for admin
        Route::post('/brands/{brand}/managers', [BrandController::class, 'assignManagers'])
            ->name('brands.assign-managers');
    });

    // Manager routes
    Route::middleware(['role:Manager'])->group(function () {
        // Manager-specific routes can be added here
    });

    // expose URIs under /brand using BrandController (keep old project.* names for compatibility)
    Route::resource('brand', BrandController::class)
        ->names([
            'index' => 'project.index',
            'create' => 'project.create',
            'store' => 'project.store',
            'show' => 'project.show',
            'edit' => 'project.edit',
            'update' => 'project.update',
            'destroy' => 'project.destroy',
        ]);

    // Route::resource('admin', AdminController::class); // to add new route import the Controller file with same class Name


    Route::post('/comments', [CommentController::class, 'store'])->name('comments.store');

    Route::middleware(['auth', 'verified'])->group(function () {
        Route::resource('admin', AdminController::class);
    });

    Route::get('/task/my-tasks', [TaskController::class, 'myTasks'])
        ->name('task.myTasks');
    Route::get('/task/{task}/dependencies', [TaskController::class, 'getDependencies'])
        ->name('task.dependencies');
    Route::put('/task/{task}/dependencies', [TaskController::class, 'updateDependencies'])
        ->name('task.dependencies.update');
    Route::resource('task', TaskController::class);
    Route::resource('user', UserController::class);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';

use App\Http\Controllers\GoogleOauthController;

// Google OAuth routes for obtaining refresh token and test sending
Route::get('/google/redirect', [GoogleOauthController::class, 'redirect'])->name('google.redirect');
Route::get('/google/callback', [GoogleOauthController::class, 'callback'])->name('google.callback');
Route::get('/google/send-test', [GoogleOauthController::class, 'sendTest'])->name('google.send_test');
