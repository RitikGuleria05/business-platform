function Dashboard() {
    return (
        <div className="min-h-screen bg-slate-100 p-10">
            <div className="rounded-xl bg-white p-8 shadow-sm">
                <h1 className="text-4xl font-bold text-indigo-600">
                    Tailwind is Working
                </h1>

                <p className="mt-4 text-lg text-slate-600">
                    BusinessPlatform Dashboard
                </p>

                <button className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700">
                    Test Button
                </button>
            </div>
        </div>
    );
}

export default Dashboard;