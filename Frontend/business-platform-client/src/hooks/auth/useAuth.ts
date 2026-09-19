import { useState, useCallback } from "react";
import { authStorage } from "../../services/authStorage";

export const useAuth = () => {
    const [user, setUser] = useState(
        () => authStorage.getUser()
    );

    const [permissions, setPermissions] = useState<string[]>(
        () => authStorage.getPermissions()
    );

    const token = authStorage.getAccessToken();

    const isAuthenticated = Boolean(token);

    const userRole = user?.role ?? "";

    const hasRole = useCallback(
        (allowedRoles: string[]) => {
            if (!userRole) return false;

            return allowedRoles.includes(userRole);
        },
        [userRole]
    );

    const hasPermission = useCallback(
        (permission: string) => {
            return permissions.includes(permission);
        },
        [permissions]
    );

    const setAuthPermissions = useCallback(
        (newPermissions: string[]) => {
            authStorage.savePermissions(newPermissions);
            setPermissions(newPermissions);
        },
        []
    );

    const logout = useCallback(() => {
        authStorage.clear();

        setUser(null);
        setPermissions([]);
    }, []);

    return {
        user,
        token,
        userRole,
        permissions,
        isAuthenticated,
        hasRole,
        hasPermission,
        setAuthPermissions,
        logout,
    };
};