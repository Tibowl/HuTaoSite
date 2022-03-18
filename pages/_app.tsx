import type { AppProps } from "next/app"
import Head from "next/head"
import { useEffect, useState } from "react"
import CookieConsent, { getCookieConsentValue } from "react-cookie-consent"
import "tailwindcss/tailwind.css"
import Footer from "../components/Footer"
import NavBar from "../components/NavBar"
import "../public/global.css"
import * as gtag from "../utils/gtag"

export default function MyApp({ Component, pageProps, router }: AppProps) {
  const [consented, setConsented] = useState(null as boolean | undefined | null)

  useEffect(() => {
    const value = getCookieConsentValue()
    if (value == "true")
      setConsented(true)
    else if (value == "true")
      setConsented(false)
    else
      setConsented(undefined)
  }, [])

  useEffect(() => {
    if (consented)
      gtag.allowCookies()
  }, [consented])

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
      <meta httpEquiv="content-language" content="en-us"></meta>
    </Head>

    <div className="w-full">
      <NavBar location={router.asPath} />
      <div className="p-4 flex flex-col w-full flex-1 px-1 lg:px-20 items-center justify-center">
        <Component {...pageProps} location={router.asPath} />
      </div>
    </div>

    <CookieConsent
      buttonText="Accept all cookies"
      declineButtonText="Refuse non-essential cookies"
      enableDeclineButton
      onAccept={() => {
        setConsented(true)
      }}
      onDecline={() => {
        setConsented(false)
      }}
    >
      This website uses cookies to enhance the user experience.
      <div style={{ fontSize: "12px" }}>Currently we only use these for analytic purposes, intended to figure out where to focus our efforts.</div>
    </CookieConsent>
    <Footer location={router.asPath} marginBottom={consented || consented === null ? 3 : 80} />
  </div>
}
