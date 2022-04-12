import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'


const Home = () => {
  return (
    <div className={styles.container}>
    <Head>
      <title>Battleship</title>
      <meta name="description" content="battleship game" />
      <link rel="icon" href="/battleship.png" />
    </Head>
    <main className={styles.main}>
      <h1>
      Welcome to Battleship!
      </h1>
      {<Link href="/game" passHref>
        <button variant="contained" color="secondary">Lets Start!</button>
      </Link>}
    </main>
  </div>
  )

}
export default Home;