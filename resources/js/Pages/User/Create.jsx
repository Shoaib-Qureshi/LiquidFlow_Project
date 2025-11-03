import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import MultiSelectDropdown from "@/Components/MultiSelectDropdown";
import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Create({ auth, brands = [] }) {
  const isManager = auth?.user?.roles?.some((role) => role.name === "Manager");

  const { data, setData, post, errors } = useForm({
    name: "",
    email: "",
    password: "",
    brand_ids: [],
  });

  const onSubmit = (e) => {
    e.preventDefault();
    post(route("user.store"), { preserveScroll: true });
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Invite Team Member
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter the teammate’s details. LiquidFlow will generate a secure
            password and email their invitation automatically.
          </p>
        </div>
      }
    >
      <Head title="Invite Team Member" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="px-5 py-5 border-b border-gray-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Teammate details
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              The invite email includes login instructions and the generated
              password. You can assign brands immediately below.
            </p>
          </div>
          <form onSubmit={onSubmit} className="px-5 py-6 space-y-6">
            <div>
              <InputLabel htmlFor="user_name" value="Full name" />
              <TextInput
                id="user_name"
                type="text"
                name="name"
                value={data.name}
                autoFocus
                className="mt-2 block w-full"
                onChange={(e) => setData("name", e.target.value)}
              />
              <InputError message={errors.name} className="mt-2" />
            </div>

            <div>
              <InputLabel htmlFor="user_email" value="Work email" />
              <TextInput
                id="user_email"
                type="email"
                name="email"
                value={data.email}
                className="mt-2 block w-full"
                onChange={(e) => setData("email", e.target.value)}
              />
              <InputError message={errors.email} className="mt-2" />
            </div>

            {!isManager && (
              <div>
                <InputLabel htmlFor="user_password" value="Password (optional)" />
                <TextInput
                  id="user_password"
                  type="password"
                  name="password"
                  value={data.password}
                  className="mt-2 block w-full"
                  placeholder="Leave blank to auto-generate"
                  onChange={(e) => setData("password", e.target.value)}
                />
                <InputError message={errors.password} className="mt-2" />
              </div>
            )}

            {isManager && (
              <div>
                <InputLabel value="Assign brands" />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Choose the brands this teammate should access. You can update
                  this later.
                </p>
                <div className="mt-2">
                  <MultiSelectDropdown
                    options={brands}
                    selected={data.brand_ids}
                    onChange={(next) => setData("brand_ids", next)}
                    placeholder="Select brands..."
                  />
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-gray-300">
              A secure password is generated automatically. The teammate will be
              prompted to change it after their first login.
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6 dark:border-slate-800">
              <Link
                href={route("user.index")}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-800"
              >
                Cancel
              </Link>
              <button className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500">
                Send Invite
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
