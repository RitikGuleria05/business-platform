import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}

function ConfirmDialog({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    loading = false,
}: ConfirmDialogProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onCancel}
            title={title}
        >
            <div className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/50">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>

                    <div className="min-w-0">
                        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                            {message}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end dark:border-slate-800 dark:bg-slate-950/40">
                <Button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="!w-full !bg-white !text-slate-700 !ring-1 !ring-slate-300 !hover:bg-slate-50 dark:!bg-slate-800 dark:!text-slate-200 dark:!ring-slate-700 dark:!hover:bg-slate-700 sm:!w-auto"
                >
                    Cancel
                </Button>

                <Button
                    type="button"
                    onClick={onConfirm}
                    loading={loading}
                    className="!w-full !bg-red-600 !text-white !hover:bg-red-700 dark:!bg-red-500 dark:!hover:bg-red-600 sm:!w-auto"
                >
                    Delete
                </Button>
            </div>
        </Modal>
    );
}

export default ConfirmDialog;