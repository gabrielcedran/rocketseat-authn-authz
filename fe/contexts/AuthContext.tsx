import { createContext, ReactNode, useContext } from "react";

type SignInCredentials = {
    email: string;
    password: string;
}

type AuthContextData = {
    signIn(credentials: SignInCredentials): Promise<void>;
    isAuthenticated: boolean;
}

export const AuthContext = createContext({} as AuthContextData);


type AuthContextProviderProps = {
    children: ReactNode;
}

export const AuthContextProvider = ({children}: AuthContextProviderProps) => {

    const isAuthenticated = false;

    async function signIn({email, password}: SignInCredentials) {
        console.log(email, password);
    }

    return (
        <AuthContext.Provider value={{signIn: signIn, isAuthenticated}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuthContext = () => useContext(AuthContext);

