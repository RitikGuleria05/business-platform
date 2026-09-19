import {createContext,useCallback,useContext,useState,type ReactNode} from "react";

import { authStorage } from "../../services/authStorage";

interface AuthContextType {
    user: any;
    token: string | null;
    permissions: string[];
    userRole: string;
    isAuthenticated: boolean;

    hasRole: (allowedRoles: string[]) => boolean;
    hasPermission: (permission: string) => boolean;

    setAuth: (
        user: any,
        token: string,
        permissions: string[]
    ) => void;

    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({
    children,
}: AuthProviderProps) {
    const [user, setUser] = useState(
        () => authStorage.getUser()
    );

    const [token, setToken] = useState<string | null>(
        () => authStorage.getAccessToken()
    );

    const [permissions, setPermissions] = useState<string[]>(
        () => authStorage.getPermissions()
    );

    const userRole = user?.role ?? "";

    const isAuthenticated = Boolean(token);

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

    const setAuth = useCallback(
        (
            newUser: any,
            newToken: string,
            newPermissions: string[]
        ) => {
            setUser(newUser);
            setToken(newToken);
            setPermissions(newPermissions);
        },
        []
    );

    const logout = useCallback(() => {
        authStorage.clear();

        setUser(null);
        setToken(null);
        setPermissions([]);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                permissions,
                userRole,
                isAuthenticated,
                hasRole,
                hasPermission,
                setAuth,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}