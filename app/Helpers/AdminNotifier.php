<?php

namespace App\Helpers;

use App\Models\User;

class AdminNotifier
{
    /**
     * Return array of admin emails. Priority:
     * - ADMIN_EMAIL env (comma-separated)
     * - users with email domain tier2.digital
     * - fallback to MAIL_FROM_ADDRESS
     *
     * @return array
     */
    public static function adminEmails(): array
    {
        $env = env('ADMIN_EMAIL');
        if (!empty($env)) {
            $list = array_map('trim', explode(',', $env));
            return array_filter($list);
        }

        // pick users with tier2.digital email domain as admins
        $users = User::where('email', 'like', '%@tier2.digital')->get();
        if ($users->isNotEmpty()) {
            return $users->pluck('email')->unique()->toArray();
        }

        $fallback = env('MAIL_FROM_ADDRESS', 'shoaib@tier2.digital');
        return [$fallback];
    }
}
