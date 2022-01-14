import Head from "next/head"
import FormattedLink from "../components/FormattedLink"
import Main from "../components/Main"

export default function Custom500() {
    return <Main>
        <Head>
            <title>A Server Error occurred | Hu Tao</title>
        </Head>
        <h1 className="text-6xl">500 - A Server Error occurred</h1>
        <FormattedLink href="/" location="/500">Home</FormattedLink>
    </Main>
}
