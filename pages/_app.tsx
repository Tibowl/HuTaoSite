import type { AppProps } from "next/app"
import Head from "next/head"
import { useEffect } from "react"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "tailwindcss/tailwind.css"
import Footer from "../components/Footer"
import NavBar from "../components/NavBar"
import "../public/global.css"
import * as gtag from "../utils/gtag"

const contextClass = {
  success: "bg-green-600 dark:bg-green-900",
  error: "bg-red-600 dark:bg-red-900",
  info: "bg-gray-600 dark:bg-gray-900",
  warning: "bg-orange-400 dark:bg-orange-800",
  default: "bg-indigo-600 dark:bg-indigo-900",
  dark: "bg-white-600 dark:bg-white-900",
}

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
      <NavBar location={router.asPath} />
      <div className="p-4 flex flex-col w-full flex-1 px-1 lg:px-20 items-center justify-center">
        <Component {...pageProps} location={router.asPath} />
      </div>
      <ToastContainer
        toastClassName={({ type = "default" } = {}) => contextClass[type || "default"] +
          " relative flex p-1 min-h-10 rounded-md justify-between overflow-hidden cursor-pointer"
        }
        position="bottom-center"
        theme={"colored"}
      />
    </div>
    <Footer />
  </div>
}
