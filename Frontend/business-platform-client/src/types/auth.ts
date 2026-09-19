export interface RegisterRequest {
    userName: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    userName: string;
    role: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}