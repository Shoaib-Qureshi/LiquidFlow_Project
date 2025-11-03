import React, { useEffect, useState } from 'react';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';

export default function Authenticated({ header, children, user: userProp }) {
    const page = usePage();
    const user = userProp ?? page.props?.auth?.user ?? { name: '', email: '' };
    const auth = page.props?.auth ?? {};
    const roles = auth.roles ?? [];
    const [open, setOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }
        const stored = window.localStorage.getItem('lf.darkMode');
        if (stored !== null) {
            return stored === 'true';
        }
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        const root = window.document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        window.localStorage.setItem('lf.darkMode', String(darkMode));
    }, [darkMode]);

    const toggleDarkMode = () => setDarkMode((value) => !value);

    const isAdmin = roles.includes('Admin');
    const isManager = roles.includes('Manager');

    const SunIcon = (
        <svg className="h-5 w-5" viewBox="0 0 240 240" fill="currentColor">
            <path d="M58.57,25.81c-2.13-3.67-0.87-8.38,2.8-10.51c3.67-2.13,8.38-0.88,10.51,2.8l9.88,17.1c2.13,3.67,0.87,8.38-2.8,10.51 c-3.67,2.13-8.38,0.88-10.51-2.8L58.57,25.81L58.57,25.81z M120,51.17c19.01,0,36.21,7.7,48.67,20.16 C181.12,83.79,188.83,101,188.83,120c0,19.01-7.7,36.21-20.16,48.67c-12.46,12.46-29.66,20.16-48.67,20.16 c-19.01,0-36.21-7.7-48.67-20.16C58.88,156.21,51.17,139.01,51.17,120c0-19.01,7.7-36.21,20.16-48.67 C83.79,58.88,101,51.17,120,51.17L120,51.17z M158.27,81.73c-9.79-9.79-23.32-15.85-38.27-15.85c-14.95,0-28.48,6.06-38.27,15.85 c-9.79,9.79-15.85,23.32-15.85,38.27c0,14.95,6.06,28.48,15.85,38.27c9.79,9.79,23.32,15.85,38.27,15.85 c14.95,0,28.48-6.06,38.27-15.85c9.79-9.79,15.85-23.32,15.85-38.27C174.12,105.05,168.06,91.52,158.27,81.73L158.27,81.73z M113.88,7.71c0-4.26,3.45-7.71,7.71-7.71c4.26,0,7.71,3.45,7.71,7.71v19.75c0,4.26-3.45,7.71-7.71,7.71 c-4.26,0-7.71-3.45-7.71-7.71V7.71L113.88,7.71z M170.87,19.72c2.11-3.67,6.8-4.94,10.48-2.83c3.67,2.11,4.94,6.8,2.83,10.48 l-9.88,17.1c-2.11,3.67-6.8,4.94-10.48,2.83c-3.67-2.11-4.94-6.8-2.83-10.48L170.87,19.72L170.87,19.72z M214.19,58.57 c3.67-2.13,8.38-0.87,10.51,2.8c2.13,3.67,0.88,8.38-2.8,10.51l-17.1,9.88c-3.67,2.13-8.38,0.87-10.51-2.8 c-2.13-3.67-0.88-8.38,2.8-10.51L214.19,58.57L214.19,58.57z M232.29,113.88c4.26,0,7.71,3.45,7.71,7.71 c0,4.26-3.45,7.71-7.71,7.71h-19.75c-4.26,0-7.71-3.45-7.71-7.71c0-4.26,3.45-7.71,7.71-7.71H232.29L232.29,113.88z M220.28,170.87 c3.67,2.11,4.94,6.8,2.83,10.48c-2.11,3.67-6.8,4.94-10.48,2.83l-17.1-9.88c-3.67-2.11-4.94-6.8-2.83-10.48 c2.11-3.67,6.8-4.94,10.48-2.83L220.28,170.87L220.28,170.87z M181.43,214.19c2.13,3.67,0.87,8.38-2.8,10.51 c-3.67,2.13-8.38,0.88-10.51-2.8l-9.88-17.1c-2.13-3.67-0.87-8.38,2.8-10.51c3.67-2.13,8.38-0.88,10.51,2.8L181.43,214.19 L181.43,214.19z M126.12,232.29c0,4.26-3.45,7.71-7.71,7.71c-4.26,0-7.71-3.45-7.71-7.71v-19.75c0-4.26,3.45-7.71,7.71-7.71 c4.26,0,7.71,3.45,7.71,7.71V232.29L126.12,232.29z M69.13,220.28c-2.11,3.67-6.8,4.94-10.48,2.83c-3.67-2.11-4.94-6.8-2.83-10.48 l9.88-17.1c2.11-3.67,6.8-4.94,10.48-2.83c3.67,2.11,4.94,6.8,2.83,10.48L69.13,220.28L69.13,220.28z M25.81,181.43 c-3.67,2.13-8.38,0.87-10.51-2.8c-2.13-3.67-0.88-8.38,2.8-10.51l17.1-9.88c3.67-2.13,8.38-0.87,10.51,2.8 c2.13,3.67,0.88,8.38-2.8,10.51L25.81,181.43L25.81,181.43z M7.71,126.12c-4.26,0-7.71-3.45-7.71-7.71c0-4.26,3.45-7.71,7.71-7.71 h19.75c4.26,0,7.71,3.45,7.71,7.71c0,4.26-3.45,7.71-7.71,7.71H7.71L7.71,126.12z M19.72,69.13c-3.67-2.11-4.94-6.8-2.83-10.48 c2.11-3.67,6.8-4.94,10.48-2.83l17.1,9.88c3.67,2.11,4.94,6.8,2.83,10.48c-2.11,3.67-6.8,4.94-10.48,2.83L19.72,69.13L19.72,69.13z" />
        </svg>
    );

    const MoonIcon = (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707 8 8 0 1017.293 13.293z" />
        </svg>
    );

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-gray-100' : 'app-gradient text-gray-900'}`}>
            <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800 sticky top-0 z-40 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-4 lg:gap-6">
                            <div className="shrink-0">
                                <Link href={route('dashboard')} className="flex items-center gap-2 lg:gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/40 flex items-center justify-center text-sm lg:text-base font-semibold text-indigo-600 dark:text-indigo-300 dark:border-indigo-400/40">
                                        LF
                                    </div>
                                    <span className="text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-wide">
                                        LiquidFlow
                                    </span>
                                </Link>
                            </div>
                            <div className="hidden md:flex space-x-1 lg:space-x-4">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')} className="px-3 py-2 text-sm font-medium">
                                    Dashboard
                                </NavLink>
                                {isManager && page.props?.auth?.accessible_brand_count === 1 && page.props?.auth?.accessible_single_brand_id ? (
                                    <NavLink href={route('brands.show', page.props.auth.accessible_single_brand_id)} active={route().current('brands.show')} className="px-3 py-2 text-sm font-medium">
                                        Brands
                                    </NavLink>
                                ) : (
                                    <NavLink href={route('project.index')} active={route().current('project.*')} className="px-3 py-2 text-sm font-medium">
                                        Brands
                                    </NavLink>
                                )}
                                {isAdmin && (
                                    <NavLink href={route('clients.index')} active={route().current('clients.*')} className="px-3 py-2 text-sm font-medium">
                                        Clients
                                    </NavLink>
                                )}
                                <NavLink href={route('task.index')} active={route().current('task.*')} className="px-3 py-2 text-sm font-medium">
                                    Tasks
                                </NavLink>
                                <NavLink href={route('subscriptions.index')} active={route().current('subscriptions.index')} className="px-3 py-2 text-sm font-medium">
                                    Subscriptions
                                </NavLink>
                                {isManager && (
                                    <NavLink href={route('user.index')} active={route().current('user.*')} className="px-3 py-2 text-sm font-medium">
                                        Team Members
                                    </NavLink>
                                )}
                                {isAdmin && (
                                    <NavLink href={route('admin.index')} active={route().current('admin.*')} className="px-3 py-2 text-sm font-medium">
                                        Admin
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        <div className="hidden md:flex md:items-center md:space-x-4">
                            <button
                                type="button"
                                onClick={toggleDarkMode}
                                className="p-2 rounded-full border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                                aria-label="Toggle dark mode"
                            >
                                {darkMode ? SunIcon : MoonIcon}
                            </button>
                            <div className="flex items-center space-x-2">
                                <div className="hidden lg:block text-right">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{roles.join(', ')}</div>
                                </div>
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="flex items-center p-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full transition-colors">
                                            <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-200">
                                                    {user.name?.charAt(0)?.toUpperCase()}
                                                </span>
                                            </div>
                                            <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.085l3.71-3.854a.75.75 0 111.08 1.04l-4.24 4.4a.75.75 0 01-1.08 0l-4.24-4.4a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                        </div>
                                        <Dropdown.Link href={route('profile.edit')} className="dark:text-gray-200 dark:hover:bg-slate-800">
                                            Profile Settings
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button" className="text-red-600 dark:text-red-400">
                                            Sign Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="flex items-center md:hidden">
                            <button
                                type="button"
                                onClick={toggleDarkMode}
                                className="mr-3 inline-flex items-center justify-center p-2 rounded-full border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                                aria-label="Toggle dark mode"
                            >
                                {darkMode ? SunIcon : MoonIcon}
                            </button>
                            <button
                                onClick={() => setOpen(!open)}
                                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                aria-expanded={open}
                            >
                                <span className="sr-only">Open main menu</span>
                                {!open ? (
                                    <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                ) : (
                                    <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className={`md:hidden transition-all duration-300 ease-in-out ${open ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 shadow-lg">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')} className="block px-3 py-2 text-base font-medium dark:text-gray-200">
                                Dashboard
                            </ResponsiveNavLink>
                            {isManager && page.props?.auth?.accessible_brand_count === 1 && page.props?.auth?.accessible_single_brand_id ? (
                                <ResponsiveNavLink href={route('brands.show', page.props.auth.accessible_single_brand_id)} active={route().current('brands.show')} className="block px-3 py-2 text-base font-medium dark:text-gray-200">
                                    Brands
                                </ResponsiveNavLink>
                            ) : (
                                <ResponsiveNavLink href={route('project.index')} active={route().current('project.*')} className="block px-3 py-2 text-base font-medium dark:text-gray-200">
                                    Brands
                                </ResponsiveNavLink>
                            )}
                            {isAdmin && (
                                <ResponsiveNavLink href={route('clients.index')} active={route().current('clients.*')} className="block px-3 py-2 text-base font-medium dark:text-gray-200">
                                    Clients
                                </ResponsiveNavLink>
                            )}
                            <ResponsiveNavLink href={route('task.index')} active={route().current('task.*')} className="block px-3 py-2 text-base font-medium dark:text-gray-200">
                                Tasks
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('subscriptions.index')} active={route().current('subscriptions.index')} className="block px-3 py-2 text-base font-medium dark:text-gray-200">
                                Subscriptions
                            </ResponsiveNavLink>
                            {isManager && (
                                <ResponsiveNavLink href={route('user.index')} active={route().current('user.*')} className="block px-3 py-2 text-base font-medium dark:text-gray-200">
                                    Team Members
                                </ResponsiveNavLink>
                            )}
                            {isAdmin && (
                                <ResponsiveNavLink href={route('admin.index')} active={route().current('admin.*')} className="block px-3 py-2 text-base font-medium dark:text-gray-200">
                                    Admin
                                </ResponsiveNavLink>
                            )}
                        </div>
                        <div className="border-t border-gray-200 dark:border-slate-800 pt-4 pb-3">
                            <div className="px-4 flex items-center">
                                <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-200">
                                        {user.name?.charAt(0)?.toUpperCase()}
                                    </span>
                                </div>
                                <div className="ml-3">
                                    <div className="text-base font-medium text-gray-800 dark:text-gray-100">{user.name}</div>
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user.email}</div>
                                    <div className="text-xs text-gray-400 dark:text-gray-500 capitalize">{roles.join(', ')}</div>
                                </div>
                            </div>
                            <div className="mt-3 space-y-1">
                                <ResponsiveNavLink href={route('profile.edit')} className="block px-4 py-2 text-base font-medium dark:text-gray-200">
                                    Profile Settings
                                </ResponsiveNavLink>
                                <ResponsiveNavLink method="post" href={route('logout')} as="button" className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 dark:text-red-400">
                                    Sign Out
                                </ResponsiveNavLink>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-4 lg:py-8 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {header && (
                        <div className="mb-4 lg:mb-6">
                            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-4 lg:p-6">
                                {header}
                            </div>
                        </div>
                    )}
                    {children}
                </div>
            </main>
        </div>
    );
}
