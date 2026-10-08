import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalProps {
    isOpen: boolean;
    title: string;
    description?: string;
    children: ReactNode;
    onClose: () => void;
    maxWidth?: string;
}

function Modal({
    isOpen,
    title,
    description,
    children,
    onClose,
    maxWidth = "max-w-lg",
}: ModalProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-slate-900/40
                p-3
                sm:p-4
            "
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            <div
                className={`
                    flex
                    w-full
                    min-w-0
                    ${maxWidth}
                    max-h-[calc(100dvh-24px)]
                    flex-col
                    overflow-hidden
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    shadow-xl
                    sm:max-h-[90vh]
                `}
            >
                {/* Header */}
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-6">
                    <div className="min-w-0">
                        <h2 className="break-words text-base font-semibold text-slate-900 sm:text-lg">
                            {title}
                        </h2>

                        {description && (
                            <p className="mt-1 break-words text-sm leading-5 text-slate-500">
                                {description}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            shrink-0
                            rounded-lg
                            p-1.5
                            text-slate-400
                            outline-none
                            transition-colors
                            duration-150
                            hover:bg-slate-100
                            hover:text-slate-600
                            focus-visible:ring-2
                            focus-visible:ring-indigo-500
                        "
                        aria-label="Close modal"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="min-h-0 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Modal;