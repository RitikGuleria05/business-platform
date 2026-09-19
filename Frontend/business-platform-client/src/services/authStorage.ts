import type { LoginResponse } from "../types/auth";

const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "authUser";
const PERMISSIONS_KEY = "authPermissions";
const REMEMBER_EMAIL_KEY = "rememberedEmail";

export const authStorage = {
    saveAuth(data: LoginResponse) {
        localStorage.setItem(
            ACCESS_TOKEN_KEY,
            data.token
        );

        localStorage.setItem(
            USER_KEY,
            JSON.stringify({
                userName: data.userName,
                role: data.role,
            })
        );
    },

    getAccessToken() {
        return localStorage.getItem(
            ACCESS_TOKEN_KEY
        );
    },

    getUser() {
        const user = localStorage.getItem(
            USER_KEY
        );

        return user
            ? JSON.parse(user)
            : null;
    },

    savePermissions(permissions: string[]) {
        localStorage.setItem(
            PERMISSIONS_KEY,
            JSON.stringify(permissions)
        );
    },

    getPermissions(): string[] {
        const permissions = localStorage.getItem(
            PERMISSIONS_KEY
        );

        return permissions
            ? JSON.parse(permissions)
            : [];
    },

    saveRememberedEmail(email: string) {
        localStorage.setItem(
            REMEMBER_EMAIL_KEY,
            email
        );
    },

    getRememberedEmail() {
        return localStorage.getItem(
            REMEMBER_EMAIL_KEY
        );
    },

    clearRememberedEmail() {
        localStorage.removeItem(
            REMEMBER_EMAIL_KEY
        );
    },

    clear() {
        localStorage.removeItem(
            ACCESS_TOKEN_KEY
        );

        localStorage.removeItem(
            USER_KEY
        );

        localStorage.removeItem(
            PERMISSIONS_KEY
        );
    },
};