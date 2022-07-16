import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';

let cookies = parseCookies();

export const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
        Authorization: `Bearer ${cookies['nextAuthApp.token']}`
    }
});


// the first parameter is the logic to be applied upon success
// the second parameter is the logic to be applied upon error 
api.interceptors.response.use(response => response, (error: AxiosError<any>) => {
    if (error.response.status === 401) {
        if (error.response.data?.code === 'token.expired') {

            // refresh the cookies to make sure the newest one is being used instead of the one that was loaded with the app
            cookies = parseCookies();
            
            const {'nextAuthApp.refreshToken': refreshToken} = cookies;

            api.post('/refresh', {
                refreshToken
            }).then(response => {
                const {token: newToken, refreshToken: newRefreshToken} = response.data;
                
                setCookie(undefined, 'nextAuthApp.token', newToken, {
                    maxAge: 60 * 60 * 24 * 30,
                    path: '/'
                })
                setCookie(undefined, 'nextAuthApp.refreshToken', newRefreshToken, {
                    maxAge: 60 * 60 * 24 * 30, 
                    path: '/'
                })

                // default headers need to be updated otherwise it would use the one loaded during initialization
                api.defaults.headers['Authorization'] = `Bearer ${newToken}`
            })
        } else {

        }
    }
})
