import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import TextAreaInput from "@/Components/TextAreaInput";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function Create({ auth }) {
  const { data, setData, post, errors, processing, progress, reset } = useForm({
    name: "",
    status: "active",
    logo: null,
    website: "",
    contact_email: "",
    contact_phone: "",
    description: "",
    notes: "",
  });

  const submit = (event) => {
    event.preventDefault();
    post(route("clients.store"), {
      forceFormData: true,
      onSuccess: () => reset("logo"),
    });
  };

  const handleFileChange = (event) => {
    setData("logo", event.target.files[0] ?? null);
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Add Client
          </h2>
          <Link href={route("clients.index")} className="btn-secondary">
            Cancel
          </Link>
        </div>
      }
    >
      <Head title="Add Client" />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <div className="card-soft">
            <form className="p-6 space-y-6" onSubmit={submit}>
              <div>
                <InputLabel htmlFor="client_name" value="Client Name" />
                <TextInput
                  id="client_name"
                  value={data.name}
                  onChange={(event) => setData("name", event.target.value)}
                  className="mt-1 block w-full"
                  autoComplete="off"
                  required
                />
                <InputError message={errors.name} className="mt-2" />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <InputLabel htmlFor="client_status" value="Status" />
                  <SelectInput
                    id="client_status"
                    value={data.status}
                    onChange={(event) => setData("status", event.target.value)}
                    className="mt-1 block w-full"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </SelectInput>
                  <InputError message={errors.status} className="mt-2" />
                </div>

                <div>
                  <InputLabel htmlFor="client_logo" value="Logo" />
                  <TextInput id="client_logo" type="file" className="mt-1 block w-full" onChange={handleFileChange} />
                  <InputError message={errors.logo} className="mt-2" />
                  {progress && (
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Uploading... {progress.percentage}%
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <InputLabel htmlFor="client_website" value="Website" />
                  <TextInput
                    id="client_website"
                    value={data.website}
                    onChange={(event) => setData("website", event.target.value)}
                    className="mt-1 block w-full"
                    placeholder="https://example.com"
                  />
                  <InputError message={errors.website} className="mt-2" />
                </div>

                <div>
                  <InputLabel htmlFor="client_contact_email" value="Primary Contact Email" />
                  <TextInput
                    id="client_contact_email"
                    type="email"
                    value={data.contact_email}
                    onChange={(event) => setData("contact_email", event.target.value)}
                    className="mt-1 block w-full"
                  />
                  <InputError message={errors.contact_email} className="mt-2" />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <InputLabel htmlFor="client_contact_phone" value="Primary Contact Phone" />
                  <TextInput
                    id="client_contact_phone"
                    value={data.contact_phone}
                    onChange={(event) => setData("contact_phone", event.target.value)}
                    className="mt-1 block w-full"
                  />
                  <InputError message={errors.contact_phone} className="mt-2" />
                </div>
                <div />
              </div>

              <div>
                <InputLabel htmlFor="client_description" value="Description" />
                <TextAreaInput
                  id="client_description"
                  value={data.description}
                  onChange={(event) => setData("description", event.target.value)}
                  className="mt-1 block w-full"
                  rows={4}
                />
                <InputError message={errors.description} className="mt-2" />
              </div>

              <div>
                <InputLabel htmlFor="client_notes" value="Internal Notes" />
                <TextAreaInput
                  id="client_notes"
                  value={data.notes}
                  onChange={(event) => setData("notes", event.target.value)}
                  className="mt-1 block w-full"
                  rows={4}
                />
                <InputError message={errors.notes} className="mt-2" />
              </div>

              <div className="flex justify-end gap-3">
                <Link href={route("clients.index")} className="btn-secondary">
                  Cancel
                </Link>
                <button type="submit" className="btn-primary" disabled={processing}>
                  {processing ? "Saving..." : "Save Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
