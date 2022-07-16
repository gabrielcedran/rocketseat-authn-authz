import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../errors/AuthTokenError";
import decode from 'jwt-decode';
import { validateUserPermissions } from "./validateUserPermissions";

type WithSSRAuthOptions = {
    permissions?: string[],
    roles?: string[],
}

export function withSSRAuth<P>(fn: GetServerSideProps<P>, options?: WithSSRAuthOptions) {
    return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
        const cookies = parseCookies(ctx);
        const token = cookies['nextAuthApp.token']


        if (!token) {
            return {
                redirect: {
                    destination: '/',
                    permanent: false,
                } 
            }
        }

        if (options) {
            const {permissions, roles} = options
            const user = decode<{permissions: string[], roles: string[]}>(token);
            if (!validateUserPermissions({user, permissions, roles})) {
                return {
                    redirect: {
                        // notFound - if there is no other place to redirect user
                        destination: '/',
                        permanent: false
                    }
                }
            }
        }

        try {
            return await fn(ctx);
        } catch(error) {
            if (error instanceof AuthTokenError) {
                destroyCookie(ctx, 'nextAuthApp.token');
                destroyCookie(ctx, 'nextAuthApp.refreshToken');
                return {
                    redirect: {
                        destination: '/',
                        permanent: false
                    }
                }
            }
        }
    }
}