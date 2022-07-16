import { useAuthContext } from "../contexts/AuthContext"
import { validateUserPermissions } from "../utils/validateUserPermissions";

type UseCanParams = {
    permissions?: string[],
    roles?: string[]

}

export function useCan({permissions, roles}: UseCanParams) {
    const {user, isAuthenticated} = useAuthContext()

    if (!isAuthenticated) {
        return false;
    }

    return validateUserPermissions({user, permissions, roles});
}