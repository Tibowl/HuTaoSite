import Head from "next/head"
import FormattedLink from "../components/FormattedLink"
import Main from "../components/Main"

export default function Custom404() {
    return <Main>
        <Head>
            <title>Page Not Found | Hu Tao</title>
        </Head>
        <h1 className="text-6xl">404 - Page Not Found</h1>
        <FormattedLink href="/" location="/404">Home</FormattedLink>
    </Main>
}
