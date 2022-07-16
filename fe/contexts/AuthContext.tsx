import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api } from "../services/apiClient";
import Router from 'next/router';
import {destroyCookie, parseCookies, setCookie} from 'nookies';

type User = {
    email: string,
    permissions: string[],
    roles: string[],
}

type SignInCredentials = {
    email: string;
    password: string;
}

type AuthContextData = {
    signIn(credentials: SignInCredentials): Promise<void>;
    user: User;
    isAuthenticated: boolean;
}

export const AuthContext = createContext({} as AuthContextData);


type AuthContextProviderProps = {
    children: ReactNode;
}

export const AuthContextProvider = ({children}: AuthContextProviderProps) => {

    const [user, setUser] = useState<User>()
    const isAuthenticated = !!user;


    useEffect(() => {
        const {'nextAuthApp.token': token} = parseCookies();
        
        if (token) {
            api.get('/me').then(response => {
                const {email, permissions, roles} = response.data;

                setUser({email, permissions, roles});
            })
            .catch(() => {
                signOut();
            });
        }

    }, [])

    async function signIn({email, password}: SignInCredentials) {

        try {
            const response = await api.post('sessions', {
                email, password
            })

            const {token, refreshToken, permissions, roles} = response.data;

            // first parameter will always be undefined if the action is being taken on the browser.
            setCookie(undefined, 'nextAuthApp.token', token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/' // any path of my app has access to it - effectively a 'global' cookie.
            })
            setCookie(undefined, 'nextAuthApp.refreshToken', refreshToken, {
                maxAge: 60 * 60 * 24 * 30, 
                path: '/'
            })

            setUser({
                email, 
                permissions,
                roles
            })

            /* the default header gets assigned when the api is loaded for the first time.
             If it is done when the token is not present (login page for the first time) or with an expired,
             it will cause all the sequential requests to fail. When login is performed, it is necessary
             to update it */ 
            api.defaults.headers['Authorization'] = `Bearer ${token}`

            Router.push('/dashboard')
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <AuthContext.Provider value={{signIn: signIn, isAuthenticated, user}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuthContext = () => useContext(AuthContext);


export function signOut() {
    destroyCookie(undefined, 'nextAuthApp.token');
    destroyCookie(undefined, 'nextAuthApp.refreshToken');

    Router.push('/');
}
