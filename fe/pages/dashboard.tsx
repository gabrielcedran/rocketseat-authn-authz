import { GetServerSideProps } from "next"
import { useEffect } from "react"
import { useAuthContext } from "../contexts/AuthContext"
import { setupAPIClient } from "../services/api"
import { api } from "../services/apiClient"
import { withSSRAuth } from "../utils/withSSRAuth"

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

export const getServerSideProps: GetServerSideProps = withSSRAuth(async (ctx) => {

    const {data} = await setupAPIClient(ctx).get('/me');
    console.log(data);
    
    return {
        props: {}
    }
})
