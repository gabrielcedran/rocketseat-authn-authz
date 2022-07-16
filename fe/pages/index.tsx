import { GetServerSideProps } from 'next'
import { parseCookies } from 'nookies'
import { FormEvent, useState } from 'react'
import { useAuthContext } from '../contexts/AuthContext'
import styles from '../styles/Home.module.css'
import { withSSRGuest } from '../utils/withSSRGuest'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const {signIn} = useAuthContext()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const data = {
      email,
      password
    }

    await signIn(data)
  }

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)}/>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)}/>
      <button type="submit">Login</button>
    </form>
  )
}


// withSSRGuest<{users?: string[]}>
export const getServerSideProps: GetServerSideProps = withSSRGuest(async (ctx) => {
  return {
    props: {
      
    }
  }
}
)