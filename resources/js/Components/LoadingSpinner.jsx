export default function LoadingSpinner({ size = "md", className = "" }) {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8",
        xl: "w-12 h-12"
    };

    return (
        <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`}></div>
    );
}

// Loading Skeleton Component
export function LoadingSkeleton({ className = "", rows = 1 }) {
    return (
        <div className={`animate-pulse ${className}`}>
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="h-4 bg-gray-200 rounded mb-2 last:mb-0"></div>
            ))}
        </div>
    );
}

// Page Loading Component
export function PageLoading() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <LoadingSpinner size="xl" />
                <p className="mt-4 text-gray-600">Loading...</p>
            </div>
        </div>
    );
}

// Button Loading State
export function LoadingButton({ loading, children, className = "", ...props }) {
    return (
        <button
            {...props}
            disabled={loading || props.disabled}
            className={`inline-flex items-center justify-center ${className} ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
        >
            {loading && <LoadingSpinner size="sm" className="mr-2" />}
            {children}
        </button>
    );
}
