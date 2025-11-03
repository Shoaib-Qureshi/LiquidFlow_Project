import Pagination from "@/Components/Pagination";
import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import TableHeading from "@/Components/TableHeading";

export default function Index({ auth, users, queryParams = null, success }) {
  queryParams = queryParams || {};

  const searchFieldChanged = (name, value) => {
    if (value) {
      queryParams[name] = value;
    } else {
      delete queryParams[name];
    }

    router.get(route("user.index"), queryParams, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const onKeyPress = (name, e) => {
    if (e.key !== "Enter") return;

    searchFieldChanged(name, e.target.value);
  };

  const sortChanged = (name) => {
    if (name === queryParams.sort_field) {
      queryParams.sort_direction =
        queryParams.sort_direction === "asc" ? "desc" : "asc";
    } else {
      queryParams.sort_field = name;
      queryParams.sort_direction = "asc";
    }
    router.get(route("user.index"), queryParams, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const deleteUser = (user) => {
    if (!window.confirm("Are you sure you want to delete the user?")) {
      return;
    }
    router.delete(route("user.destroy", user.id), {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const isManager = auth?.user?.roles?.some((role) => role.name === "Manager");

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Team Directory
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage the collaborators who have access to LiquidFlow and invite
            new teammates in seconds.
          </p>
        </div>
      }
    >
      <Head title="Team Members" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-12">
        {success && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-emerald-700 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)]">
          <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 p-[1px] shadow-lg">
            <div className="rounded-[calc(1.5rem-1px)] bg-white dark:bg-slate-900 p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Invite your next collaborator
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 max-w-2xl">
                  Share projects, assign tasks, and keep everyone aligned. New
                  team members receive an invite email with a secure login.
                </p>
              </div>
              {isManager && (
                <Link
                  href={route("user.create")}
                  className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-600 shadow-sm ring-1 ring-inset ring-white/60 transition hover:bg-blue-50 dark:bg-slate-800 dark:text-blue-300 dark:hover:bg-slate-700"
                >
                  Invite Team Member
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-gray-200 px-4 py-4 sm:px-6 dark:border-slate-800">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Current team
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Use filters to quickly locate a teammate.
                  </p>
                </div>
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <TextInput
                    className="w-full sm:w-64"
                    defaultValue={queryParams.name}
                    placeholder="Search by name"
                    onBlur={(e) => searchFieldChanged("name", e.target.value)}
                    onKeyPress={(e) => onKeyPress("name", e)}
                  />
                  <TextInput
                    className="w-full sm:w-64"
                    defaultValue={queryParams.email}
                    placeholder="Search by email"
                    onBlur={(e) => searchFieldChanged("email", e.target.value)}
                    onKeyPress={(e) => onKeyPress("email", e)}
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-900 dark:divide-slate-800 dark:text-gray-100">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-slate-800 dark:text-gray-400">
                  <tr>
                    <TableHeading
                      name="id"
                      sort_field={queryParams.sort_field}
                      sort_direction={queryParams.sort_direction}
                      sortChanged={sortChanged}
                    >
                      ID
                    </TableHeading>
                    <TableHeading
                      name="name"
                      sort_field={queryParams.sort_field}
                      sort_direction={queryParams.sort_direction}
                      sortChanged={sortChanged}
                    >
                      Name
                    </TableHeading>
                    <TableHeading
                      name="email"
                      sort_field={queryParams.sort_field}
                      sort_direction={queryParams.sort_direction}
                      sortChanged={sortChanged}
                    >
                      Email
                    </TableHeading>
                    <TableHeading
                      name="created_at"
                      sort_field={queryParams.sort_field}
                      sort_direction={queryParams.sort_direction}
                      sortChanged={sortChanged}
                    >
                      Added
                    </TableHeading>
                    <th className="px-6 py-3 text-left text-xs font-medium">
                      Brands
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {users.data.map((user) => (
                    <tr
                      key={user.id}
                      className="bg-white transition hover:bg-gray-50 dark:bg-slate-900 dark:hover:bg-slate-800"
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-700 dark:text-gray-200">
                        #{user.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={route("user.edit", user.id)}
                          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-300 dark:hover:text-blue-200"
                        >
                          {user.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {user.created_at}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {(user.brands || []).length === 0 ? (
                          <span className="text-xs text-gray-400">
                            Not assigned
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {(user.brands || []).map((brand) => (
                              <span
                                key={brand.id}
                                className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200"
                              >
                                {brand.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end gap-3">
                          <Link
                            href={route("user.edit", user.id)}
                            className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteUser(user)}
                            className="text-rose-600 hover:text-rose-500 dark:text-rose-300 dark:hover:text-rose-200"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-4 sm:px-6">
              <Pagination links={users.meta.links} />
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
