import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
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
        <div>
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
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    text-slate-900
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-indigo-500
                    focus:ring-2
                    focus:ring-indigo-100
                    disabled:cursor-not-allowed
                    disabled:bg-slate-100
                    ${error ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""}
                    ${className}
                `}
            />

            {error && (
                <p className="mt-1.5 text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}

export default Input;