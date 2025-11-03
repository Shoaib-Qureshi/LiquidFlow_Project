import { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Pagination from "@/Components/Pagination";
import SelectInput from "@/Components/SelectInput";
import TextInput from "@/Components/TextInput";
import { Head, Link, router } from "@inertiajs/react";

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function Index({ auth, clients, filters = {}, supportsBrandLinking = false }) {
  const [search, setSearch] = useState(filters.search ?? "");
  const [status, setStatus] = useState(filters.status ?? "");

  useEffect(() => {
    setSearch(filters.search ?? "");
    setStatus(filters.status ?? "");
  }, [filters.search, filters.status]);

  const applyFilters = (nextFilters) => {
    router.get(route("clients.index"), nextFilters, {
      preserveScroll: true,
      preserveState: true,
      replace: true,
    });
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    applyFilters({ ...filters, search });
  };

  const handleStatusChange = (event) => {
    const value = event.target.value;
    setStatus(value);
    applyFilters({ ...filters, status: value || undefined, search });
  };

  const clientData = clients?.data ?? [];

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Clients
          </h2>
          <Link href={route("clients.create")} className="btn-primary">
            Add client
          </Link>
        </div>
      }
    >
      <Head title="Clients" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="card-soft mb-6">
            <div className="p-6">
              <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4 lg:flex-row lg:items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Search
                  </label>
                  <TextInput
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name"
                    className="w-full"
                  />
                </div>
                <div className="w-full lg:w-48">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Status
                  </label>
                  <SelectInput value={status} onChange={handleStatusChange} className="w-full">
                    {statusOptions.map((option) => (
                      <option key={option.value || "all"} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </SelectInput>
                </div>
                <div className="flex">
                  <button type="submit" className="btn-secondary">
                    Apply
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="card-soft">
            <div className="p-6 overflow-x-auto">
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
                      Website
                    </th>
                    {supportsBrandLinking && (
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Brands
                      </th>
                    )}
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {clientData.length === 0 && (
                    <tr>
                      <td colSpan={supportsBrandLinking ? 6 : 5} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                        No clients found.
                      </td>
                    </tr>
                  )}
                  {clientData.map((client) => (
                    <tr key={client.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link
                          href={route("clients.show", client.id)}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          {client.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            client.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-300"
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {client.website ? (
                          <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            {client.website}
                          </a>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">—</span>
                        )}
                      </td>
                      {supportsBrandLinking && (
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {client.brands_count ?? 0}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {client.created_at ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Link href={route("clients.edit", client.id)} className="text-sm text-indigo-600 hover:text-indigo-500 mr-3">
                          Edit
                        </Link>
                        <Link href={route("clients.show", client.id)} className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-500">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
              <Pagination links={clients?.links ?? clients?.meta?.links ?? []} />
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
