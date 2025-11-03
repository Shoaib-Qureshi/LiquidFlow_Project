import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import TextAreaInput from "@/Components/TextAreaInput";
import TextInput from "@/Components/TextInput";
import DatePicker from "@/Components/DatePicker";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";

export default function Edit(props) {
  const { props: pageProps } = usePage();
  const auth = pageProps?.auth ?? props?.auth ?? null;
  const brand = props?.brand ?? pageProps?.brand ?? {};
  const clients = pageProps?.clients ?? props?.clients ?? [];
  const hasClients = clients.length > 0;

  const initialClientId = brand.client?.id ?? brand.client_id ?? "";

  const form = useForm({
    image: null,
    file: null,
    name: brand.name ?? "",
    status: brand.status ?? "active",
    description: brand.description ?? "",
    due_date: brand.started_on ?? "",
    audience: brand.audience ?? "",
    other_details: brand.other_details ?? "",
    client_id: initialClientId ? String(initialClientId) : "",
    _method: "PUT",
  });

  const { data, setData, post, processing, errors } = form;

  const onSubmit = (e) => {
    e.preventDefault();

    form.transform((formData) => {
      const payload = { ...formData };

      if (!(payload.image instanceof File)) {
        delete payload.image;
      }

      if (!(payload.file instanceof File)) {
        delete payload.file;
      }

      delete payload.manager_id;

      return payload;
    });

    form.post(route("brands.update", brand.id), {
      forceFormData: true,
      onFinish: () => {
        form.transform((formData) => ({ ...formData }));
      },
    });
  };

  return (
    <AuthenticatedLayout
      user={auth?.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Edit Brand
          </h2>
        </div>
      }
    >
      <Head title={`Edit ${brand.name}`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <form
              onSubmit={onSubmit}
              className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg"
            >
              {brand.logo_path && (
                <div className="mb-6 flex items-center gap-4">
                  <img
                    src={route("brands.logo", brand.id)}
                    alt={`${brand.name} logo`}
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  <div className="text-sm text-gray-600">
                    <div className="font-medium text-gray-800">Current Logo</div>
                    <div>Upload a new file below to replace.</div>
                  </div>
                </div>
              )}

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
                  onChange={(e) => setData("image", e.target.files[0] ?? null)}
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
                <InputLabel htmlFor="brand_client_id" value="Client" />
                <SelectInput
                  id="brand_client_id"
                  name="client_id"
                  className="mt-1 block w-full"
                  value={data.client_id}
                  onChange={(e) => setData("client_id", e.target.value)}
                  disabled={!hasClients}
                >
                  <option value="">{hasClients ? '-- Select client --' : 'No clients available'}</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </SelectInput>
                <InputError message={errors.client_id} className="mt-2" />
                {!hasClients && (
                  <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                    Create a client before reassigning this brand.
                  </p>
                )}
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

                <InputError message={errors.description} className="mt-2" />
              </div>

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

              <div className="mt-4">
                <InputLabel
                  htmlFor="project_due_date"
                  value="Started On"
                />

                <DatePicker
                  id="project_due_date"
                  name="due_date"
                  value={data.due_date}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("due_date", e.target.value)}
                />

                <InputError message={errors.due_date} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel
                  htmlFor="project_status"
                  value="Brand Status"
                />
                <SelectInput
                  name="status"
                  id="project_status"
                  className="mt-1 block w-full"
                  value={data.status}
                  onChange={(e) => setData("status", e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </SelectInput>
              </div>

              {brand.file_path && (
                <div className="mt-6 text-sm text-gray-600">
                  <div className="font-medium text-gray-800">Current Brand Guidelines</div>
                  <div>
                    <a
                      href={route("brands.guideline", brand.id)}
                      className="text-blue-600 hover:underline"
                    >
                      Download existing file
                    </a>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <InputLabel
                  htmlFor="project_file_path"
                  value="Brand Guidelines"
                />
                <TextInput
                  id="project_file_path"
                  type="file"
                  name="file_path"
                  className="mt-1 block w-full"
                  onChange={(e) => setData("file", e.target.files[0] ?? null)}
                />
                <InputError message={errors.file} className="mt-2" />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <Link
                  href={route("brands.index")}
                  className="btn-secondary"
                >
                  Cancel
                </Link>
                <button disabled={processing} className="btn-primary">
                  {processing ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
