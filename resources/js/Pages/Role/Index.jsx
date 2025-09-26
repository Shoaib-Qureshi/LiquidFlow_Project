import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function RoleIndex({ auth, users, roles, permissions }) {
    const [editingUserId, setEditingUserId] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        userId: '',
        roles: [],
    });

    const handleEditUser = (user) => {
        setEditingUserId(user.id);
        setData({
            userId: user.id,
            roles: user.roles,
        });
    };

    const handleRoleToggle = (roleName) => {
        const updatedRoles = data.roles.includes(roleName)
            ? data.roles.filter(r => r !== roleName)
            : [...data.roles, roleName];

        setData('roles', updatedRoles);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('roles.sync'), {
            preserveScroll: true,
            onSuccess: () => setEditingUserId(null),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Role Management</h2>}
        >
            <Head title="Role Management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="space-y-6">
                                {/* Roles Overview */}
                                <div>
                                    <h3 className="text-lg font-medium">Roles and Permissions</h3>
                                    <div className="mt-4 space-y-4">
                                        {roles.map(role => (
                                            <div key={role.id} className="border p-4 rounded-lg">
                                                <h4 className="font-semibold">{role.name}</h4>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {role.permissions.map(permission => (
                                                        <span
                                                            key={permission}
                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                        >
                                                            {permission}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Users and Their Roles */}
                                <div>
                                    <h3 className="text-lg font-medium">User Roles</h3>
                                    <div className="mt-4 space-y-4">
                                        {users.map(user => (
                                            <div key={user.id} className="border p-4 rounded-lg">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-semibold">{user.name}</h4>
                                                        <p className="text-sm text-gray-500">{user.email}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditUser(user)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        Edit Roles
                                                    </button>
                                                </div>

                                                {editingUserId === user.id ? (
                                                    <form onSubmit={handleSubmit} className="mt-4">
                                                        <div className="space-y-4">
                                                            <div className="flex flex-wrap gap-4">
                                                                {roles.map(role => (
                                                                    <label
                                                                        key={role.id}
                                                                        className="inline-flex items-center"
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                                                            checked={data.roles.includes(role.name)}
                                                                            onChange={() => handleRoleToggle(role.name)}
                                                                        />
                                                                        <span className="ml-2">{role.name}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                            <InputError message={errors.roles} className="mt-2" />
                                                            <div className="flex justify-end gap-4">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setEditingUserId(null)}
                                                                    className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <PrimaryButton disabled={processing}>
                                                                    Save Changes
                                                                </PrimaryButton>
                                                            </div>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {user.roles.map(role => (
                                                            <span
                                                                key={role}
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                                            >
                                                                {role}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}