import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../errors/AuthTokenError";

export function withSSRAuth<P>(fn: GetServerSideProps<P>) {
    return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
        const cookies = parseCookies(ctx);

        if (!cookies['nextAuthApp.token']) {
            return {
                redirect: {
                    destination: '/',
                    permanent: false,
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