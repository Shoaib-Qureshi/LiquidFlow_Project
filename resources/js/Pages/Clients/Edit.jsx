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

export default function Edit({ auth, client }) {
  const form = useForm({
    _method: "put",
    name: client.name ?? "",
    status: client.status ?? "active",
    logo: null,
    website: client.website ?? "",
    contact_email: client.contact_email ?? "",
    contact_phone: client.contact_phone ?? "",
    description: client.description ?? "",
    notes: client.notes ?? "",
  });

  const submit = (event) => {
    event.preventDefault();
    form.post(route("clients.update", client.id), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => form.setData("logo", null),
    });
  };

  const handleFileChange = (event) => {
    form.setData("logo", event.target.files[0] ?? null);
  };

  const logoUrl = client.logo_path ? `/storage/${client.logo_path}` : null;

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Edit Client
          </h2>
          <Link href={route("clients.show", client.id)} className="btn-secondary">
            Cancel
          </Link>
        </div>
      }
    >
      <Head title={`Edit ${client.name}`} />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <div className="card-soft">
            <form className="p-6 space-y-6" onSubmit={submit}>
              <div>
                <InputLabel htmlFor="client_name" value="Client Name" />
                <TextInput
                  id="client_name"
                  value={form.data.name}
                  onChange={(event) => form.setData("name", event.target.value)}
                  className="mt-1 block w-full"
                  autoComplete="off"
                  required
                />
                <InputError message={form.errors.name} className="mt-2" />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <InputLabel htmlFor="client_status" value="Status" />
                  <SelectInput
                    id="client_status"
                    name="status"
                    value={form.data.status}
                    onChange={(event) => form.setData("status", event.target.value)}
                    className="mt-1 block w-full"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </SelectInput>
                  <InputError message={form.errors.status} className="mt-2" />
                </div>

                <div>
                  <InputLabel htmlFor="client_logo" value="Logo" />
                  <TextInput id="client_logo" type="file" className="mt-1 block w-full" onChange={handleFileChange} />
                  <InputError message={form.errors.logo} className="mt-2" />
                  {form.progress && (
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Uploading... {form.progress.percentage}%
                    </div>
                  )}
                  {logoUrl && (
                    <div className="mt-3">
                      <span className="text-sm text-gray-600 dark:text-gray-300 block mb-2">Current Logo</span>
                      <img src={logoUrl} alt={`${client.name} logo`} className="h-16 rounded border border-gray-200 dark:border-slate-700 bg-white" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <InputLabel htmlFor="client_website" value="Website" />
                  <TextInput
                    id="client_website"
                    value={form.data.website}
                    onChange={(event) => form.setData("website", event.target.value)}
                    className="mt-1 block w-full"
                    placeholder="https://example.com"
                  />
                  <InputError message={form.errors.website} className="mt-2" />
                </div>

                <div>
                  <InputLabel htmlFor="client_contact_email" value="Primary Contact Email" />
                  <TextInput
                    id="client_contact_email"
                    type="email"
                    value={form.data.contact_email}
                    onChange={(event) => form.setData("contact_email", event.target.value)}
                    className="mt-1 block w-full"
                  />
                  <InputError message={form.errors.contact_email} className="mt-2" />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <InputLabel htmlFor="client_contact_phone" value="Primary Contact Phone" />
                  <TextInput
                    id="client_contact_phone"
                    value={form.data.contact_phone}
                    onChange={(event) => form.setData("contact_phone", event.target.value)}
                    className="mt-1 block w-full"
                  />
                  <InputError message={form.errors.contact_phone} className="mt-2" />
                </div>
                <div />
              </div>

              <div>
                <InputLabel htmlFor="client_description" value="Description" />
                <TextAreaInput
                  id="client_description"
                  value={form.data.description}
                  onChange={(event) => form.setData("description", event.target.value)}
                  className="mt-1 block w-full"
                  rows={4}
                />
                <InputError message={form.errors.description} className="mt-2" />
              </div>

              <div>
                <InputLabel htmlFor="client_notes" value="Internal Notes" />
                <TextAreaInput
                  id="client_notes"
                  value={form.data.notes}
                  onChange={(event) => form.setData("notes", event.target.value)}
                  className="mt-1 block w-full"
                  rows={4}
                />
                <InputError message={form.errors.notes} className="mt-2" />
              </div>

              <div className="flex justify-end gap-3">
                <Link href={route("clients.show", client.id)} className="btn-secondary">
                  Cancel
                </Link>
                <button type="submit" className="btn-primary" disabled={form.processing}>
                  {form.processing ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
