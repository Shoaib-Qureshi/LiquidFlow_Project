import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

import { Head, Link } from "@inertiajs/react";

import TasksTable from "./TasksTable";

export default function Index({ auth, success, tasks, brands = [], queryParams = null }) {
  // Check if user can create tasks (Admin and Manager only)
  const canCreateTasks = auth.roles && (auth.roles.includes('Admin') || auth.roles.includes('Manager'));
  
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Tasks
          </h2>
          {canCreateTasks && (
            <Link
              href={route("task.create")}
              className="btn-primary"
            >
              Add new
            </Link>
          )}
        </div>
      }
    >
      <Head title="Tasks" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="card-soft">
            <div className="p-6">
              <TasksTable
                tasks={tasks}
                brands={brands}
                queryParams={queryParams}
                success={success}
              />
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

