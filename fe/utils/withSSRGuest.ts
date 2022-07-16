import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies } from "nookies";

export function withSSRGuest<P>(fn: GetServerSideProps<P>) {

    return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {

        console.log(ctx.req.cookies);

        // when nookies is being used on the server side, it is necessary to provide the context
        const cookies = parseCookies(ctx);
      
        if (cookies['nextAuthApp.token']) {
          return {
            redirect: {
              destination: '/dashboard',
              permanent: false,
            }
          }
        }

        return await fn(ctx);
    }
}