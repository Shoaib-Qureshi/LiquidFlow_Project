import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import TextAreaInput from "@/Components/TextAreaInput";
import TextInput from "@/Components/TextInput";
import DatePicker from "@/Components/DatePicker";
// import TaskDependencies from "@/Components/TaskDependencies"; // Temporarily removed
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import axios from "axios";
import { useState } from "react";

export default function Create({ auth, task, projects, users, isTeamUser }) {
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [isPostingStatus, setIsPostingStatus] = useState(false);

  const { data, setData, post, errors, reset } = useForm({
    image: "",
    name: task.name || "",
    status: task.status || "",
    description: task.description || "",
    due_date: task.due_date || "",
    project_id: task.brand_id || task.project_id || "", // Use brand_id as project_id for consistency
    priority: task.priority || "",
    assigned_user_id: task.assigned_user_id || "",
    _method: "PUT",
  });

  // Handle status change with confirmation
  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setPendingStatus(newStatus);
    setShowStatusConfirm(true);
  };

  // Confirm status change
  const confirmStatusChange = () => {
    setData("status", pendingStatus);
    setShowStatusConfirm(false);
  };

  // Cancel status change
  const cancelStatusChange = () => {
    setPendingStatus(null);
    setShowStatusConfirm(false);
  };

  // Get the current brand name for display
  const currentBrand = task.brand || null;

  const onSubmit = (e) => {
    e.preventDefault();

    post(route("task.update", task.id));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Edit task "{task.name}"
          </h2>
        </div>
      }
    >
      <Head title="Tasks" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="border rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
            <form onSubmit={onSubmit} className="p-6 space-y-6">
              {task.image_path && (
                <div className="mb-4 w-full h-48 overflow-hidden">
                  <img src={task.image_path} className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <InputLabel htmlFor="task_project_id" value="Brand" />
                <div className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                  {currentBrand?.name || 'No brand assigned'}
                </div>
                <input type="hidden" name="project_id" value={data.project_id} />
                <InputError message={errors.project_id} className="mt-2" />
              </div>

              {!isTeamUser && (
                <div className="mt-4">
                  <InputLabel htmlFor="task_image_path" value="Task Image" />
                  <TextInput
                    id="task_image_path"
                    type="file"
                    name="image"
                    className="form-input mt-1"
                    onChange={(e) => setData("image", e.target.files[0])}
                  />
                  <InputError message={errors.image} className="mt-2" />
                </div>
              )}
              <div className="mt-4">
                <InputLabel htmlFor="task_name" value="Task Name" className="flex items-center">
                  <span>Task Name</span>
                  {isTeamUser && (
                    <span className="ml-2 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      View Only
                    </span>
                  )}
                </InputLabel>
                <TextInput
                  id="task_name"
                  type="text"
                  name="name"
                  value={data.name}
                  className="form-input mt-1"
                  readOnly={isTeamUser}
                  onChange={(e) => setData("name", e.target.value)}
                />
                <InputError message={errors.name} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel
                  htmlFor="task_description"
                  value="Task Description"
                  className="flex items-center"
                >
                  <span>Task Description</span>
                  {isTeamUser && (
                    <span className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                      Editable
                    </span>
                  )}
                </InputLabel>
                <TextAreaInput
                  id="task_description"
                  name="description"
                  value={data.description}
                  className="form-input mt-1"
                  onChange={(e) => setData("description", e.target.value)}
                  placeholder={isTeamUser ? "Update task progress or add details here..." : ""}
                />

                <InputError message={errors.description} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="task_due_date" value="Task Deadline" className="flex items-center">
                  <span>Task Deadline</span>
                  {isTeamUser && (
                    <span className="ml-2 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      View Only
                    </span>
                  )}
                </InputLabel>
                <div className="mt-1 max-w-xs">
                  <DatePicker
                    id="task_due_date"
                    name="due_date"
                    value={data.due_date}
                    className="form-input"
                    onChange={(e) => setData("due_date", e.target.value)}
                    disabled={isTeamUser}
                  />
                </div>
                <InputError message={errors.due_date} className="mt-2" />
              </div>

              {/* Status dropdown - everyone can update */}
              <div className="mt-4">
                <InputLabel htmlFor="task_status" value="Task Status" className="flex items-center">
                  <span>Task Status</span>
                  {isTeamUser && (
                    <span className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                      Editable
                    </span>
                  )}
                </InputLabel>
                <div>
                  <SelectInput
                    name="status"
                    id="task_status"
                    value={data.status}
                    className="form-select mt-1"
                    onChange={handleStatusChange}
                  >
                    <option value="Inactive">Inactive</option>
                    <option value="Active">Active</option>
                    <option value="completed">Completed</option>
                  </SelectInput>
                  <InputError message={errors.task_status} className="mt-2" />
                </div>
              </div>

              {isTeamUser && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h3 className="text-sm font-semibold text-blue-800">Team Member Edit Mode</h3>
                  <p className="text-sm text-blue-600 mt-1">
                    As a team member, you can update the task status and provide updates to the description.
                    Other fields are view-only.
                  </p>
                </div>
              )}

              {/* Status Change Confirmation Dialog */}
              {showStatusConfirm && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-4 rounded-lg shadow-xl max-w-md w-full mx-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Confirm Status Change</h3>
                    <p className="text-gray-500 mb-4 text-sm">Are you sure you want to change the task status to <span className="font-semibold">{pendingStatus}</span>?</p>
                    <div className="flex justify-end gap-3">
                      <button type="button" className="px-3 py-1 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 text-sm" onClick={cancelStatusChange} disabled={isPostingStatus}>Cancel</button>
                      <button type="button" className={`px-3 py-1 text-white bg-blue-600 rounded-md hover:bg-blue-700 text-sm ${isPostingStatus ? 'opacity-60 cursor-not-allowed' : ''}`} onClick={async () => {
                        if (isPostingStatus) return;
                        setIsPostingStatus(true);
                        try {
                          if (isTeamUser) {
                            await axios.post(route("task.update", task.id), { _method: "PUT", status: pendingStatus });
                          } else {
                            setData("status", pendingStatus);
                            await post(route("task.update", task.id));
                          }
                          // Redirect to show page to refresh state
                          window.location.href = route("task.show", task.id);
                        } catch (err) {
                          console.error(err);
                          setIsPostingStatus(false);
                          setShowStatusConfirm(false);
                        }
                      }} disabled={isPostingStatus}>{isPostingStatus ? 'Updating...' : 'Confirm'}</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Priority dropdown - only managers/admin can update */}
              {!isTeamUser && (
                <div className="mt-4">
                  <InputLabel htmlFor="task_priority" value="Task Priority" />
                  <SelectInput
                    name="priority"
                    id="task_priority"
                    value={data.priority}
                    className="form-select mt-1"
                    onChange={(e) => setData("priority", e.target.value)}
                  >
                    <option value="">Select Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </SelectInput>
                  <InputError message={errors.priority} className="mt-2" />
                </div>
              )}

              {/* Team member assignment - only managers/admin can update */}
              {!isTeamUser && users.length > 0 && (
                <div className="mt-4">
                  <InputLabel
                    htmlFor="task_assigned_user"
                    value="Assign Team Member"
                  />
                  <SelectInput
                    name="assigned_user_id"
                    id="task_assigned_user"
                    value={data.assigned_user_id}
                    className="form-select mt-1"
                    onChange={(e) => setData("assigned_user_id", e.target.value)}
                  >
                    <option value="">Select Team Member</option>
                    {users.map((user) => (
                      <option value={user.id} key={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </SelectInput>
                  <InputError
                    message={errors.assigned_user_id}
                    className="mt-2"
                  />
                </div>
              )}
              {/* Submit buttons */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <Link href={route("task.index")} className="btn-secondary">
                  Cancel
                </Link>
                <button className="btn-primary">
                  {isTeamUser ? "Update Task Status" : "Update Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
