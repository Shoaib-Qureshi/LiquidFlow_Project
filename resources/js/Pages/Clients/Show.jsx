import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";

export default function Show({ auth, client, supportsBrandLinking = false }) {
  const brands = supportsBrandLinking ? client.brands ?? [] : [];
  const logoUrl = client.logo_path ? `/storage/${client.logo_path}` : null;
  const roles = auth?.roles ?? [];
  const canCreateBrand = supportsBrandLinking && (roles.includes("Admin") || roles.includes("Manager"));

  const handleDelete = () => {
    if (!confirm(`Delete client "${client.name}"? This cannot be undone.`)) {
      return;
    }

    router.delete(route("clients.destroy", client.id), {
      preserveScroll: true,
    });
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {client.name}
          </h2>
          <div className="flex items-center gap-3">
            <Link href={route("clients.index")} className="btn-secondary">
              Back to list
            </Link>
            <Link href={route("clients.edit", client.id)} className="btn-primary">
              Edit
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              className="btn-secondary border-red-600 text-red-600 hover:bg-red-600 hover:text-white dark:border-red-400 dark:text-red-300 dark:hover:bg-red-500 dark:hover:text-white"
            >
              Delete
            </button>
          </div>
        </div>
      }
    >
      <Head title={client.name} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          <div className="card-soft">
            <div className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Overview</h3>
                    <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm text-gray-500 dark:text-gray-400">Status</dt>
                        <dd className="mt-1">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              client.status === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-300"
                            }`}
                          >
                            {client.status}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500 dark:text-gray-400">Website</dt>
                        <dd className="mt-1">
                          {client.website ? (
                            <a
                              href={client.website}
                              className="text-sm text-blue-600 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {client.website}
                            </a>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">N/A</span>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500 dark:text-gray-400">Client Email</dt>
                        <dd className="mt-1">
                          {client.contact_email ? (
                            <a href={`mailto:${client.contact_email}`} className="text-sm text-blue-600 hover:underline">
                              {client.contact_email}
                            </a>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">N/A</span>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500 dark:text-gray-400">Contact Phone</dt>
                        <dd className="mt-1">
                          {client.contact_phone ?? <span className="text-gray-500 dark:text-gray-400">N/A</span>}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div className="md:w-48">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-24 w-24 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-slate-700">
                        {logoUrl ? (
                          <img src={logoUrl} alt={`${client.name} logo`} className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-xl font-semibold text-gray-400 dark:text-gray-600">
                            {client.name?.charAt(0) ?? "?"}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        Created {client.created_at ?? "N/A"}
                        <br />
                        Updated {client.updated_at ?? "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {supportsBrandLinking && (
            <div className="card-soft">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Brands</h3>
                  <div className="flex items-center gap-2">
                    <Link href={route("brands.index")} className="text-sm text-indigo-600 hover:text-indigo-500">
                      Manage brands
                    </Link>
                    {canCreateBrand && (
                      <Link
                        href={route("project.create", { client_id: client.id })}
                        className="btn-primary"
                      >
                        Add Brand
                      </Link>
                    )}
                  </div>
                </div>
                {brands.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400">No brands are linked to this client yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                      <thead className="bg-gray-50 dark:bg-slate-800">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Tasks
                          </th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                        {brands.map((brand) => (
                          <tr key={brand.id}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <Link href={route("brands.show", brand.id)} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                {brand.name}
                              </Link>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  brand.status === "active"
                                    ? "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-300"
                                    : "bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-gray-200"
                                }`}
                              >
                                {brand.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                              {brand.tasks_count ?? 0}
                            </td>
                            <td className="px-4 py-3 text-right text-sm">
                              <Link href={route("brands.show", brand.id)} className="text-indigo-600 hover:text-indigo-500">
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}


