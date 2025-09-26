import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import TextAreaInput from "@/Components/TextAreaInput";
import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";

export default function Create(props) {
  const { props: pageProps } = usePage()
  const auth = pageProps?.auth ?? props?.auth ?? null
  const managers = pageProps?.managers ?? []

  // Normalize roles/permissions which may be arrays or objects (depending on serialization)
  const rolesArr = auth?.roles
    ? (Array.isArray(auth.roles) ? auth.roles : Object.values(auth.roles))
    : [];
  const permsArr = auth?.permissions
    ? (Array.isArray(auth.permissions) ? auth.permissions : Object.values(auth.permissions))
    : [];

  const rolesLower = rolesArr.map((r) => String(r).toLowerCase());
  const permsLower = permsArr.map((p) => String(p).toLowerCase());
  const canAssignManager = rolesLower.includes('admin') || permsLower.includes('assign_brand_manager');

  const { data, setData, post, errors, reset } = useForm({
    image: "",
    name: "",
    status: "in_progress",
    description: "",
    due_date: "",
    audience: "",
    other_details: "",
    file_path: "",
    manager_id: "",
  });

  const onSubmit = (e) => {
    e.preventDefault();

    post(route("project.store"));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Create New Brand
          </h2>
        </div>
      }
    >
      <Head title="Projects" />

      <div className="py-12">
        {/* DEBUG: show auth and managers for Admin users only (temporary) */}
        {rolesLower && rolesLower.includes('admin') && (
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mb-4 p-4 bg-yellow-50 border rounded">
            <div className="text-sm font-medium mb-2">Debug: Inertia shared props (admin only)</div>
            <div className="text-xs whitespace-pre-wrap">
              auth.roles: {JSON.stringify(rolesArr)}
              \n
              auth.permissions: {JSON.stringify(permsArr)}
              \n
              managers (count): {managers.length}
              \n
              managers: {JSON.stringify(managers, null, 2)}
            </div>
          </div>
        )}
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <form
              onSubmit={onSubmit}
              className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg"
            >
              <div>
                <InputLabel
                  htmlFor="project_image_path"
                  value="Brand Logo"
                />
                <TextInput
                  id="project_image_path"
                  type="file"
                  name="image"
                  className="mt-1 block w-full"
                  onChange={(e) => setData("image", e.target.files[0])}
                />
                <InputError message={errors.image} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="project_name" value="Brand Name" />

                <TextInput
                  id="project_name"
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
                  htmlFor="project_description"
                  value="Brand Description"
                />

                <TextAreaInput
                  id="project_description"
                  name="description"
                  value={data.description}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("description", e.target.value)}
                />

                <div className="mt-4">
                  <InputLabel htmlFor="project_audience" value="Target Audience" />

                  <TextAreaInput
                    id="project_audience"
                    type="text"
                    name="audience"
                    value={data.audience}
                    className="mt-1 block w-full"
                    onChange={(e) => setData("audience", e.target.value)}
                  />
                </div>

                <div className="mt-4">
                  <InputLabel htmlFor="project_other_details" value="Other Details" />

                  <TextInput
                    id="project_other_details"
                    type="text"
                    name="other_details"
                    value={data.other_details}
                    className="mt-1 block w-full"
                    onChange={(e) => setData("other_details", e.target.value)}
                  />

                </div>

                {/* Manager assignment - Admin only or allowed by permission */}
                {auth && ((auth.roles && auth.roles.includes('Admin')) || (auth.permissions && auth.permissions.includes('assign_brand_manager'))) && (
                  <div className="mt-4">
                    <InputLabel htmlFor="manager_id" value="Assign Manager (optional)" />
                    <SelectInput
                      id="manager_id"
                      name="manager_id"
                      className="mt-1 block w-full"
                      value={data.manager_id}
                      onChange={(e) => setData('manager_id', e.target.value)}
                    >
                      <option value="">-- Select manager --</option>
                      {managers.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </SelectInput>
                    <InputError message={errors.manager_id} className="mt-2" />
                  </div>
                )}

                <InputError message={errors.description} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel
                  htmlFor="project_due_date"
                  value="Started On"
                />

                <TextInput
                  id="project_due_date"
                  type="date"
                  name="due_date"
                  value={data.due_date}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("due_date", e.target.value)}
                />

                <InputError message={errors.due_date} className="mt-2" />
              </div>
              <div className="mt-4">
                {/* <InputLabel htmlFor="project_status" value="Brand Status" /> */}

                <SelectInput
                  name="status"
                  id="project_status"
                  className="mt-1 block w-full"
                  onChange={(e) => setData("status", e.target.value)}
                  style={{ display: 'none' }}
                >
                  <option value="in_progress">In Progress</option>

                </SelectInput>

                {/* file upload */}
                <div>
                  <InputLabel
                    htmlFor="project_file_path"
                    value="Brand Guidlines"
                  />
                  <TextInput
                    id="project_file_path"
                    type="file"
                    name="file_path"
                    className="mt-1 block w-full"
                    onChange={(e) => setData("file", e.target.files[0])}
                  />
                  <InputError message={errors.file} className="mt-2" />
                </div>



                <InputError message={errors.project_status} className="mt-2" />
              </div>
              <div className="mt-4 text-right">
                <Link
                  href={route("project.index")}
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
    </AuthenticatedLayout>
  );
}
