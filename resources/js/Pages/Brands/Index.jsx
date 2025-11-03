import React, { useState } from 'react'
import Authenticated from '@/Layouts/AuthenticatedLayout'
import { Head, Link, usePage, router } from '@inertiajs/react'

function BrandCard({ brand }) {
    return (
        <div className="card-soft overflow-hidden rounded-lg shadow-sm flex flex-col">
            <Link href={route('brands.show', brand.id)}>
                <div className="w-full h-40 bg-gradient-to-r from-indigo-500 to-pink-500 flex items-center justify-center">
                    <h3 className="text-white text-xl font-bold">{brand.name.charAt(0)}</h3>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{brand.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{brand.description ?? 'No description'}</p>
                        {brand.client && (
                            <div className="mt-2 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Client: <span className="text-gray-700 dark:text-gray-200 font-medium">{brand.client.name}</span>
                            </div>
                        )}
                        <div className="mt-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${brand.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200'
                                }`}>
                                {brand.status}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">

                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            <div>Tasks: {brand.taskStats.total}</div>
                            <div>Active: {brand.taskStats.active}</div>
                            <div>Completed: {brand.taskStats.completed}</div>
                        </div>
                        <Link href={route('brands.show', brand.id)} className="text-blue-600 dark:text-blue-400 hover:underline dark:hover:text-blue-300">View</Link>
                    </div>
                </div>
            </Link>
        </div>
    )
}

export default function Index({ brands = { data: [] }, can = {} }) {
    const items = brands.data ?? brands
    const { props } = usePage()
    const auth = props?.auth ?? {}
    const permissions = auth.permissions ?? []
    const roles = auth.roles ?? []
    const [selectedBrandId, setSelectedBrandId] = useState('')

    // Decide if the current user should be allowed to create a brand in the UI
    const canCreate = roles.includes('Admin') ||
        roles.includes('Manager') ||
        permissions.includes('create_brand')

    // Filter brands based on selected brand
    const filteredItems = selectedBrandId
        ? items.filter(brand => brand.id.toString() === selectedBrandId)
        : items

    const handleBrandFilter = (brandId) => {
        setSelectedBrandId(brandId)
    }

    return (
        <Authenticated header={<h2 className="font-semibold text-xl">Brands</h2>}>
            <Head title="Brands" />

            {/* Admin Brand Filter */}
            {roles.includes('Admin') && (
                <div className="mb-6 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Filter by Brand:</label>
                        <select
                            value={selectedBrandId}
                            onChange={(e) => handleBrandFilter(e.target.value)}
                            className="rounded-md border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="">All Brands</option>
                            {items.map((brand) => (
                                <option key={brand.id} value={brand.id}>
                                    {brand.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-300">Showing {filteredItems.length} brands</div>
                </div>

                <div>
                    {canCreate && (
                        <Link href={route('project.create')} className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-md shadow-sm">Add Brand</Link>
                    )}
                </div>
            </div>

            {filteredItems.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400 text-lg">No brands found</div>
                    <div className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                        {selectedBrandId ? 'No brands match the selected filter.' : (can.create ? 'Get started by creating your first brand.' : 'No brands available.')}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems.map((brand) => (
                        <BrandCard key={brand.id} brand={brand} />
                    ))}
                </div>
            )}

            <div className="mt-8">
                {(brands.links || brands.meta?.links) && (
                    (() => {
                        const rawLinks = brands.links ?? brands.meta?.links;
                        // If links is a raw HTML string (older/irregular output), strip any full urls and render it as a single block
                        if (typeof rawLinks === 'string') {
                            const stripped = rawLinks.replace(/https?:\/\/[^\s"'<]+/g, '');
                            return (
                                <div className="prose text-sm text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: stripped }} />
                            );
                        }

                        const links = Array.isArray(rawLinks) ? rawLinks : Object.values(rawLinks || {});
                        // remove any completely null/undefined entries and non-object primitives
                        const items = (links || []).filter((l) => l && (typeof l === 'object' || typeof l === 'string'));
                        return (
                            <nav className="flex items-center space-x-2" aria-label="Pagination">
                                {items.map((link, idx) => {
                                    // If the item is a primitive string, render it as HTML block
                                    if (typeof link === 'string') {
                                        const stripped = String(link).replace(/https?:\/\/[^\s"'<]+/g, '');
                                        return (
                                            <span key={idx} className="px-3 py-1 text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: stripped }} />
                                        );
                                    }

                                    const url = link?.url ?? null;
                                    const label = link?.label ?? String(link ?? '');
                                    const isActive = !!link?.active;

                                    // Render disabled/placeholder (no url)
                                    if (!url) {
                                        const safeLabel = String(label).replace(/https?:\/\/[^\s"'<]+/g, '');
                                        return (
                                            <span
                                                key={idx}
                                                className={`px-3 py-1 rounded ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400'}`}
                                                dangerouslySetInnerHTML={{ __html: safeLabel }}
                                            />
                                        );
                                    }

                                    return (
                                        <Link
                                            key={idx}
                                            href={url}
                                            className={`px-3 py-1 rounded ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                                            dangerouslySetInnerHTML={{ __html: String(label).replace(/https?:\/\/[^\s"'<]+/g, '') }}
                                        />
                                    );
                                })}
                            </nav>
                        );
                    })()
                )}
            </div>
        </Authenticated>
    )
}
