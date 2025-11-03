import React from 'react'
import Authenticated from '@/Layouts/AuthenticatedLayout'
import { Head, Link, router } from '@inertiajs/react'

function UserCard({ user, role }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-sm p-4 text-gray-900 dark:text-gray-100">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold">{user.name.charAt(0)}</span>
        </div>
        <div>
          <h4 className="font-medium">{user.name}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${role === 'Manager'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200'
              : 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200'
              }`}
          >
            {role}
          </span>
        </div>
      </div>
    </div>
  )
}

function TaskCard({ task }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-sm p-4 text-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={route('task.show', task.id)}
            className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 hover:underline"
          >
            {task.name}
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400">{task.description}</p>
          <div className="flex items-center space-x-2 mt-2">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${task.status === 'completed'
                ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200'
                : task.status === 'in_progress'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-200'
                }`}
            >
              {task.status}
            </span>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${task.priority === 'high'
                ? 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200'
                : task.priority === 'medium'
                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-200'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200'
                }`}
            >
              {task.priority}
            </span>
          </div>
        </div>
        <div className="text-right space-y-2 text-sm">
          {task.assigned_user && (
            <div>
              <div className="font-medium">{task.assigned_user.name}</div>
              <div className="text-gray-500 dark:text-gray-400">Assigned</div>
            </div>
          )}
          {task.created_by && (
            <div>
              <div className="text-gray-500 dark:text-gray-400">Assigned by:</div>
              <div className="font-medium">{task.created_by.name}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Show({ brand }) {
  const client = brand.client ?? null;
  const teamMembers = brand.team_users ?? brand.teamUsers ?? [];
  return (
    <Authenticated header={<h2 className="font-semibold text-xl dark:text-gray-100">Brand Details</h2>}>
      <Head title={`${brand.name} - Brand Details`} />

      <div className="mb-6 flex items-center justify-between">
        <Link href={route('brands.index')} className="text-blue-600 dark:text-blue-400 hover:underline">
          &larr; Back to Brands
        </Link>
        <div className="flex items-center gap-3">
          <Link href={route('brands.edit', brand.id)} className="btn-secondary">
            Edit Brand
          </Link>
          <Link href={route('task.create', { brand_id: brand.id })} className="btn-primary">
            Add Task
          </Link>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this brand?')) {
                router.delete(route('brands.destroy', brand.id))
              }
            }}
            className="btn-secondary border-red-600 text-red-600 hover:bg-red-600 hover:text-white dark:border-red-400 dark:text-red-300 dark:hover:bg-red-500 dark:hover:text-white"
          >
            Delete Brand
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-sm p-6 text-gray-900 dark:text-gray-100">
            <div className="flex flex-col  space-y-4">
              {brand.logo_path ? (
                <img src={route('brands.logo', brand.id)} alt="Brand Logo" className="w-26 h-26 object-cover rounded-lg" />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">{brand.name.charAt(0)}</span>
                </div>
              )}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">{brand.name}</h1>
                <p className="text-gray-600 dark:text-gray-400">{brand.description}</p>
                {client && (
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Client:{' '}
                    <Link href={route('clients.show', client.id)} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                      {client.name}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">




          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Brand Details</h3>
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-sm p-4 space-y-3 text-gray-900 dark:text-gray-100">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Target Audience</span>
                <div className="text-sm">{brand.audience || 'N/A'}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Other Details</span>
                <div className="text-sm">{brand.other_details || 'N/A'}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Brand Guidelines</span>
                <div className="mt-1">
                  {brand.file_path ? (
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{brand.file_name || brand.file_path.split('/').pop()}</div>
                      <a
                        href={route('brands.guideline', brand.id)}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </a>
                      <a
                        href={route('brands.guideline', brand.id)}
                        className="text-sm inline-flex items-center px-3 py-1 rounded-md bg-gray-100 dark:bg-slate-800 border text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700"
                        download
                      >
                        Download
                      </a>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">No file uploaded.</div>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Started On</span>
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  {brand.started_on ? new Date(brand.started_on).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Tasks ({brand.tasks?.length || 0})</h3>
            {brand.tasks && brand.tasks.length > 0 ? (
              <div className="space-y-4">
                {brand.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 text-center py-8">No tasks found</div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Managers</h3>
            {brand.managers && brand.managers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {brand.managers.map((manager) => (
                  <UserCard key={manager.id} user={manager} role="Manager" />
                ))}
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 text-center py-8">No managers assigned</div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Team Members</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {teamMembers.length} {teamMembers.length === 1 ? 'member' : 'members'}
              </span>
            </div>
            {teamMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamMembers.map((member) => (
                  <UserCard key={member.id} user={member} role="Team Member" />
                ))}
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 text-center py-8">No team members assigned</div>
            )}
          </div>
        </div>

      </div>
    </Authenticated>
  )
}
