import { useEffect } from "react"
import { useAuthContext } from "../contexts/AuthContext"
import { api } from "../services/api"

export default function Dashboard() {

    const { user } = useAuthContext()

    useEffect(() => {
        api('/me')
        .then(response => {
            console.log(response);
        })
        .catch((error) => console.log(error));
    },
    [])

    return (
        <h1>Dashboard {user?.email}</h1>
    )
}