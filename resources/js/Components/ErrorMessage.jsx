export default function ErrorMessage({ 
    title = "Error", 
    message, 
    onRetry, 
    className = "",
    type = "error" // error, warning, info
}) {
    const typeStyles = {
        error: {
            container: "bg-red-50 border-red-200",
            icon: "text-red-400",
            title: "text-red-800",
            message: "text-red-700",
            button: "bg-red-600 hover:bg-red-700 focus:ring-red-500"
        },
        warning: {
            container: "bg-yellow-50 border-yellow-200",
            icon: "text-yellow-400",
            title: "text-yellow-800",
            message: "text-yellow-700",
            button: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500"
        },
        info: {
            container: "bg-blue-50 border-blue-200",
            icon: "text-blue-400",
            title: "text-blue-800",
            message: "text-blue-700",
            button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
        }
    };

    const styles = typeStyles[type];

    const getIcon = () => {
        switch (type) {
            case 'warning':
                return (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                );
            case 'info':
                return (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    return (
        <div className={`rounded-md border p-4 ${styles.container} ${className}`}>
            <div className="flex">
                <div className="flex-shrink-0">
                    <div className={styles.icon}>
                        {getIcon()}
                    </div>
                </div>
                <div className="ml-3 flex-1">
                    <h3 className={`text-sm font-medium ${styles.title}`}>
                        {title}
                    </h3>
                    {message && (
                        <div className={`mt-2 text-sm ${styles.message}`}>
                            <p>{message}</p>
                        </div>
                    )}
                    {onRetry && (
                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={onRetry}
                                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${styles.button} focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors`}
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Empty State Component
export function EmptyState({ 
    title = "No data found", 
    description, 
    action, 
    icon,
    className = "" 
}) {
    return (
        <div className={`text-center py-12 ${className}`}>
            <div className="mx-auto h-12 w-12 text-gray-400">
                {icon || (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                )}
            </div>
            <h3 className="mt-4 text-sm font-medium text-gray-900">{title}</h3>
            {description && (
                <p className="mt-2 text-sm text-gray-500">{description}</p>
            )}
            {action && (
                <div className="mt-6">
                    {action}
                </div>
            )}
        </div>
    );
}
