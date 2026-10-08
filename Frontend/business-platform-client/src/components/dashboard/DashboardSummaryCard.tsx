interface DashboardSummaryCardProps {
    title: string;
    value: string | number;
}

function DashboardSummaryCard({
    title,
    value,
}: DashboardSummaryCardProps) {
    return (
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors sm:p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
                {title}
            </p>

            <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
                {value}
            </p>
        </div>
    );
}

export default DashboardSummaryCard;