import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function Guest({ children }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <Link href="/" className="flex justify-center">
                        <ApplicationLogo className="h-12 w-auto" />
                    </Link>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        Sign in to your account
                    </h2>
                </div>

                <div className="rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800">
                    {children}
                </div>
            </div>
        </div>
    );
}
