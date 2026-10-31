import { ChevronLeft, ChevronRight, Edit, FolderOpen, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import type { Category } from "../../types/Categories/category.types.ts";

interface CategoryTableProps {
    categories: Category[];
    loading: boolean;
    canEdit: boolean;
    canDelete: boolean;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
}

const ITEMS_PER_PAGE = 10;

function CategoryTable({
    categories,
    loading,
    canEdit,
    canDelete,
    onEdit,
    onDelete,
}: CategoryTableProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.max(
        1,
        Math.ceil(categories.length / ITEMS_PER_PAGE)
    );

    const safeCurrentPage = Math.min(currentPage, totalPages);

    const paginatedCategories = useMemo(() => {
        const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;

        return categories.slice(startIndex, endIndex);
    }, [categories, safeCurrentPage]);

    const startItem =
        categories.length === 0
            ? 0
            : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1;

    const endItem = Math.min(
        safeCurrentPage * ITEMS_PER_PAGE,
        categories.length
    );

    const handlePreviousPage = () => {
        setCurrentPage((page) => Math.max(page - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((page) => Math.min(page + 1, totalPages));
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const getPageNumbers = () => {
        const pages: (number | "...")[] = [];

        if (totalPages <= 5) {
            for (let page = 1; page <= totalPages; page++) {
                pages.push(page);
            }

            return pages;
        }

        pages.push(1);

        if (safeCurrentPage > 3) {
            pages.push("...");
        }

        const startPage = Math.max(2, safeCurrentPage - 1);
        const endPage = Math.min(totalPages - 1, safeCurrentPage + 1);

        for (let page = startPage; page <= endPage; page++) {
            pages.push(page);
        }

        if (safeCurrentPage < totalPages - 2) {
            pages.push("...");
        }

        pages.push(totalPages);

        return pages;
    };

    if (loading) {
        return (
            <div className="space-y-3 p-5">
                <div className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />

                {Array.from({ length: 5 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-14 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800"
                    />
                ))}
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-5 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                    <FolderOpen className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    No categories found
                </h3>

                <p className="mt-1 max-w-sm text-sm leading-5 text-slate-500 dark:text-slate-400">
                    Create your first category to start organizing products.
                </p>
            </div>
        );
    }

    return (
        <div className="min-w-0">
            <div className="min-w-0 overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                    <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60">
                        <tr>
                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Category
                            </th>

                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Description
                            </th>

                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Status
                            </th>

                            {(canEdit || canDelete) && (
                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {paginatedCategories.map((category) => (
                            <tr
                                key={category.id}
                                className="border-b border-slate-200 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                            >
                                <td className="px-5 py-4">
                                    <p className="font-medium text-slate-900 dark:text-slate-100">
                                        {category.name}
                                    </p>
                                </td>

                                <td className="max-w-[360px] px-5 py-4">
                                    <p className="break-words text-sm text-slate-500 dark:text-slate-400">
                                        {category.description || "—"}
                                    </p>
                                </td>

                                <td className="whitespace-nowrap px-5 py-4">
                                    {category.isActive ? (
                                        <Badge variant="success">
                                            Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="neutral">
                                            Inactive
                                        </Badge>
                                    )}
                                </td>

                                {(canEdit || canDelete) && (
                                    <td className="whitespace-nowrap px-5 py-4">
                                        <div className="flex justify-end gap-2">
                                            {canEdit && (
                                                <Button
                                                    type="button"
                                                    onClick={() =>
                                                        onEdit(category)
                                                    }
                                                    aria-label="Edit category"
                                                    title="Edit category"
                                                    className="!min-h-9 !w-9 !rounded-lg !bg-white !p-0 !text-slate-700 !shadow-none !ring-1 !ring-slate-200 !hover:bg-slate-50 dark:!bg-slate-800 dark:!text-slate-200 dark:!ring-slate-700 dark:!hover:bg-slate-700"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    <span className="sr-only">
                                                        Edit
                                                    </span>
                                                </Button>
                                            )}

                                            {canDelete && (
                                                <Button
                                                    type="button"
                                                    onClick={() =>
                                                        onDelete(category)
                                                    }
                                                    aria-label="Delete category"
                                                    title="Delete category"
                                                    className="!min-h-9 !w-9 !rounded-lg !bg-red-600 !p-0 !text-white !shadow-none !hover:bg-red-700 dark:!bg-red-500 dark:!hover:bg-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">
                                                        Delete
                                                    </span>
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Showing{" "}
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                        {startItem}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                        {endItem}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                        {categories.length}
                    </span>{" "}
                    categories
                </p>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                        <Button
                            type="button"
                            onClick={handlePreviousPage}
                            disabled={safeCurrentPage === 1}
                            aria-label="Previous page"
                            className="!min-h-9 !w-9 !rounded-lg !bg-white !p-0 !text-slate-700 !shadow-none !ring-1 !ring-slate-200 !hover:bg-slate-50 dark:!bg-slate-800 dark:!text-slate-200 dark:!ring-slate-700 dark:!hover:bg-slate-700"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-1">
                            {getPageNumbers().map((page, index) => {
                                if (page === "...") {
                                    return (
                                        <span
                                            key={`ellipsis-${index}`}
                                            className="flex h-9 min-w-9 items-center justify-center px-1 text-sm text-slate-400 dark:text-slate-500"
                                        >
                                            ...
                                        </span>
                                    );
                                }

                                const isActive = page === safeCurrentPage;

                                return (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() =>
                                            handlePageChange(page)
                                        }
                                        aria-label={`Go to page ${page}`}
                                        aria-current={
                                            isActive ? "page" : undefined
                                        }
                                        className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                            isActive
                                                ? "bg-indigo-600 text-white dark:bg-indigo-500"
                                                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                        </div>

                        <Button
                            type="button"
                            onClick={handleNextPage}
                            disabled={safeCurrentPage === totalPages}
                            aria-label="Next page"
                            className="!min-h-9 !w-9 !rounded-lg !bg-white !p-0 !text-slate-700 !shadow-none !ring-1 !ring-slate-200 !hover:bg-slate-50 dark:!bg-slate-800 dark:!text-slate-200 dark:!ring-slate-700 dark:!hover:bg-slate-700"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CategoryTable;