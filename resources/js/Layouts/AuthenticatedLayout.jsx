import React, { useState } from 'react'
import Dropdown from '@/Components/Dropdown'
import NavLink from '@/Components/NavLink'
import ResponsiveNavLink from '@/Components/ResponsiveNavLink'
import { Link, usePage } from '@inertiajs/react'

export default function Authenticated({ header, children, user: userProp }) {
    const page = usePage()
    const user = userProp ?? page.props?.auth?.user ?? { name: '', email: '' }
    const auth = page.props?.auth ?? {}
    const roles = auth.roles ?? []
    const [open, setOpen] = useState(false)

    const isAdmin = roles.includes('Admin')
    const isManager = roles.includes('Manager')

    return (
        <div className="min-h-screen app-gradient">
            <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-4 lg:gap-6">
                            <div className="shrink-0">
                                <Link href={route('dashboard')} className="flex items-center gap-2 lg:gap-3">
                                    <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg brand-badge flex items-center justify-center text-sm lg:text-base">B</div>
                                    <div className="text-base lg:text-lg font-semibold text-gray-900">BrandLab</div>
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
                                <NavLink href={route('task.index')} active={route().current('task.*')} className="px-3 py-2 text-sm font-medium">
                                    Tasks
                                </NavLink>
                                {isAdmin && (
                                    <NavLink href={route('admin.index')} active={route().current('admin.*')} className="px-3 py-2 text-sm font-medium">
                                        Admin
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        {/* Desktop User Menu */}
                        <div className="hidden md:flex md:items-center md:space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="hidden lg:block text-right">
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                    <div className="text-xs text-gray-500 capitalize">{roles.join(', ')}</div>
                                </div>
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="flex items-center p-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full transition-colors">
                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-medium text-gray-600">
                                                    {user.name?.charAt(0)?.toUpperCase()}
                                                </span>
                                            </div>
                                            <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                        <Dropdown.Link href={route('profile.edit')}>Profile Settings</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button" className="text-red-600">
                                            Sign Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex items-center md:hidden">
                            <button 
                                onClick={() => setOpen(!open)} 
                                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                aria-expanded="false"
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

                {/* Mobile menu */}
                <div className={`md:hidden transition-all duration-300 ease-in-out ${open ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="bg-white border-t border-gray-200 shadow-lg">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')} className="block px-3 py-2 text-base font-medium">
                                Dashboard
                            </ResponsiveNavLink>
                            {isManager && page.props?.auth?.accessible_brand_count === 1 && page.props?.auth?.accessible_single_brand_id ? (
                                <ResponsiveNavLink href={route('brands.show', page.props.auth.accessible_single_brand_id)} active={route().current('brands.show')} className="block px-3 py-2 text-base font-medium">
                                    Brands
                                </ResponsiveNavLink>
                            ) : (
                                <ResponsiveNavLink href={route('project.index')} active={route().current('project.*')} className="block px-3 py-2 text-base font-medium">
                                    Brands
                                </ResponsiveNavLink>
                            )}
                            <ResponsiveNavLink href={route('task.index')} active={route().current('task.*')} className="block px-3 py-2 text-base font-medium">
                                Tasks
                            </ResponsiveNavLink>
                            {isAdmin && (
                                <ResponsiveNavLink href={route('admin.index')} active={route().current('admin.*')} className="block px-3 py-2 text-base font-medium">
                                    Admin
                                </ResponsiveNavLink>
                            )}
                        </div>
                        <div className="border-t border-gray-200 pt-4 pb-3">
                            <div className="px-4 flex items-center">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-600">
                                        {user.name?.charAt(0)?.toUpperCase()}
                                    </span>
                                </div>
                                <div className="ml-3">
                                    <div className="text-base font-medium text-gray-800">{user.name}</div>
                                    <div className="text-sm font-medium text-gray-500">{user.email}</div>
                                    <div className="text-xs text-gray-400 capitalize">{roles.join(', ')}</div>
                                </div>
                            </div>
                            <div className="mt-3 space-y-1">
                                <ResponsiveNavLink href={route('profile.edit')} className="block px-4 py-2 text-base font-medium">
                                    Profile Settings
                                </ResponsiveNavLink>
                                <ResponsiveNavLink method="post" href={route('logout')} as="button" className="block w-full text-left px-4 py-2 text-base font-medium text-red-600">
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
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
                                {header}
                            </div>
                        </div>
                    )}
                    {children}
                </div>
            </main>
        </div>
    )
}
