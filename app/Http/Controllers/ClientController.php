<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use App\Models\User;

class ClientController extends Controller
{
    public function __construct()
    {
        $this->middleware([\Spatie\Permission\Middleware\RoleMiddleware::class . ':Admin']);
    }

    public function index(Request $request)
    {
        $query = Client::query();
        $supportsBrandLinking = Schema::hasColumn('brands', 'client_id');

        if ($supportsBrandLinking) {
            $query->withCount('brands');
        }

        if ($search = $request->input('search')) {
            $query->where('name', 'like', '%' . $search . '%');
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $clients = $query
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Clients/Index', [
            'clients' => $clients,
            'filters' => $request->only(['search', 'status']),
            'supportsBrandLinking' => $supportsBrandLinking,
        ]);
    }

    public function create()
    {
        return Inertia::render('Clients/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|in:active,inactive',
            'logo' => 'nullable|image|max:5120',
            'website' => 'nullable|url|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $logoPath = null;
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store(
                'clients/' . now()->format('Ymd') . '/logos',
                'public'
            );
        }

        $client = Client::create([
            'name' => $validated['name'],
            'slug' => Client::generateUniqueSlug($validated['name']),
            'status' => $validated['status'],
            'logo_path' => $logoPath,
            'website' => $validated['website'] ?? null,
            'contact_email' => $validated['contact_email'] ?? null,
            'contact_phone' => $validated['contact_phone'] ?? null,
            'description' => $validated['description'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'created_by' => Auth::id(),
            'updated_by' => Auth::id(),
        ]);

        if (!empty($validated['contact_email'])) {
            $user = User::firstOrCreate(
                ['email' => $validated['contact_email']],
                [
                    'name' => $validated['name'],
                    'password' => Hash::make('password@123'),
                    'email_verified_at' => now(),
                ]
            );

            if (!$user->hasRole('Manager')) {
                $user->assignRole('Manager');
            }
        }

        return redirect()
            ->route('clients.show', $client)
            ->with('success', 'Client created successfully.');
    }

    public function show(Client $client)
    {
        $supportsBrandLinking = Schema::hasColumn('brands', 'client_id');

        if ($supportsBrandLinking) {
            $client->load(['brands' => function ($query) {
                $query->withCount('tasks')
                    ->orderBy('name');
            }]);
        }

        return Inertia::render('Clients/Show', [
            'client' => $client,
            'supportsBrandLinking' => $supportsBrandLinking,
        ]);
    }

    public function edit(Client $client)
    {
        return Inertia::render('Clients/Edit', [
            'client' => $client,
        ]);
    }

    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|in:active,inactive',
            'logo' => 'nullable|image|max:5120',
            'website' => 'nullable|url|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $logoPath = $client->logo_path;
        if ($request->hasFile('logo')) {
            if ($logoPath && Storage::disk('public')->exists($logoPath)) {
                Storage::disk('public')->delete($logoPath);
            }

            $logoPath = $request->file('logo')->store(
                'clients/' . now()->format('Ymd') . '/logos',
                'public'
            );
        }

        $client->update([
            'name' => $validated['name'],
            'slug' => Client::generateUniqueSlug($validated['name'], $client->id),
            'status' => $validated['status'],
            'logo_path' => $logoPath,
            'website' => $validated['website'] ?? null,
            'contact_email' => $validated['contact_email'] ?? null,
            'contact_phone' => $validated['contact_phone'] ?? null,
            'description' => $validated['description'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'updated_by' => Auth::id(),
        ]);

        return redirect()
            ->route('clients.show', $client)
            ->with('success', 'Client updated successfully.');
    }

    public function destroy(Client $client)
    {
        if ($client->logo_path && Storage::disk('public')->exists($client->logo_path)) {
            Storage::disk('public')->delete($client->logo_path);
        }

        $client->delete();

        return redirect()
            ->route('clients.index')
            ->with('success', 'Client deleted successfully.');
    }
}
