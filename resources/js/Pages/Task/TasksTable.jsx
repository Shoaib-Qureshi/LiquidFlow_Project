import Pagination from "@/Components/Pagination";
import SelectInput from "@/Components/SelectInput";
import TextInput from "@/Components/TextInput";
import TableHeading from "@/Components/TableHeading";
import LoadingSpinner, { LoadingSkeleton } from "@/Components/LoadingSpinner";
import { EmptyState } from "@/Components/ErrorMessage";
import { TASK_STATUS_CLASS_MAP, TASK_STATUS_TEXT_MAP } from "@/constants.jsx";
import { Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import {
  PROJECT_STATUS_CLASS_MAP,
  PROJECT_STATUS_TEXT_MAP,
} from "@/constants.jsx";

export default function TasksTable({
  tasks,
  brands = [],
  success,
  queryParams = null,
  hideProjectColumn = false,
  loading = false,
}) {
  const { props } = usePage();
  const auth = props?.auth ?? {};
  const roles = auth.roles ?? [];
  const user = auth.user ?? {};
  const [isDeleting, setIsDeleting] = useState(null);
  
  // Check if user can edit/delete tasks (Admin and Manager only)
  const canEditTasks = roles.includes('Admin') || roles.includes('Manager');
  const canDeleteTasks = roles.includes('Admin') || roles.includes('Manager');
  queryParams = queryParams || {};
  const searchFieldChanged = (name, value) => {
    if (value) {
      queryParams[name] = value;
    } else {
      delete queryParams[name];
    }

    router.get(route("task.index"), queryParams);
  };

  const onKeyPress = (name, e) => {
    if (e.key !== "Enter") return;

    searchFieldChanged(name, e.target.value);
  };

  const sortChanged = (name) => {
    if (name === queryParams.sort_field) {
      if (queryParams.sort_direction === "asc") {
        queryParams.sort_direction = "desc";
      } else {
        queryParams.sort_direction = "asc";
      }
    } else {
      queryParams.sort_field = name;
      queryParams.sort_direction = "asc";
    }
    router.get(route("task.index"), queryParams);
  };

  const deleteTask = (task) => {
    if (!window.confirm("Are you sure you want to delete the task?")) {
      return;
    }
    setIsDeleting(task.id);
    router.delete(route("task.destroy", task.id), {
      onFinish: () => setIsDeleting(null),
      onError: () => setIsDeleting(null)
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton rows={5} className="h-16" />
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // Empty state
  if (!tasks?.data || tasks.data.length === 0) {
    return (
      <EmptyState
        title="No tasks found"
        description="There are no tasks to display. Create your first task to get started."
        action={
          canEditTasks && (
            <Link
              href={route("task.create")}
              className="btn-primary"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Task
            </Link>
          )
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/40 text-green-800 dark:text-green-200 px-4 py-3 rounded-md animate-fade-in">
          <div className="flex">
            <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="card-soft p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <TextInput
              className="w-full"
              defaultValue={queryParams.name}
              placeholder="Search tasks..."
              onBlur={(e) => searchFieldChanged("name", e.target.value)}
              onKeyPress={(e) => onKeyPress("name", e)}
            />
          </div>
          <div>
            <SelectInput
              className="w-full"
              defaultValue={queryParams.status}
              onChange={(e) => searchFieldChanged("status", e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Inactive">Inactive</option>
              <option value="Active">Active</option>
              <option value="completed">Completed</option>
            </SelectInput>
          </div>
          <div>
            <SelectInput
              className="w-full"
              defaultValue={queryParams.brand_id}
              onChange={(e) => searchFieldChanged("brand_id", e.target.value)}
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </SelectInput>
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            Showing {tasks.data.length} tasks
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block card-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 text-gray-900 dark:text-gray-100">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Image</th>
                {!hideProjectColumn && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Brand</th>}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Task Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
              {tasks.data.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{task.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {task.image_path ? (
                      <img src={task.image_path} alt="task" className="w-12 h-8 object-cover rounded-md shadow-sm" />
                    ) : (
                      <div className="w-12 h-8 bg-gray-100 dark:bg-slate-800 rounded-md flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </td>
                  {!hideProjectColumn && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {task.brand?.name || task.project?.name || 'No Brand'}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={route('task.show', task.id)} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium hover:underline">
                      {task.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TASK_STATUS_CLASS_MAP[task.status]}`}>
                      {TASK_STATUS_TEXT_MAP[task.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(task.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {task.createdBy?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {canEditTasks && (
                        <Link href={route('task.edit', task.id)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">
                          Edit
                        </Link>
                      )}
                      {canDeleteTasks && (
                        <button 
                          onClick={() => deleteTask(task)} 
                          disabled={isDeleting === task.id}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 disabled:opacity-50"
                        >
                          {isDeleting === task.id ? <LoadingSpinner size="sm" /> : 'Delete'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {tasks.data.map((task) => (
          <div key={task.id} className="card-soft p-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {task.image_path ? (
                  <img src={task.image_path} alt="task" className="w-16 h-12 object-cover rounded-md" />
                ) : (
                  <div className="w-16 h-12 bg-gray-100 dark:bg-slate-800 rounded-md flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <Link href={route('task.show', task.id)} className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400">
                    {task.name}
                  </Link>
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TASK_STATUS_CLASS_MAP[task.status]}`}>
                    {TASK_STATUS_TEXT_MAP[task.status]}
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                  <div>ID: {task.id}</div>
                  {!hideProjectColumn && task.brand?.name && <div>Brand: {task.brand.name}</div>}
                  <div>Created: {new Date(task.created_at).toLocaleDateString()}</div>
                  <div>By: {task.createdBy?.name || 'Unknown'}</div>
                </div>
                <div className="mt-4 flex items-center space-x-4">
                  {canEditTasks && (
                    <Link href={route('task.edit', task.id)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium">
                      Edit
                    </Link>
                  )}
                  {canDeleteTasks && (
                    <button 
                      onClick={() => deleteTask(task)} 
                      disabled={isDeleting === task.id}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 font-medium disabled:opacity-50"
                    >
                      {isDeleting === task.id ? <LoadingSpinner size="sm" /> : 'Delete'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6">
        <Pagination links={tasks.meta?.links ?? []} />
      </div>
    </div>
  );
}
