import { createContext, ReactNode, useContext } from "react";
import { api } from "../services/api";

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

        try {
        const response = await api.post('sessions', {
            email, password
        })

        console.log(response.data);
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <AuthContext.Provider value={{signIn: signIn, isAuthenticated}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuthContext = () => useContext(AuthContext);

