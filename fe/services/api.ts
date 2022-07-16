import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';
import { signOut } from '../contexts/AuthContext';

// global variable to control the refresh mechanism
let isRefreshing = false;
// queue to control requests that execute in parallel (and failed) during refresh process
let failedRequests = [];

export function setupAPIClient(ctx = undefined) {

    let cookies = parseCookies(ctx);

    const api = axios.create({
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
                cookies = parseCookies(ctx);
                
                const {'nextAuthApp.refreshToken': refreshToken} = cookies;
    
                // (1) all (parallel) requests that fail due to expired token will try to refresh it and just one will succeed. The rest will fail.
                // the solution is to execute the refresh process only for one and force all the others to wait until a new token has been received. And then re-execute them
                if (!isRefreshing) {
                    isRefreshing = true;
    
                    api.post('/refresh', {
                        refreshToken
                    }).then(response => {
                        const {token: newToken, refreshToken: newRefreshToken} = response.data;
                        
                        setCookie(ctx, 'nextAuthApp.token', newToken, {
                            maxAge: 60 * 60 * 24 * 30,
                            path: '/'
                        })
                        setCookie(ctx, 'nextAuthApp.refreshToken', newRefreshToken, {
                            maxAge: 60 * 60 * 24 * 30, 
                            path: '/'
                        })
    
                        // default headers need to be updated otherwise it would use the one loaded during initialization
                        api.defaults.headers['Authorization'] = `Bearer ${newToken}`
    
                        // (4.1) if the refresh token process succeeded, execute the success function of all awaiting requests
                        failedRequests.forEach(awaitingRequest => {
                            awaitingRequest.onSuccess(newToken);
                        })
                    })
                    .catch((error) => {
                        // (4.2) if the refresh token process succeeded, execute the success function of all awaiting requests
                        failedRequests.forEach(awaitingRequest => {
                            awaitingRequest.onFailure(error);
                        })
    
                        if (process.browser) {
                            signOut()
                        }
                    })
                    .finally(() => {
                        // (5) return global variables to initial state
                        isRefreshing = false;
                        failedRequests = [];
                    })
                }
    
    
                // (2) store all the all necessary config to repeat the same request (path, url, query params, body, etc) once the refresh mechanism is completed
                const originalConfig = error.config;
                /* 
                    axios does not support async/await. According to the documentation, the way to make it wait for something is to 
                    return a promise and complete it with resolve or reject.
                */
                return new Promise((resolve, reject) => {
                    // (3) add the failed request to the queue of failed requests and provide functions to be executed upon the 2 possible outcomes
                    failedRequests.push({
                        // receives the new token as parameter to be able to use it
                        onSuccess: (token: string) => {
                            originalConfig.headers['Authorization'] = `Bearer ${token}`
                            
                            resolve(api(originalConfig))
                        },
                        onFailure: (error: AxiosError) => {
                            reject(error);
                        } 
                    })
                })
            } else {
               if (process.browser) {
                    signOut();
                }
            }
    
            return Promise.reject(error);
        }
    })
    
    return api;
}