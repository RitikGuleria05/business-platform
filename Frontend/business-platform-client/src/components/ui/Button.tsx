import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
}

function Button({
    children,
    loading = false,
    disabled,
    className = "",
    ...props
}: ButtonProps) {
    return (
        <button
            {...props}
            disabled={disabled || loading}
            className={`
                inline-flex
                min-h-10
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-indigo-600
                px-4
                py-2.5
                text-sm
                font-medium
                text-white
                shadow-sm
                outline-none
                transition-colors
                duration-150
                hover:bg-indigo-700
                focus-visible:ring-2
                focus-visible:ring-indigo-500
                focus-visible:ring-offset-2
                disabled:cursor-not-allowed
                disabled:opacity-60
                ${className}
            `}
        >
            {loading && (
                <Loader2 className="h-4 w-4 animate-spin" />
            )}

            {children}
        </button>
    );
}

export default Button;