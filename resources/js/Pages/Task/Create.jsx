import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import TextAreaInput from "@/Components/TextAreaInput";
import TextInput from "@/Components/TextInput";
import DatePicker from "@/Components/DatePicker";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";

export default function Create({ auth, projects, users, preselectedBrandId = null }) {
  // Prefer controller-provided projects, otherwise fall back to globally-shared brands
  const shared = usePage().props?.brands ?? [];
  const projectsArray = projects?.data || projects || (shared.length ? shared : []);
  // Determine default brand selection: prefer preselectedBrandId when provided and present in the list
  const initialProjectId =
    preselectedBrandId && projectsArray.find(p => String(p.id) === String(preselectedBrandId))
      ? String(preselectedBrandId)
      : (projectsArray.length > 0 ? String(projectsArray[0].id) : "");

  const { data, setData, post, errors, reset, setError, clearErrors } = useForm({
    project_id: initialProjectId, // Default based on preselected brand or first brand
    image: "",
    name: "",
    status: "Inactive",
    description: "",
    due_date: "",
    assigned_user_id: "", // No default assignment
  });

  const onSubmit = (e) => {
    e.preventDefault();

    if (!data.assigned_user_id) {
      setError("assigned_user_id", "Please select a user to assign this task.");
      return;
    }

    post(route("task.store"));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Create new Task
          </h2>
        </div>
      }
    >
      <Head title="Tasks" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="border rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
            <form onSubmit={onSubmit} className="p-6 space-y-6">
              <div>
                <InputLabel htmlFor="task_project_id" value="Brand" />


                <SelectInput
                  name="project_id"
                  id="task_project_id"
                  className="mt-1 block w-full"
                  value={data.project_id}
                  onChange={(e) => setData("project_id", e.target.value)}
                  disabled={!!preselectedBrandId}
                >
                  {projectsArray.map((project) => (
                    <option value={project.id} key={project.id}>
                      {project.name}
                    </option>
                  ))}
                </SelectInput>


                <InputError message={errors.project_id} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="task_image_path" value="Task Image" />
                <TextInput
                  id="task_image_path"
                  type="file"
                  name="image"
                  className="mt-1 block w-full"
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
                  className="mt-1 block w-full"
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
                  className="mt-1 block w-full"
                  onChange={(e) => setData("description", e.target.value)}
                />

                <InputError message={errors.description} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="task_due_date" value="Task Deadline" />

                <DatePicker
                  id="task_due_date"
                  name="due_date"
                  value={data.due_date}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("due_date", e.target.value)}
                />

                <InputError message={errors.due_date} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="task_status" value="Task Status" />

                <SelectInput
                  name="status"
                  id="task_status"
                  className="mt-1 block w-full"
                  value={data.status}
                  onChange={(e) => setData("status", e.target.value)}
                  disabled
                >
                  <option value="Inactive">Inactive</option>
                  {/* <option value="Active">Active</option>
                  <option value="completed">Completed</option> */}
                </SelectInput>

                <InputError message={errors.task_status} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="task_priority" value="Task Priority" />

                <SelectInput
                  name="priority"
                  id="task_priority"
                  className="mt-1 block w-full"
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
                <InputLabel
                  htmlFor="task_assigned_user"
                  value="Assign Task To"
                />

                <SelectInput
                  name="assigned_user_id"
                  id="task_assigned_user"
                  className={`mt-1 block w-full ${errors.assigned_user_id ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                  value={data.assigned_user_id}
                  onChange={(e) => {
                    setData("assigned_user_id", e.target.value);
                    if (e.target.value) {
                      clearErrors("assigned_user_id");
                    }
                  }}
                >
                  <option value="">Select User to Assign</option>
                  {(users?.data || users || []).map((user) => (
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

              <div className="mt-4 text-right">
                <Link
                  href={route("task.index")}
                  className="bg-gray-100 py-1 px-3 text-gray-800 rounded shadow transition-all hover:bg-gray-200 mr-2"
                >
                  Cancel
                </Link>
                <button className="bg-emerald-500 py-1 px-3 text-white rounded shadow transition-all hover:bg-emerald-600">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout >
  );
}
