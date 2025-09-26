import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import {
  PROJECT_STATUS_CLASS_MAP,
  PROJECT_STATUS_TEXT_MAP,
} from "@/constants.jsx";
import TasksTable from "../Task/TasksTable";

const deleteProject = (project) => {
  if (!window.confirm("Are you sure you want to delete the project?")) {
    return;
  }
  router.delete(route("project.destroy", project.id));
};
export default function Show({ auth, success, project, tasks, queryParams }) {
  return (
    <AuthenticatedLayout
      user={auth.user}

      header={
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {`Project "${project.name}"`}
          </h2>

          <div className="flex items-end space-x-4">
            <Link
              href={route("project.edit", project.id)}
              className="btn-primary"
            >
              Edit Brand
            </Link>

            <Link
              href={route("task.create")}
              className="btn-secondary"
            >
              Add Task
            </Link>

            <button
              onClick={(e) => deleteProject(project)}
              className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-600 hover:text-white transition"
            >
              Delete
            </button>
          </div>
        </div>
      }

    >


      <Head title={`Project "${project.name}"`} />
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="card-soft overflow-hidden">
            <div>
              <img
                src={project.image_path}
                alt=""
                className="w-full h-64 object-cover"
              />
            </div>
            <div className="p-6">
              <div className="grid gap-1 grid-cols-2 mt-2">
                <div>
                  <div>
                    <label className="font-bold text-lg">Brand ID</label>
                    <p className="mt-1">{project.id}</p>
                  </div>
                  <div className="mt-4">
                    <label className="font-bold text-lg">Brand Name</label>
                    <p className="mt-1">{project.name}</p>
                  </div>

                  {/* <div className="mt-4">
                    <label className="font-bold text-lg">Brand Status</label>
                    <p className="mt-1">
                      <span
                        className={
                          "px-2 py-1 rounded text-white " +
                          PROJECT_STATUS_CLASS_MAP[project.status]
                        }
                      >
                        {PROJECT_STATUS_TEXT_MAP[project.status]}
                      </span>
                    </p>
                  </div> */}
                  <div className="mt-4">
                    <label className="font-bold text-lg">Created By</label>
                    <p className="mt-1">{project.createdBy.name}</p>
                  </div>
                </div>
                <div>
                  {/* <div>
                    <label className="font-bold text-lg">Due Date</label>
                    <p className="mt-1">{project.due_date}</p>
                  </div> */}
                  <div className="mt-4">
                    <label className="font-bold text-lg">Create Date</label>
                    <p className="mt-1">{project.created_at}</p>
                  </div>
                  <div className="mt-4">
                    <label className="font-bold text-lg">Updated By</label>
                    <p className="mt-1">{project.updatedBy.name}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="font-bold text-lg">Brand Description</label>
                <p className="mt-1">{project.description}</p>
              </div>

              <div className="mt-4">
                <label className="font-bold text-lg">Target Audience </label>
                <p className="mt-1">{project.audience ? project.audience : "N/A"}</p>
              </div>

              <div className="mt-4">
                <label className="font-bold text-lg">Other Details </label>
                <p className="mt-1">{project.other_details ? project.other_details : "N/A"}</p>

              </div>


              {/* File upload */}
              <div className="mt-4">
                <label className="font-bold text-lg"> Brand Guideline:
                </label>
                {project.file_path ? (
                  <a
                    href={`${project.file_path}`}
                    download
                    className="mt-1 px-2 text-blue-500 underline "
                  >
                    Download Brand Guideline

                  </a>
                ) : (
                  <p className="mt-1">No file uploaded.</p>
                )}
              </div>






            </div>
          </div>
        </div>
      </div>






      <div className="pb-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="card-soft">
            <div className="p-6">
              <TasksTable
                tasks={tasks}
                success={success}
                queryParams={queryParams}
                hideProjectColumn={true}
              />
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
