import type { AppProps } from "next/app"
import Head from "next/head"
import { Component, useEffect } from "react"
import "tailwindcss/tailwind.css"
import Footer from "../components/Footer"
import NavBar from "../components/NavBar"
import * as gtag from "../utils/gtag"

function MyApp({ Component, pageProps, router }: AppProps) {
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      gtag.pageview(url)
    }
    router.events.on("routeChangeComplete", handleRouteChange)
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange)
    }
  }, [router.events])
  return <Layout>
    <Head>
      <title>{router.pathname.substring(1).replace(/^\w/, w => w.toUpperCase())} | Hu Tao</title>
      <link rel="icon" href="/favicon.ico" />
      <meta name="twitter:card" content="summary" />
      <meta property="og:title" content="Hu Tao" />
      <meta property="og:description" content="Genshin Impact tools" />
    </Head>

    <div className="w-full">
      <NavBar location={router.pathname}/>
      <div className="p-4 flex flex-col w-full flex-1 px-1 md:px-20 items-center justify-center">
        <Component {...pageProps} location={router.pathname}/>
      </div>
    </div>
    <Footer />
  </Layout>
}

class Layout extends Component {
  componentDidMount () {
  }

  render () {
    return (
      <div className="dark:bg-slate-700 min-h-screen flex flex-col items-center justify-between text-slate-900 dark:text-slate-100">
        {this.props.children}
      </div>
    )
  }
}

export default MyApp
