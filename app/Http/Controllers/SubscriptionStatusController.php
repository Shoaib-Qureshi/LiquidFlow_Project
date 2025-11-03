<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriptionStatusController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Subscription::query()->with(['client', 'plan']);

        if ($user->hasRole('Admin')) {
            // see everything
        } elseif ($user->hasRole('Manager')) {
            $clientIds = Client::where('manager_user_id', $user->id)->pluck('id');

            if ($clientIds->isEmpty()) {
                $query->whereRaw('1 = 0');
            } else {
                $query->whereIn('client_id', $clientIds);
            }
        } else {
            if ($user->client) {
                $query->where('client_id', $user->client->id);
            } else {
                $query->whereJsonContains('metadata->customer_email', $user->email);
            }
        }

        $subscriptions = $query
            ->orderByDesc('starts_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Subscriptions/Index', [
            'subscriptions' => $subscriptions,
        ]);
    }
}
