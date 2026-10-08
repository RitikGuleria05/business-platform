import type { InputHTMLAttributes } from "react";

interface InputProps
    extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

function Input({
    label,
    error,
    className = "",
    ...props
}: InputProps) {
    return (
        <div className="min-w-0">
            {label && (
                <label
                    htmlFor={props.id}
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                    {label}
                </label>
            )}

            <input
                {...props}
                className={`
                    h-11
                    w-full
                    min-w-0
                    rounded-lg
                    border
                    border-slate-300
                    bg-white
                    px-3
                    text-sm
                    text-slate-900
                    outline-none
                    transition-colors
                    duration-150
                    placeholder:text-slate-400
                    hover:border-slate-400
                    focus:border-indigo-500
                    focus:ring-2
                    focus:ring-indigo-500/20
                    disabled:cursor-not-allowed
                    disabled:bg-slate-50
                    disabled:text-slate-400
                    ${
                        error
                            ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                            : ""
                    }
                    ${className}
                `}
            />

            {error && (
                <p className="mt-1.5 text-xs leading-4 text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}

export default Input;