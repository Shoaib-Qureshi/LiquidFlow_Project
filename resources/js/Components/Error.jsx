function Index({ error }) {
    return (
        <div>
            {error && (
                <div className="bg-emerald-500 py-2 px-4 text-white rounded mb-4">
                    {error}
                </div>
            )}
        </div>
    );
}

export default Index;
