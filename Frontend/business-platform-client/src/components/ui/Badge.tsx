interface BadgeProps {
    children: React.ReactNode;
    variant?:
        | "success"
        | "warning"
        | "danger"
        | "neutral";
    className?: string;
}

function Badge({
    children,
    variant = "neutral",
    className = "",
}: BadgeProps) {
    const variantStyles = {
        success:
            "border-green-200 bg-green-50 text-green-700",
        warning:
            "border-amber-200 bg-amber-50 text-amber-700",
        danger:
            "border-red-200 bg-red-50 text-red-700",
        neutral:
            "border-slate-200 bg-slate-50 text-slate-600",
    };

    return (
        <span
            className={`
                inline-flex
                items-center
                rounded-md
                border
                px-2.5
                py-1
                text-xs
                font-medium
                ${variantStyles[variant]}
                ${className}
            `}
        >
            {children}
        </span>
    );
}

export default Badge;