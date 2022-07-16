import { useAuthContext } from "../contexts/AuthContext"

type UseCanParams = {
    permissions?: string[],
    roles?: string[]

}

export function useCan({permissions, roles}: UseCanParams) {
    const {user, isAuthenticated} = useAuthContext()

    if (!isAuthenticated) {
        return false;
    }

    if (permissions?.length > 0) {
        const hasAllPermissions = permissions.every(permission => {
            return user.permissions.includes(permission);
        })

        if (!hasAllPermissions) {
            return false;
        }
    }

    if (roles?.length > 0) {
        const hasRole = roles.some(role => {
            return user.roles.includes(role);
        })

        if (!hasRole) {
            return false;
        }
    }

    return true;
}