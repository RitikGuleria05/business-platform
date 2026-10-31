import type { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
}

function Card({ children, className = "" }: CardProps) {
    return (
        <div
            className={`min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none ${className}`}
        >
            {children}
        </div>
    );
}

export default Card;