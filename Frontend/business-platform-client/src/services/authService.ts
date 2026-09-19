import api from "./api";
import authApi from "../services/Auth/authApi";

import type {
    RegisterRequest,
    LoginRequest,
    LoginResponse,
    ChangePasswordRequest,
} from "../types/auth";

export const register = async (request: RegisterRequest) => {
    const response = await api.post(
        "/auth/registor",
        request
    );

    return response.data;
};

export const login = async (request: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(
        "/auth/login",
        request
    );

    return response.data;
};

export const refreshToken =
    async (): Promise<LoginResponse> => {
        const response =
            await authApi.post<LoginResponse>(
                "/auth/refresh-token"
            );

        return response.data;
    };

export const logout = async () => {
    const response = await api.post("/auth/logout");

    return response.data;
};

export const changePassword = async (request: ChangePasswordRequest) => {
    const response =
        await api.post(
            "/auth/change-password",
            request
        );

    return response.data;
};

export const getUserPermissions = async (): Promise<string[]> => {
    const response = await api.get<string[]>("/auth/permissions");

    return response.data;
};