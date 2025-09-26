import React from 'react'
import Authenticated from '@/Layouts/AuthenticatedLayout'
import { Head, Link, router } from '@inertiajs/react'

function UserCard({ user, role }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold">{user.name.charAt(0)}</span>
        </div>
        <div>
          <h4 className="font-medium">{user.name}</h4>
          <p className="text-sm text-gray-500">{user.email}</p>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            role === 'Manager'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {role}
          </span>
        </div>
      </div>
    </div>
  )
}

function TaskCard({ task }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <Link href={route('task.show', task.id)} className="font-medium text-blue-600 hover:text-blue-900 hover:underline">
            {task.name}
          </Link>
          <p className="text-sm text-gray-500">{task.description}</p>
          <div className="flex items-center space-x-2 mt-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              task.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : task.status === 'in_progress'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {task.status}
            </span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              task.priority === 'high'
                ? 'bg-red-100 text-red-800'
                : task.priority === 'medium'
                ? 'bg-orange-100 text-orange-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {task.priority}
            </span>
          </div>
        </div>
        <div className="text-right">
          {task.assigned_user && (
            <div className="text-sm">
              <div className="font-medium">{task.assigned_user.name}</div>
              <div className="text-gray-500">Assigned</div>
            </div>
          )}
          {task.created_by && (
            <div className="text-sm mt-2">
              <div className="text-gray-500">Assigned by:</div>
              <div className="font-medium">{task.created_by.name}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Show({ brand }) {
  return (
    <Authenticated header={<h2 className="font-semibold text-xl">Brand Details</h2>}>
      <Head title={`${brand.name} - Brand Details`} />

      <div className="mb-6 flex items-center justify-between">
        <Link href={route('brands.index')} className="text-blue-600 hover:underline">
          ← Back to Brands
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={route('brands.edit', brand.id)}
            className="btn-secondary"
          >
            Edit Brand
          </Link>
          <Link
            href={route('task.create', { brand_id: brand.id })}
            className="btn-primary"
          >
            Add Task
          </Link>
          <button
            onClick={() => { if (window.confirm('Are you sure you want to delete this brand?')) { router.delete(route('brands.destroy', brand.id)); } }}
            className="btn-secondary border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
          >
            Delete Brand
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Brand Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-4 mb-4">
              {brand.logo_path ? (
                <img src={route('brands.logo', brand.id)} alt="Brand Logo" className="w-16 h-16 object-cover rounded-lg" />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">{brand.name.charAt(0)}</span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{brand.name}</h1>
                <p className="text-gray-600">{brand.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Managers and Team Members */}
        <div className="lg:col-span-2 space-y-6">
          {/* Managers */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Managers</h3>
            {brand.managers && brand.managers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {brand.managers.map((manager) => (
                  <UserCard key={manager.id} user={manager} role="Manager" />
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">No managers assigned</div>
            )}
          </div>

          {/* Team Members */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Team Members</h3>
            {brand.team_users && brand.team_users.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {brand.team_users.map((user) => (
                  <UserCard key={user.id} user={user} role="Team Member" />
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">No team members assigned</div>
            )}
          </div>

          {/* Additional Brand Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Brand Details</h3>
            <div className="bg-white p-4 rounded-lg shadow-sm border space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Target Audience</span>
                <div className="text-sm">{brand.audience || 'N/A'}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Other Details</span>
                <div className="text-sm">{brand.other_details || 'N/A'}</div>
              </div>
              {brand.file_path && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Brand Guidelines</span>
                  <div>
                    <a href={route('brands.guideline', brand.id)} className="text-blue-600 hover:underline">Download</a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tasks */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Tasks ({brand.tasks?.length || 0})</h3>
            {brand.tasks && brand.tasks.length > 0 ? (
              <div className="space-y-4">
                {brand.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">No tasks found</div>
            )}
          </div>
        </div>
      </div>
    </Authenticated>
  )
}
