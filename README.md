# LiquidFlow Platform

Modern client/brand management portal built with **Laravel 11**, **Inertia**, and a **React** front‑end. It unifies project/task tracking with subscription intelligence pulled from a connected WooCommerce + YITH Subscriptions storefront.

---

## Key Features

### Core Domain
- **Clients ↔ Brands** – every client can own multiple brands; brands carry creative briefs, assets, and timelines.
- **Task Management** – tasks belong to brands, include dependencies, and expose assignee-focused views.
- **Role-Driven UI**
  - **Admin**: full control over clients, brands, tasks, users, and system settings.
  - **Manager**: “brand owner” view scoped to the brands associated with their client record; can manage their brands and related tasks.
  - **Team Member**: task-level access; sees only work assigned to them.
- **Automatic Manager Provisioning** – creating a client with a contact email provisions/links a manager account (default password `password@123`, forced to update on first login).

### Subscription Authority in Laravel
- **Plans & Subscriptions** stored locally (`plans`, `subscriptions` tables) with seeded pricing tiers derived from the “Pricing Plans Summary” document.
- **Business Logic helpers** (`isActive()`, `isExpired()`, `daysRemaining()`) and relationships (`client->subscription`, `client->activeSubscription`) ready for controllers & middleware.
- **Admin and Customer Views** – Inertia pages (React) display subscription details for managers and global reports for admins.

### WordPress / WooCommerce Integration
- **Endpoints**
  - `POST /api/integrations/woocommerce/orders` – accepts order payloads (webhook or REST fetch) and syncs client records, managers, and fallback subscriptions.
  - `POST /api/integrations/woocommerce/subscriptions` – ingests YITH subscription events and upserts “real” subscriptions.
- **Status Updates in Real Time**
  - `mu-plugins/liquidflow-sync.php` (WordPress) sends payloads on checkout **and** every WooCommerce order status change.
  - Laravel job `ProcessWooCommerceOrder` updates fallback subscriptions (`woo-order:{id}`) and the corresponding YITH subscription (`external_reference = woo:{id}`) so status always reflects the latest Woo state (`pending` → grace, `completed` → active, etc.).
- **Stripe Metadata Capture** – Woo payloads include Stripe IDs (customer, payment intent, subscription) which we persist for reconciliation.
- **WooCommerce REST Client** – `App\Services\Integrations\WooCommerceApiService` wraps authenticated calls when polling is needed (uses `WOO_API_URL`, `WOO_API_KEY`, `WOO_API_SECRET`).

### Communications & Notifications
- **Email Pipelines** using Laravel Mailables for new brands, tasks, comments, etc.
- **Gmail API integration** available (`app/Services/GmailApiService.php`) for delegated sending.
- **Queued Notifications** – all mail/queue work runs on the database queue connection (see setup).

---

## Tech Stack
| Layer              | Details                                                                               |
|--------------------|---------------------------------------------------------------------------------------|
| Backend            | Laravel 11, PHP 8.3, Spatie Permission, Eloquent factories/seeders                    |
| Frontend           | React + Inertia, Tailwind, Vite                                                       |
| Queue              | Database driver (`QUEUE_CONNECTION=database`), jobs processed via `php artisan queue:work` |
| Database           | SQLite (default) – switchable via `.env`                                              |
| External Services  | WooCommerce REST, YITH Subscriptions, Stripe (metadata), Gmail API                    |

---

## Getting Started

### 1. Prerequisites
- PHP 8.3+, Composer
- Node.js 18+, npm or pnpm
- SQLite (default) or another database supported by Laravel
- Running WordPress/WooCommerce instance with the **LiquidFlow Sync** MU plugin

### 2. Install Dependencies
```bash
composer install
npm install
```

### 3. Environment Setup
Duplicate `.env.example` to `.env` and configure:

```env
APP_URL=http://liquidflow.local
QUEUE_CONNECTION=database

# WooCommerce signing (optional but recommended)
WOO_SYNC_SIGNING_SECRET=your-shared-secret
WOO_SYNC_SIGNATURE_TTL=300

# WooCommerce REST access (used by WooCommerceApiService)
WOO_API_URL=https://your-wp-site.com/wp-json/wc/v3
WOO_API_KEY=ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WOO_API_SECRET=cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WOO_API_TIMEOUT=30

# Optional plan mapping from Woo product IDs to plan slugs
WOO_PRODUCT_PLAN_MAP={"2219":"business-monthly","2220":"agency-monthly"}

# Gmail / mail config, Stripe, etc. as needed
```

### 4. Database & Assets
```bash
php artisan migrate
php artisan db:seed --class=PlanSeeder  # seeds pricing plans
php artisan storage:link
```

### 5. Local Development
```bash
php artisan serve
npm run dev
```
In another terminal start the queue worker:
```bash
php artisan queue:work --queue=default
```

### 6. WordPress Configuration
1. Install the repo under `\liquidflowwp\app\public` (LocalWP in this project).  
2. Ensure `wp-content/mu-plugins/liquidflow-sync.php` is present and activated.  
3. Add to `wp-config.php`:
   ```php
   define('LF_SYNC_ENDPOINT', 'https://your-laravel-app.test/api/integrations/woocommerce/orders');
   define('LF_SUBSCRIPTION_ENDPOINT', 'https://your-laravel-app.test/api/integrations/woocommerce/subscriptions');
   define('LF_SYNC_KEY', 'your-shared-secret');  // must match WOO_SYNC_SIGNING_SECRET
   ```
4. Verify WooCommerce > Status > Logs for `[lf-sync]` entries during checkout/status change; Laravel’s `storage/logs/laravel.log` should show webhook hits.

---

## Production Checklist
- Queue worker via Supervisor or Horizon (database queue).
- Configure HTTPS for both Laravel and WordPress endpoints.
- Replace default manager password via notification or by forcing password reset.
- Monitor `failed_jobs` table; optionally configure retry/backoff.
- Enable Stripe webhook forwarding if using deeper Stripe features.

---

## Project Structure Highlights
```
app/
  Jobs/Integrations/ProcessWooCommerceOrder.php       # order ingestion + subscription sync
  Jobs/Integrations/ProcessWooCommerceSubscription.php# YITH subscription ingestion
  Services/Integrations/WooCommerceApiService.php     # REST client wrapper
  Models/{Client,Brand,Subscription,Plan,...}.php     # Eloquent models & relationships
  Http/Controllers/SubscriptionStatusController.php   # Inertia subscription views
resources/js/
  Pages/Subscriptions/Index.jsx                       # Manager-facing subscription dashboard
  Layouts/AuthenticatedLayout.jsx                     # Role-aware nav

wp-content/mu-plugins/liquidflow-sync.php             # WordPress webhook handler
```

---

## Useful Commands & Testing Tips
| Action                                     | Command                                                           |
|--------------------------------------------|-------------------------------------------------------------------|
| Run unit/feature tests                     | `php artisan test`                                                |
| Seed demo data                             | `php artisan db:seed`                                             |
| Replay Woo order payload (Tinker example)  | `ProcessWooCommerceOrder::dispatchSync([...])`                    |
| Retry failed jobs                          | `php artisan queue:retry all`                                     |
| View subscription status (Tinker)          | `Subscription::with('plan','client')->get()`                      |

---

## Support & Troubleshooting
- **Queue not updating UI?** Ensure `queue:work` is running and `failed_jobs` is empty.
- **WooCommerce payload missing?** Check WordPress logs for `[lf-sync]` errors and confirm `LF_SYNC_ENDPOINT` is reachable.
- **Signature mismatch?** Verify `LF_SYNC_KEY` in WordPress matches `WOO_SYNC_SIGNING_SECRET` in Laravel.
- **Plan not recognized?** Populate `WOO_PRODUCT_PLAN_MAP` so product → plan slug resolution is deterministic.

For deeper debugging, enable Laravel’s telescope (optional) or add verbose logging in the MU plugin (`wp-content/mu-plugins/liquidflow-sync.php`). Pull requests should include tests for new jobs/services where feasible.

---
