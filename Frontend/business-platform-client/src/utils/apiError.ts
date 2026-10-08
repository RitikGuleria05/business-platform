import axios from "axios";

interface ApiErrorResponse {
    statusCode?: number;
    message?: string;
}

export function getApiErrorMessage(
    error: unknown,
    fallback = "Something went wrong."
): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return (
            error.response?.data?.message ??
            error.message ??
            fallback
        );
    }

    if (error instanceof Error) {
        return error.message;
    }

    return fallback;
}