import { GetServerSideProps } from 'next'
import { parseCookies } from 'nookies'
import { FormEvent, useState } from 'react'
import { useAuthContext } from '../contexts/AuthContext'
import styles from '../styles/Home.module.css'

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


export const getServerSideProps: GetServerSideProps = async (ctx) => {

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

  return {
    props: {}
  }
}
