import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const formatStatusLabel = (status = '') =>
    status
        .toString()
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());

function MetricCard({ title, value, subtitle, icon, color = 'blue', trend }) {
    const gradientMap = {
        blue: 'from-blue-100/70 via-white to-white',
        green: 'from-emerald-100/70 via-white to-white',
        yellow: 'from-amber-100/70 via-white to-white',
        purple: 'from-violet-100/70 via-white to-white',
        red: 'from-rose-100/70 via-white to-white',
    };

    const iconRingMap = {
        blue: 'bg-blue-500/15 text-blue-600',
        green: 'bg-emerald-500/15 text-emerald-600',
        yellow: 'bg-amber-500/15 text-amber-600',
        purple: 'bg-violet-500/15 text-violet-600',
        red: 'bg-rose-500/15 text-rose-600',
    };

    const trendColor = trend?.positive ? 'text-emerald-600' : 'text-rose-500';

    return (
        <div className="relative overflow-hidden rounded-3xl border border-slate-100/80 bg-white px-6 py-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradientMap[color] ?? gradientMap.blue}`}></div>
            <div className="relative z-10 flex items-start justify-between gap-4 text-gray-900 dark:text-gray-100">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{title}</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{value}</p>
                    {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
                    {trend && (
                        <div className={`mt-3 flex items-center text-sm font-medium ${trendColor}`}>
                            <span>{trend.positive ? '▲' : '▼'} {trend.value}</span>
                            <span className="ml-2 text-slate-500 dark:text-slate-400">{trend.label}</span>
                        </div>
                    )}
                </div>
                {icon && (
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconRingMap[color] ?? iconRingMap.blue}`}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}

function QuickActionCard({ title, description, href, buttonText, icon, color = 'blue' }) {
    const palette = {
        blue: {
            icon: 'bg-blue-500/15 text-blue-600',
            button: 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500',
            glow: 'from-blue-500/10 via-transparent to-transparent',
        },
        green: {
            icon: 'bg-emerald-500/15 text-emerald-600',
            button: 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500',
            glow: 'from-emerald-500/10 via-transparent to-transparent',
        },
        purple: {
            icon: 'bg-violet-500/15 text-violet-600',
            button: 'bg-violet-600 hover:bg-violet-700 focus-visible:ring-violet-500',
            glow: 'from-violet-500/10 via-transparent to-transparent',
        },
    };

    const theme = palette[color] ?? palette.blue;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 text-gray-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800/80 dark:bg-slate-900 dark:text-gray-100">
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${theme.glow}`} />
            <div className="relative z-10 flex items-start gap-4">
                {icon && (
                    <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${theme.icon}`}>
                        {icon}
                    </div>
                )}
                <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{description}</p>
                    <Link
                        href={href}
                        className={`mt-4 inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${theme.button}`}
                    >
                        {buttonText}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function Dashboard({ metrics = {} }) {
    const { props } = usePage();
    const auth = props?.auth ?? {};
    const user = auth.user ?? {};
    const roles = auth.roles ?? [];
    const isAdmin = roles.includes('Admin');
    const isManager = roles.includes('Manager');
    const isSimpleUser = !isAdmin && !isManager;
    const [deadlinePage, setDeadlinePage] = useState(1);

    const defaultMetrics = {
        projectStats: { total: 0, active: 0, completed: 0, completion_rate: 0 },
        taskStats: { total: 0, by_status: {}, completion_rate: 0 },
        myTasks: { pending: 0, inProgress: 0, completed: 0 },
        recentActivity: [],
        upcomingDeadlines: [],
    };

    const finalMetrics = { ...defaultMetrics, ...metrics };
    const deadlines = Array.isArray(finalMetrics.upcomingDeadlines) ? finalMetrics.upcomingDeadlines : [];
    const hasDeadlines = deadlines.length > 0;
    const deadlinesPerPage = 8;
    const totalDeadlinePages = Math.max(1, Math.ceil(deadlines.length / deadlinesPerPage));
    const currentDeadlinePage = Math.min(deadlinePage, totalDeadlinePages);
    const pagedDeadlines = deadlines.slice((currentDeadlinePage - 1) * deadlinesPerPage, currentDeadlinePage * deadlinesPerPage);

    const workloadEntries = Object.entries(finalMetrics.taskStats?.by_status ?? {});
    const workloadTotal = workloadEntries.reduce((sum, [, count]) => sum + Number(count ?? 0), 0);
    const workloadBarPalette = [
        'from-violet-500 to-indigo-500',
        'from-sky-500 to-cyan-500',
        'from-amber-500 to-orange-500',
        'from-emerald-500 to-teal-500',
        'from-rose-500 to-pink-500',
    ];
    const myOpenTasks = finalMetrics.myTasks.pending + finalMetrics.myTasks.inProgress;

    const quickActionCards = [];

    if (isAdmin) {
        quickActionCards.push(
            <QuickActionCard
                key="qa-create-brand-admin"
                title="Create New Brand"
                description="Set up a new brand and start managing projects"
                href={route('project.create')}
                buttonText="Create Brand"
                color="blue"
                icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                }
            />
        );
    }

    if (isManager && finalMetrics.projectStats.total === 0) {
        quickActionCards.push(
            <QuickActionCard
                key="qa-create-brand-manager"
                title="Create New Brand"
                description="Set up a new brand and start managing projects"
                href={route('project.create')}
                buttonText="Create Brand"
                color="blue"
                icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                }
            />
        );
    }

    if (isManager && finalMetrics.projectStats.total === 1) {
        quickActionCards.push(
            <QuickActionCard
                key="qa-view-brand"
                title="View Brand"
                description="Open your brand overview"
                href={route('brands.index')}
                buttonText="View Brand"
                color="purple"
                icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h10" />
                    </svg>
                }
            />
        );
    }

    quickActionCards.push(
        <QuickActionCard
            key="qa-add-task"
            title="Add New Task"
            description="Create and assign tasks to team members"
            href={route('task.create')}
            buttonText="Add Task"
            color="green"
            icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2h-4" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5a2 2 0 012-2h4l4 4v2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11v4m-2-2h4" />
                </svg>
            }
        />
    );

    quickActionCards.push(
        <QuickActionCard
            key="qa-view-tasks"
            title="View All Tasks"
            description="Manage and track every task in one place"
            href={route('task.index')}
            buttonText="View Tasks"
            color="purple"
            icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            }
        />
    );

    useEffect(() => {
        setDeadlinePage(1);
    }, [deadlines.length]);

    useEffect(() => {
        const id = setInterval(() => {
            router.reload({ only: ['metrics'], preserveState: true, preserveScroll: true });
        }, 30000);

        return () => clearInterval(id);
    }, []);

    return (
        <AuthenticatedLayout
            // header={
            //     <div className="flex items-center justify-between">
            //         <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
            //             Welcome back, {user.name}!
            //         </h2>
            //         <div className="text-sm text-gray-500 dark:text-gray-400">
            //             {new Date().toLocaleDateString('en-US', {
            //                 weekday: 'long',
            //                 year: 'numeric',
            //                 month: 'long',
            //                 day: 'numeric',
            //             })}
            //         </div>
            //     </div>
            // }
        >
            <Head title="Dashboard" />

            <div className="space-y-8">
                {isSimpleUser ? (
                    <div className="grid grid-cols-1 gap-6">
                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Profile</h3>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Name</p>
                                    <p className="text-base font-medium">{user.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="text-base font-medium">{user.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Roles</p>
                                    <p className="text-base font-medium">{roles.join(', ') || 'User'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">User ID</p>
                                    <p className="text-base font-medium">{user.id}</p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-3">
                                <Link href={route('profile.edit')} className="btn-secondary">Edit Profile</Link>
                                <Link href={route('task.myTasks')} className="btn-primary">My Tasks</Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-4 text-center">
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-2xl font-bold mt-1">{finalMetrics.myTasks.pending}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-4 text-center">
                                <p className="text-sm text-gray-600">In Progress</p>
                                <p className="text-2xl font-bold mt-1">{finalMetrics.myTasks.inProgress}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-4 text-center">
                                <p className="text-sm text-gray-600">Completed</p>
                                <p className="text-2xl font-bold mt-1">{finalMetrics.myTasks.completed}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <section className="rounded-3xl border border-slate-100/80 bg-white/90 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
                            <div className="flex flex-col gap-6 p-6 lg:p-8">
                                <div className="flex flex-col gap-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                        Dashboard
                                    </p>
                                    <div>
                                        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
                                            Welcome back, {user.name}
                                        </h1>
                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                            Tracking ongoing activities and evaluating performance trends.
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                            {new Date().toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                    <MetricCard
                                        title="Total Brands"
                                        value={finalMetrics.projectStats.total}
                                        subtitle={`${finalMetrics.projectStats.active} active`}
                                        color="blue"
                                        icon={
                                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        }
                                    />

                                    <MetricCard
                                        title="Total Tasks"
                                        value={finalMetrics.taskStats.total}
                                        subtitle={`${finalMetrics.taskStats.completion_rate}% completed`}
                                        color="green"
                                        icon={
                                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2h-4" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5a2 2 0 012-2h4l4 4v2" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11l3 3-3 3m0-6l-3 3 3 3" />
                                            </svg>
                                        }
                                    />

                                    <MetricCard
                                        title="My Open Tasks"
                                        value={myOpenTasks}
                                        subtitle={`${finalMetrics.myTasks.completed} completed`}
                                        color="purple"
                                        icon={
                                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        }
                                    />

                                    <MetricCard
                                        title="Active Brands"
                                        value={finalMetrics.projectStats.active}
                                        subtitle={`of ${finalMetrics.projectStats.total} total`}
                                        color="yellow"
                                        icon={
                                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                                            </svg>
                                        }
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
                            <div className="space-y-6">
                                <div className="rounded-3xl border border-slate-100/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Timeline</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Upcoming deadlines</p>
                                        </div>
                                        {hasDeadlines && totalDeadlinePages > 1 && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setDeadlinePage((page) => Math.max(1, page - 1))}
                                                    disabled={currentDeadlinePage === 1}
                                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                </button>
                                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                                    Page {currentDeadlinePage} of {totalDeadlinePages}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeadlinePage((page) => Math.min(totalDeadlinePages, page + 1))}
                                                    disabled={currentDeadlinePage === totalDeadlinePages}
                                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6">
                                        {hasDeadlines ? (
                                            <ul className="space-y-6">
                                                {pagedDeadlines.map((deadline, index) => {
                                                    const isLast = index === pagedDeadlines.length - 1;
                                                    const indicatorColor = deadline.is_overdue ? 'bg-rose-500' : 'bg-indigo-500';

                                                    return (
                                                        <li key={`${deadline.task_id ?? index}-${deadline.due_date}`} className="relative pl-10">
                                                            <span className={`absolute left-0 top-4 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white shadow ${indicatorColor} dark:border-slate-900`}></span>
                                                            {!isLast && <span className="absolute left-1 top-4 bottom-[-1.5rem] w-px bg-slate-200 dark:bg-slate-800/70"></span>}
                                                            <div className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm transition hover:border-violet-200 dark:border-slate-800/80 dark:bg-slate-900/70">
                                                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                                                    <Link
                                                                        href={route('task.show', deadline.task_id)}
                                                                        className={`text-base font-semibold ${deadline.is_overdue ? 'text-rose-500 hover:text-rose-600' : 'text-violet-600 hover:text-violet-700'} transition`}
                                                                    >
                                                                        {deadline.task_name}
                                                                    </Link>
                                                                    <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                                                        {deadline.due_date}
                                                                    </span>
                                                                </div>
                                                                <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                                                    <span>{deadline.brand_name}</span>
                                                                    <span className={deadline.is_overdue ? 'text-rose-500' : 'text-emerald-500'}>{deadline.days_remaining}</span>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        ) : (
                                            <div className="rounded-2xl border border-dashed border-slate-200/80 px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                                <svg className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="mt-3">No upcoming deadlines</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-slate-100/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Latest updates across your workspace</p>
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        {finalMetrics.recentActivity && finalMetrics.recentActivity.length > 0 ? (
                                            <ul className="space-y-5">
                                                {finalMetrics.recentActivity.slice(0, 5).map((activity, index) => (
                                                    <li key={index} className="relative pl-8">
                                                        <span className="absolute left-0 top-2.5 h-2.5 w-2.5 rounded-full bg-sky-500"></span>
                                                        <div className="flex flex-col gap-1">
                                                            <p className="text-sm text-slate-700 dark:text-slate-200">{activity.description}</p>
                                                            <span className="text-xs text-slate-400">{activity.time}</span>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="rounded-2xl border border-dashed border-slate-200/80 px-6 py-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                                <svg className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className="mt-3">No recent activity yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="rounded-3xl border border-slate-100/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Workload by Status</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Snapshot of current tasks</p>
                                        </div>
                                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{finalMetrics.taskStats.total} tasks</span>
                                    </div>
                                    <div className="mt-6 space-y-4">
                                        {workloadEntries.length > 0 ? (
                                            workloadEntries.map(([status, count], index) => {
                                                const numericCount = Number(count ?? 0);
                                                const percentage = workloadTotal === 0 ? 0 : Math.round((numericCount / workloadTotal) * 100);
                                                const barClass = workloadBarPalette[index % workloadBarPalette.length];

                                                return (
                                                    <div key={status} className="space-y-2">
                                                        <div className="flex items-center justify-between text-sm font-medium text-slate-600 dark:text-slate-300">
                                                            <span>{formatStatusLabel(status)}</span>
                                                            <span>{numericCount} • {percentage}%</span>
                                                        </div>
                                                        <div className="h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                                                            <div
                                                                className={`h-full rounded-full bg-gradient-to-r ${barClass}`}
                                                                style={{ width: `${Math.max(percentage, 0)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="rounded-2xl border border-dashed border-slate-200/80 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                                No workload data yet.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-slate-100/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Speed up your workflow</p>
                                    </div>
                                    <div className="mt-6 space-y-4">
                                        {quickActionCards.length > 0 ? (
                                            quickActionCards
                                        ) : (
                                            <div className="rounded-2xl border border-dashed border-slate-200/80 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                                No quick actions available.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
