import { GetServerSideProps } from "next"
import { useEffect } from "react"
import { Can } from "../components/Can"
import { useAuthContext } from "../contexts/AuthContext"
import { useCan } from "../hooks/useCan"
import { setupAPIClient } from "../services/api"
import { api } from "../services/apiClient"
import { withSSRAuth } from "../utils/withSSRAuth"

export default function Dashboard() {

    const { user, signOut } = useAuthContext()

    const userCanSeeMetrics = useCan({
        permissions: ['metrics.list'],
        roles: ['administrator']
    })

    useEffect(() => {
        api('/me')
        .then(response => {
            console.log(response);
        })
        .catch((error) => console.log(error));
    },
    [])

    return (
        <>
            <h1>Dashboard {user?.email}</h1>
            <button onClick={() => signOut(true)}>Sign out</button>
            {userCanSeeMetrics && <div>Metrics</div>}
            <Can permissions={['metrics.list']} roles={['administrator', 'editor']}>
                <div>Metrics 2</div>
            </Can>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = withSSRAuth(async (ctx) => {

    const apiClient = setupAPIClient(ctx);

    const {data} = await apiClient.get('/me');
    console.log(data);
    
    
    return {
        props: {}
    }
})
