import React from 'react'
import Authenticated from '@/Layouts/AuthenticatedLayout'
import { Head, Link } from '@inertiajs/react'
import TasksTable from '../Task/TasksTable'

function ProjectCard({ project }) {
  return (
    <div className="card-soft overflow-hidden rounded-lg shadow-sm bg-white flex flex-col">
      {project.image_path ? (
        <img src={project.image_path} alt={project.name} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-gray-100" />
      )}

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold">{project.name}</h3>
          <p className="text-sm text-gray-500 mt-2">{project.description ?? 'No description'}</p>
        </div>

        <div className="mt-4 flex items-center">
          <Link href={route('project.show', project.id)} className="text-blue-600 hover:underline">View</Link>
        </div>
      </div>
    </div>
  )
}

export default function Index({ projects = { data: [] }, filters, can = {}, tasks = null, openTasksCount = null }) {
  const items = projects.data ?? projects

  return (
    <Authenticated header={<h2 className="font-semibold text-xl">Brands</h2>}>
      <Head title="Brands" />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">Showing {items.length} brands</div>
        </div>

        <div>
          {can.create && (
            <Link href={route('project.create')} className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-md shadow-sm">Add Brand</Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>

      {/* If tasks prop is provided (single project view), render summary and its tasks */}
      {tasks && (
        <div className="mt-8">
          <div className="mb-4 text-sm text-gray-700">Open tasks: {openTasksCount ?? (tasks.meta ? tasks.meta.total : '')}</div>
          <TasksTable tasks={tasks} hideProjectColumn={true} />
        </div>
      )}

      <div className="mt-8">
        {(projects.links || projects.meta?.links) && (
          (() => {
            const rawLinks = projects.links ?? projects.meta?.links;
            // If links is a raw HTML string (older/irregular output), strip any full urls and render it as a single block
            if (typeof rawLinks === 'string') {
              const stripped = rawLinks.replace(/https?:\/\/[^\s"'<]+/g, '');
              return (
                <div className="prose text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: stripped }} />
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
                      <span key={idx} className="px-3 py-1 text-gray-700" dangerouslySetInnerHTML={{ __html: stripped }} />
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
                        className={`px-3 py-1 rounded ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}
                        dangerouslySetInnerHTML={{ __html: safeLabel }}
                      />
                    );
                  }

                  return (
                    <Link
                      key={idx}
                      href={url}
                      className={`px-3 py-1 rounded ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
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
