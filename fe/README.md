# Authn n Authz

NextJS offers some options when it comes to authentication and authorization.

*NextAuth*

Is a simple solution to add authn and authz however it is not easy to integrate with solutions that already have their own internal mechanism in place.

## Data storage

NextJS does not work (or does not work seamlessly) with sessionStorage and localStorage due to its server side rendering capabilities.

The best option to persistent store data is.... cookies :).

Suggested library: nookies ("N"ext c"OOKIES" :P). It provides good integration with NextJS.

