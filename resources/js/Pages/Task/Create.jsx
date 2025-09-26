import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import TextAreaInput from "@/Components/TextAreaInput";
import TextInput from "@/Components/TextInput";
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

  // Temporary debug: expose projects and preselectedBrandId on the page to help diagnose dropdown issues
  const debugInfo = {
    projectsArrayLength: projectsArray.length,
    preselectedBrandId: preselectedBrandId,
    initialProjectId: initialProjectId,
    projectsSample: projectsArray.slice(0,5),
  };

  const { data, setData, post, errors, reset } = useForm({
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
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mb-4 p-4 bg-blue-50 border rounded">
            <div className="text-sm font-medium mb-2">Debug: Task Create props</div>
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="card-soft">
            <form
              onSubmit={onSubmit}
              className="p-6"
            >
              <div>
                <InputLabel htmlFor="task_project_id" value="Brand" />


                <SelectInput
                  name="project_id"
                  id="task_project_id"
                  className="form-select mt-1"
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
                {/* <InputLabel htmlFor="task_due_date" value="Task Deadline" /> */}
                {/* 
                <TextInput
                  id="task_due_date"
                  type="date"
                  name="due_date"
                  value={data.due_date}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("due_date", e.target.value)}
                /> */}

                <InputError message={errors.due_date} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="task_status" value="Task Status" />

                <SelectInput
                  name="status"
                  id="task_status"
                  className="form-select mt-1"
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
                <InputLabel
                  htmlFor="task_assigned_user"
                  value="Assign Task To"
                />

                <SelectInput
                  name="assigned_user_id"
                  id="task_assigned_user"
                  className="form-select mt-1"
                  value={data.assigned_user_id}
                  onChange={(e) => setData("assigned_user_id", e.target.value)}
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
      </div >
    </AuthenticatedLayout >
  );
}

