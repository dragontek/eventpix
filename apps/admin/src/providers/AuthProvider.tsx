import { createContext, useContext, useEffect, useState } from 'react';
import { useData } from './DataProvider';
import type { User } from './types';

interface AuthContextType {
    isAuth: boolean;
    user: User | null;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const data = useData();
    const [isAuth, setIsAuth] = useState(data.getAuthStoreIsValid());
    const [user, setUser] = useState<User | null>(data.getUser());

    useEffect(() => {
        return data.onAuthChange((u) => {
            setIsAuth(!!u);
            setUser(u);
        });
    }, [data]);

    const login = async (email: string, pass: string) => {
        await data.login(email, pass);
    };

    const logout = () => {
        data.logout();
    };

    return (
        <AuthContext.Provider value={{ isAuth, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
