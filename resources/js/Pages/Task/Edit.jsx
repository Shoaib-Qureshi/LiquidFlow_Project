import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import TextAreaInput from "@/Components/TextAreaInput";
import TextInput from "@/Components/TextInput";
// import TaskDependencies from "@/Components/TaskDependencies"; // Temporarily removed
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Create({ auth, task, projects, users }) {
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
          <div className="card-soft">
            <form
              onSubmit={onSubmit}
              className="p-6"
            >
              {task.image_path && (
                <div className="mb-4">
                  <img src={task.image_path} className="w-64" />
                </div>
              )}
              <div>
                <InputLabel htmlFor="task_project_id" value="Brand" />

                {currentBrand ? (
                  <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700">
                    {currentBrand.name}
                  </div>
                ) : (
                  <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500">
                    No brand assigned
                  </div>
                )}

                {/* Hidden input to maintain the brand_id value */}
                <input type="hidden" name="project_id" value={data.project_id} />

                <InputError message={errors.project_id} className="mt-2" />
              </div>
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
              <div className="mt-4">
                <InputLabel htmlFor="task_name" value="Task Name" />

                <TextInput
                  id="task_name"
                  type="text"
                  name="name"
                  value={data.name}
                  className="form-input mt-1"
                  isFocused={true}
                  onChange={(e) => setData("name", e.target.value)}
                />

                <InputError message={errors.name} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel
                  htmlFor="task_description"
                  value="Task Description"
                />

                <TextAreaInput
                  id="task_description"
                  name="description"
                  value={data.description}
                  className="form-input mt-1"
                  onChange={(e) => setData("description", e.target.value)}
                />

                <InputError message={errors.description} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="task_due_date" value="Task Deadline" />

                <TextInput
                  id="task_due_date"
                  type="date"
                  name="due_date"
                  value={data.due_date}
                  className="form-input mt-1"
                  onChange={(e) => setData("due_date", e.target.value)}
                />

                <InputError message={errors.due_date} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="task_status" value="Task Status" />

                <SelectInput
                  name="status"
                  id="task_status"
                  value={data.status}
                  className="form-select mt-1"
                  onChange={(e) => setData("status", e.target.value)}
                >
                  <option value="Inactive">Inactive</option>
                  <option value="Active">Active</option>
                  <option value="completed">Completed</option>
                </SelectInput>

                <InputError message={errors.task_status} className="mt-2" />
              </div>

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

              <div className="mt-4">
                {/* <InputLabel
                  htmlFor="task_assigned_user"
                  value="Assigned User"
                /> */}

                <SelectInput
                  name="assigned_user_id"
                  id="task_assigned_user"
                  value={data.assigned_user_id}
                  className="form-select mt-1"
                  onChange={(e) => setData("assigned_user_id", e.target.value)}
                  style={{ display: 'none' }}
                >
                  <option value="">Select User</option>
                  {users.data.map((user) => (
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

              {/* Task Dependencies temporarily removed to fix loading error */}
              {/* <div className="mt-8 border-t pt-8">
                <TaskDependencies task={task} />
              </div> */}

              <div className="mt-6 flex items-center justify-end gap-3">
                <Link
                  href={route("task.index")}
                  className="btn-secondary"
                >
                  Cancel
                </Link>
                <button className="btn-primary">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
