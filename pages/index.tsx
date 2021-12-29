import Head from "next/head"
import FormattedLink from "../components/FormattedLink"
import Main from "../components/Main"

export default function Home({ location }: { location: string }) {
  return (
    <div>
      <Head>
        <title>Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Hu Tao" />
        <meta property="og:description" content="Genshin Impact tools" />
      </Head>

      <Main className="flex flex-col items-center justify-center w-full flex-1 text-center" homePage={true}>
        <h1 className="text-6xl font-bold">
          Welcome to Hu Tao
        </h1>

        <p className="mt-3 text-2xl">
          A Genshin Impact site
        </p>

        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
          <Card href="/guides" title="Guides" desc="View guides/routes" location={location} />
          <Card href="/reminders" title="Reminders" desc="Manage your Discord reminders" location={location} />
        </div>
      </Main>
    </div>
  )
}

function Card({ href, title, desc, location }: {href: string, title: string, desc: string, location: string}) {
  return <FormattedLink
    href={href}
    className="p-6 m-6 text-left border w-96 rounded-xl"
    location={location}
  >
    <h3 className="text-2xl font-bold">{title} &rarr;</h3>
    <p className="mt-4 text-xl">
      {desc}
    </p>
  </FormattedLink>
}
