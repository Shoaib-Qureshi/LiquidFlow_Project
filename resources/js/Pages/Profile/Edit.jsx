import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const page = usePage();
    const auth = page.props?.auth ?? {};

    const resolveRoles = (value) => {
        if (!value) {
            return [];
        }

        if (Array.isArray(value)) {
            return value;
        }

        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            } catch (error) {
                // ignore JSON parse errors and fall back to comma separation
            }

            return value
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);
        }

        if (typeof value === 'object') {
            return Object.values(value);
        }

        return [];
    };

    const rolesArray = resolveRoles(auth.roles);
    const rolesLower = rolesArray.map((role) => String(role).toLowerCase());
    const isAdmin = rolesLower.includes('admin');

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
                        <DeleteUserForm className="max-w-xl" />
                    </div>

                    {isAdmin && (
                        <div className="bg-white p-6 shadow sm:rounded-lg dark:bg-gray-800">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                        Manage User Access
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        As an administrator you can manage user accounts, roles, and permissions from the user management dashboard.
                                    </p>
                                </div>
                                <Link
                                    href={route('user.index')}
                                    className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                                >
                                    Open User Management
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
