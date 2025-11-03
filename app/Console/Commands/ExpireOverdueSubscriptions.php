<?php

namespace App\Console\Commands;

use App\Models\Subscription;
use Illuminate\Console\Command;

class ExpireOverdueSubscriptions extends Command
{
    protected $signature = 'subscriptions:expire-overdue {--dry-run : List subscriptions without updating status.}';

    protected $description = 'Mark subscriptions that have passed their end date as expired.';

    public function handle(): int
    {
        $now = now();
        $statuses = [
            Subscription::STATUS_ACTIVE,
            Subscription::STATUS_GRACE,
            Subscription::STATUS_INACTIVE,
        ];

        $query = Subscription::query()
            ->whereNotNull('ends_at')
            ->where('ends_at', '<', $now)
            ->whereIn('status', $statuses);

        $total = 0;

        $query->chunkById(100, function ($subscriptions) use (&$total, $now) {
            foreach ($subscriptions as $subscription) {
                $total++;

                if ($this->option('dry-run')) {
                    $this->line(sprintf(
                        'Would expire subscription #%d (client #%d), ended on %s, status %s.',
                        $subscription->id,
                        $subscription->client_id,
                        optional($subscription->ends_at)->toIso8601String(),
                        $subscription->status
                    ));
                    continue;
                }

                $metadata = $subscription->metadata ?? [];
                $metadata['expiry_enforced_by'] = 'laravel-fallback';
                $metadata['expiry_enforced_at'] = $now->toIso8601String();

                $subscription->forceFill([
                    'status' => Subscription::STATUS_EXPIRED,
                    'cancelled_at' => $subscription->cancelled_at ?? $subscription->ends_at ?? $now,
                    'metadata' => $metadata,
                    'last_synced_at' => $now,
                ]);

                if ($subscription->isDirty()) {
                    $subscription->save();
                }
            }
        });

        if ($this->option('dry-run')) {
            $this->info("Dry run complete. {$total} subscriptions would have been marked expired.");
        } else {
            $this->info("Marked {$total} subscriptions as expired.");
        }

        return Command::SUCCESS;
    }
}
