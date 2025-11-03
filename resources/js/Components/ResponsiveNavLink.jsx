import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 focus:border-indigo-600 focus:bg-indigo-100 focus:text-indigo-800 dark:border-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-200 dark:focus:border-indigo-400 dark:focus:bg-indigo-500/30 dark:focus:text-indigo-100'
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 focus:border-gray-300 focus:bg-gray-50 focus:text-gray-800 dark:text-gray-400 dark:hover:border-indigo-500/30 dark:hover:bg-slate-800 dark:hover:text-gray-100 dark:focus:border-indigo-500/30 dark:focus:bg-slate-800 dark:focus:text-gray-100'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
