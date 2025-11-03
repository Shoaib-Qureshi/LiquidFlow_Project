import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function SubscriptionIndex({ auth, subscriptions }) {
    const rows = subscriptions?.data ?? [];
    const roles = auth?.roles ?? [];
    const isManager = roles.includes('Manager');
    const cancelledStatuses = new Set(['cancelled', 'canceled', 'inactive', 'expired']);
    const hasCancelledSubscription = rows.some((subscription) =>
        cancelledStatuses.has((subscription?.status ?? '').toLowerCase())
    );

    const subscribedPlanSlugs = new Set(
        rows
            .map((subscription) => subscription?.plan?.slug)
            .filter((slug) => typeof slug === 'string' && slug.length > 0)
    );

    const planCatalog = [
        {
            slug: 'starter-monthly',
            name: 'Starter Monthly',
            price: '$450 / month',
            highlight: 'Essential creative support for emerging teams.',
        },
        {
            slug: 'business-monthly',
            name: 'Business Monthly',
            price: '$1,200 / month',
            highlight: 'Our most popular plan for growing teams.',
        },
        {
            slug: 'agency-monthly',
            name: 'Agency Monthly',
            price: '$2,200 / month',
            highlight: 'Premium same-day turnarounds and account management.',
        },
        {
            slug: 'starter-yearly',
            name: 'Starter Yearly',
            price: '$382.50 / month (billed yearly)',
            highlight: 'Starter coverage with 15% annual savings.',
        },
        {
            slug: 'business-yearly',
            name: 'Business Yearly',
            price: '$1,020 / month (billed yearly)',
            highlight: 'Popular tier paired with annual billing discounts.',
        },
        {
            slug: 'agency-yearly',
            name: 'Agency Yearly',
            price: '$1,870 / month (billed yearly)',
            highlight: 'Enterprise-scale design capacity on annual billing.',
        },
    ];

    const upgradeOptions = planCatalog.filter((plan) => !subscribedPlanSlugs.has(plan.slug));

    const badgeClasses = (status) => {
        switch ((status ?? '').toLowerCase()) {
            case 'active':
                return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300';
            case 'overdue':
            case 'suspended':
            case 'paused':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300';
            case 'cancelled':
            case 'expired':
            case 'failed':
                return 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300';
            default:
                return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300';
        }
    };

    const formatDate = (value) => {
        if (!value) {
            return '—';
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={<h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Subscription Status</h2>}
        >
            <Head title="Subscription Status" />

            {isManager && hasCancelledSubscription && (
                <div className="mb-6">
                    <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
                        <span className="font-semibold">Subscription cancelled.</span> Your subscription is cancelled. Please contact us to reactivate your account.
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
                <div className="px-4 py-4 sm:px-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Track your subscription linked to your account.
                        </p>
                    </div>
                    <div className="text-sm text-gray-400 dark:text-gray-500">
                        {subscriptions?.total ?? 0} total
                    </div>
                </div>

                {rows.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No subscriptions found for your account yet.
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
                                <thead className="bg-gray-50/70 dark:bg-slate-900/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subscription</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recurring</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Due</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expiry</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Renewals</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Method</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                    {rows.map((subscription) => (
                                        <tr key={subscription.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/60">
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-50">
                                                    {subscription.product_name ?? `Subscription #${subscription.woocommerce_subscription_id}`}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {subscription.plan?.name ?? subscription.plan_name ?? 'WooCommerce Plan'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-50">
                                                <div>{subscription.customer_name ?? '—'}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {subscription.customer_email ?? '—'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-50">
                                                {subscription.recurring_amount !== null ? (
                                                    <>
                                                        {subscription.currency ?? ''} {Number(subscription.recurring_amount).toFixed(2)}
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {subscription.recurring_interval ?? 'monthly'}
                                                        </div>
                                                    </>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-50">
                                                {formatDate(subscription.payment_due_on)}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-50">
                                                {formatDate(subscription.expires_on)}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-50">
                                                {subscription.renewals_count ?? 0}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-50">
                                                {subscription.payment_method ?? '—'}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badgeClasses(subscription.status)}`}>
                                                    {subscription.status ?? 'unknown'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {isManager && upgradeOptions.length > 0 && (
                            <div className="border-t border-gray-100 dark:border-slate-800 px-4 py-6 sm:px-6 bg-gray-50/60 dark:bg-slate-900/40">
                                <div className="max-w-4xl">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Ready to upgrade?</h3>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        Unlock faster turnaround times, premium support, and added creative capacity by upgrading your plan on the LiquidFlow storefront.
                                    </p>
                                </div>
                                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {upgradeOptions.map((plan) => (
                                        <div key={plan.slug} className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="p-5 flex flex-col h-full">
                                                <div className="flex items-center justify-between gap-3">
                                                    <h4 className="text-base font-semibold text-gray-900 dark:text-gray-50">{plan.name}</h4>
                                                    <span className="text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-300">
                                                        Upgrade
                                                    </span>
                                                </div>
                                                <div className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-200">{plan.price}</div>
                                                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 flex-1">{plan.highlight}</p>
                                                <a
                                                    href={`http://liquidflowwp.local/?plan=${plan.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 transition-colors"
                                                >
                                                    Upgrade your plan
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {subscriptions?.links && subscriptions.links.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {subscriptions.from ?? 0} to {subscriptions.to ?? 0} of {subscriptions.total ?? 0} results
                        </div>
                        <div className="flex items-center gap-2">
                            {subscriptions.links.map((link, index) => (
                                <Link
                                    // eslint-disable-next-line react/no-array-index-key
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-3 py-1 rounded-md text-sm ${link.active
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                                        } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
