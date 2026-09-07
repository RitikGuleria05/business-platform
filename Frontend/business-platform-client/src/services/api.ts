import axios, {
    type AxiosError,
    type InternalAxiosRequestConfig,
} from "axios";

import { authStorage } from "./authStorage";
import { refreshToken } from "./authService";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

let refreshPromise: Promise<string> | null = null;

interface RetryConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

api.interceptors.request.use(
    (config) => {
        const token = authStorage.getAccessToken();

        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },

    async (error: AxiosError) => {
        const originalRequest =
            error.config as RetryConfig | undefined;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        const isUnauthorized =
            error.response?.status === 401;

        const isRefreshRequest =
            originalRequest.url?.includes(
                "/auth/refresh-token"
            );

        if (
            !isUnauthorized ||
            originalRequest._retry ||
            isRefreshRequest
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            if (!refreshPromise) {
                refreshPromise = refreshToken()
                    .then((response) => {
                        authStorage.saveAuth(response);

                        return response.token;
                    })
                    .finally(() => {
                        refreshPromise = null;
                    });
            }

            const newAccessToken =
                await refreshPromise;

            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;

            return api(originalRequest);
        } catch (refreshError) {
            refreshPromise = null;

            authStorage.clear();

            return Promise.reject(refreshError);
        }
    }
);

export default api;