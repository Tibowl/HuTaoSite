import Head from "next/head"
import Main from "../components/Main"
import FormattedLink from "../components/FormattedLink"

export default function ToS({ location }: { location: string }) {
  const desc = "Hu Tao's Terms of Service."

  return (
    <Main>
      <Head>
        <title>Terms of Service | Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Terms of Service | Hu Tao" />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
      </Head>

      <h1 className="text-5xl font-bold pb-2">
        Terms of Service
      </h1>

      <p>
        Last Updated: May 26th, 2022
      </p>

      <h2 className="text-3xl font-bold pb-2">
        What you can expect from us
      </h2>

      <p>
        We provide a Website (such as <FormattedLink href="/" location={location}>this</FormattedLink> one) and a Discord bot (linked to on <FormattedLink href="/" location={location}>hutaobot.moe</FormattedLink>). These services work together, linking to each other for ease of use and better experience.
      </p>

      <p>
        We reserve the right to block, remove, and/or permanently delete your content, Discord user or server for any reason, including breach of these terms, or any applicable law or regulation.
      </p>

      <h2 className="text-3xl font-bold pb-2">
        What we expect from you
      </h2>

      <p>
        Don&apos;t abuse, harm, interfere with, or otherwise disrupt the services provided by us. This includes, but is not limited to, exploiting any vulnerabilities and/or bugs, spamming the Website or the Discord bot.
      </p>


    </Main>
  )
}
