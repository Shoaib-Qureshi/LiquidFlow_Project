import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import TextAreaInput from "@/Components/TextAreaInput";
import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Create({ auth, managers = [] }) {
  const { data, setData, post, processing, errors } = useForm({
    logo: "",
    name: "",
    description: "",
    audience: "",
    other_details: "",
    started_on: "",
    in_progress: false,
    status: "active",
    guideline: "",
    manager_id: "",
  });

  const onSubmit = (e) => {
    e.preventDefault();
    post(route("brands.store"), {
      forceFormData: true,
    });
  };

  return (
    <AuthenticatedLayout
      user={auth?.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Create Brand
          </h2>
        </div>
      }
    >
      <Head title="Create Brand" />

      <div className="py-12">
        <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
          <div className="card-soft">
            <form onSubmit={onSubmit} className="p-6">
              <div>
                <InputLabel htmlFor="brand_logo" value="Brand Logo" />
                <TextInput
                  id="brand_logo"
                  type="file"
                  name="logo"
                  className="form-input mt-1"
                  onChange={(e) => setData("logo", e.target.files[0])}
                />
                <InputError message={errors.logo} className="mt-2" />
              </div>

              <div>
                <InputLabel htmlFor="brand_name" value="Brand Name" />
                <TextInput
                  id="brand_name"
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
                <InputLabel htmlFor="brand_description" value="Description" />
                <TextAreaInput
                  id="brand_description"
                  name="description"
                  value={data.description}
                  className="form-input mt-1"
                  onChange={(e) => setData("description", e.target.value)}
                />
                <InputError message={errors.description} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="brand_audience" value="Target Audience" />
                <TextAreaInput
                  id="brand_audience"
                  name="audience"
                  value={data.audience}
                  className="form-input mt-1"
                  onChange={(e) => setData("audience", e.target.value)}
                />
                <InputError message={errors.audience} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="brand_other_details" value="Other Details" />
                <TextAreaInput
                  id="brand_other_details"
                  name="other_details"
                  value={data.other_details}
                  className="form-input mt-1"
                  onChange={(e) => setData("other_details", e.target.value)}
                />
                <InputError message={errors.other_details} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="brand_started_on" value="Started On" />
                <TextInput
                  id="brand_started_on"
                  type="date"
                  name="started_on"
                  value={data.started_on}
                  className="form-input mt-1"
                  onChange={(e) => setData("started_on", e.target.value)}
                />
                <InputError message={errors.started_on} className="mt-2" />
              </div>

              {Array.isArray(managers) && managers.length > 0 && (
                <div className="mt-4">
                  <InputLabel htmlFor="brand_manager" value="Assign Manager (optional)" />
                  <SelectInput
                    id="brand_manager"
                    name="manager_id"
                    className="form-select mt-1"
                    value={data.manager_id}
                    onChange={(e) => setData("manager_id", e.target.value)}
                  >
                    <option value="">None</option>
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.email})
                      </option>
                    ))}
                  </SelectInput>
                  <InputError message={errors.manager_id} className="mt-2" />
                </div>
              )}

              <div className="mt-4">
                <InputLabel htmlFor="brand_guideline" value="Brand Guidelines" />
                <TextInput
                  id="brand_guideline"
                  type="file"
                  name="guideline"
                  className="form-input mt-1"
                  onChange={(e) => setData("guideline", e.target.files[0])}
                />
                <InputError message={errors.guideline} className="mt-2" />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <Link href={route("brands.index")}
                  className="btn-secondary"
                >
                  Cancel
                </Link>
                <button disabled={processing} className="btn-primary">
                  {processing ? "Saving..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
