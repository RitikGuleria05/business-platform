import { AlertTriangle } from "lucide-react";
import Button from "./Button";
import Modal from "./Modal";

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = "Confirm",
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    return (
        <Modal
            isOpen={isOpen}
            title={title}
            onClose={onCancel}
            maxWidth="max-w-md"
        >
            <div className="space-y-5">
                <div className="flex min-w-0 gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>

                    <p className="min-w-0 text-sm leading-6 text-slate-600">
                        {message}
                    </p>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="w-full bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:w-auto"
                    >
                        Cancel
                    </Button>

                    <Button
                        type="button"
                        onClick={onConfirm}
                        loading={loading}
                        className="w-full bg-red-600 hover:bg-red-700 sm:w-auto"
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

export default ConfirmDialog;