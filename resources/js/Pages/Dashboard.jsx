import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useEffect } from 'react';

// Metric Card Component
function MetricCard({ title, value, subtitle, icon, color = "blue", trend }) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600 border-blue-200",
        green: "bg-green-50 text-green-600 border-green-200",
        yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
        purple: "bg-purple-50 text-purple-600 border-purple-200",
        red: "bg-red-50 text-red-600 border-red-200"
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
                {icon && (
                    <div className={`p-3 rounded-full ${colorClasses[color]}`}>
                        {icon}
                    </div>
                )}
            </div>
            {trend && (
                <div className="mt-4 flex items-center">
                    <span className={`text-sm font-medium ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.positive ? '↗' : '↘'} {trend.value}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">{trend.label}</span>
                </div>
            )}
        </div>
    );
}

// Quick Action Card Component
function QuickActionCard({ title, description, href, buttonText, icon, color = "blue" }) {
    const colorClasses = {
        blue: "bg-blue-500 hover:bg-blue-600",
        green: "bg-green-500 hover:bg-green-600",
        purple: "bg-purple-500 hover:bg-purple-600"
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start space-x-4">
                {icon && (
                    <div className="flex-shrink-0">
                        <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600`}>
                            {icon}
                        </div>
                    </div>
                )}
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <p className="text-gray-600 mt-1">{description}</p>
                    <Link
                        href={href}
                        className={`inline-flex items-center px-4 py-2 mt-4 text-sm font-medium text-white rounded-md ${colorClasses[color]} transition-colors`}
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

    // Default metrics if not provided
    const defaultMetrics = {
        projectStats: { total: 0, active: 0, completed: 0, completion_rate: 0 },
        taskStats: { total: 0, by_status: {}, completion_rate: 0 },
        myTasks: { pending: 0, inProgress: 0, completed: 0 },
        recentActivity: [],
        upcomingDeadlines: []
    };

    const finalMetrics = { ...defaultMetrics, ...metrics };

    // Auto-refresh metrics every 30 seconds (real-time feel)
    useEffect(() => {
        const id = setInterval(() => {
            router.reload({ only: ['metrics'], preserveState: true, preserveScroll: true });
        }, 30000);
        return () => clearInterval(id);
    }, []);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Welcome back, {user.name}!
                    </h2>
                    <div className="text-sm text-gray-500">
                        {new Date().toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Metrics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Total Brands"
                        value={finalMetrics.projectStats.total}
                        subtitle={`${finalMetrics.projectStats.active} active`}
                        color="blue"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        }
                    />
                    
                    <MetricCard
                        title="My Tasks"
                        value={finalMetrics.myTasks.pending + finalMetrics.myTasks.inProgress}
                        subtitle={`${finalMetrics.myTasks.completed} completed`}
                        color="purple"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        }
                    />
                    
                    <MetricCard
                        title="Active Brands"
                        value={finalMetrics.projectStats.active}
                        subtitle={`of ${finalMetrics.projectStats.total} total`}
                        color="yellow"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                            </svg>
                        }
                    />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Admins: always show Create Brand */}
                    {roles.includes('Admin') && (
                        <QuickActionCard
                            title="Create New Brand"
                            description="Set up a new brand and start managing projects"
                            href={route("project.create")}
                            buttonText="Create Brand"
                            color="blue"
                            icon={
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            }
                        />
                    )}

                    {/* Managers: if zero brands -> Create; if one brand -> View Brand; otherwise hide */}
                    {roles.includes('Manager') && finalMetrics.projectStats.total === 0 && (
                        <QuickActionCard
                            title="Create New Brand"
                            description="Set up a new brand and start managing projects"
                            href={route("project.create")}
                            buttonText="Create Brand"
                            color="blue"
                            icon={
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            }
                        />
                    )}
                    {roles.includes('Manager') && finalMetrics.projectStats.total === 1 && (
                        <QuickActionCard
                            title="View Brand"
                            description="Open your brand overview"
                            href={route("brands.index")}
                            buttonText="View Brand"
                            color="purple"
                            icon={
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10" />
                                </svg>
                            }
                        />
                    )}
                    
                    <QuickActionCard
                        title="Add New Task"
                        description="Create and assign tasks to team members"
                        href={route("task.create")}
                        buttonText="Add Task"
                        color="green"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        }
                    />
                    
                    <QuickActionCard
                        title="View All Tasks"
                        description="Manage and track all your tasks in one place"
                        href={route("task.index")}
                        buttonText="View Tasks"
                        color="purple"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        }
                    />
                </div>

                {/* Recent Activity & Upcoming Deadlines */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                        </div>
                        <div className="p-6">
                            {finalMetrics.recentActivity && finalMetrics.recentActivity.length > 0 ? (
                                <div className="space-y-4">
                                    {finalMetrics.recentActivity.slice(0, 5).map((activity, index) => (
                                        <div key={index} className="flex items-start space-x-3">
                                            <div className="flex-shrink-0">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-900">{activity.description}</p>
                                                <p className="text-xs text-gray-500">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-500">No recent activity</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Deadlines */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
                        </div>
                        <div className="p-6">
                            {finalMetrics.upcomingDeadlines && finalMetrics.upcomingDeadlines.length > 0 ? (
                                <div className="space-y-4">
                                    {finalMetrics.upcomingDeadlines.slice(0, 5).map((deadline, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{deadline.task_name}</p>
                                                <p className="text-xs text-gray-500">{deadline.brand_name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-900">{deadline.due_date}</p>
                                                <p className={`text-xs ${deadline.is_overdue ? 'text-red-500' : 'text-gray-500'}`}>
                                                    {deadline.days_remaining}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-500">No upcoming deadlines</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
