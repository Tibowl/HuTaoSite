import type { AppProps } from "next/app"
import Head from "next/head"
import { useEffect } from "react"
import "tailwindcss/tailwind.css"
import Footer from "../components/Footer"
import NavBar from "../components/NavBar"
import * as gtag from "../utils/gtag"
import "../public/global.css"
import ReactModal from "react-modal"

export default function MyApp({ Component, pageProps, router }: AppProps) {
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      gtag.pageview(url)
    }
    router.events.on("routeChangeComplete", handleRouteChange)
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange)
    }
  }, [router.events])

  return <div className="bg-slate-50 dark:bg-slate-700 min-h-screen flex flex-col items-center justify-between text-slate-900 dark:text-slate-100">
    <Head>
      <title>{router.pathname.substring(1).replace(/^\w/, w => w.toUpperCase())} | Hu Tao</title>
      <link rel="icon" href="/favicon.ico" />
      <meta name="twitter:card" content="summary" />
    </Head>

    <div className="w-full">
      <NavBar location={router.asPath}/>
      <div className="p-4 flex flex-col w-full flex-1 px-1 lg:px-20 items-center justify-center">
        <Component {...pageProps} location={router.asPath}/>
      </div>
    </div>
    <Footer />
  </div>
}
