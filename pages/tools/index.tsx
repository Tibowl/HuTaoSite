import Head from "next/head"
import FormattedLink from "../../components/FormattedLink"
import Main from "../../components/Main"

export default function Tools({ location }: {location: string}) {
  return (
    <Main>
      <Head>
        <title>Guides | Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Guides | Hu Tao" />
        <meta property="og:description" content="View currently available guides and routes" />
      </Head>

      <h1 className="text-5xl font-bold pb-2">
        Guides
      </h1>

      <ul>
          <li>
            -{" "}
            <FormattedLink className="font-semibold text-xl" location={location} href="/tools/reminders" >
              Reminders
            </FormattedLink>
            <div className="ml-6">
              Reminders are send to your Discord DM&apos;s via the Discord bot. Please make sure you share at least one server with the Discord bot
              and have DM&apos;s enabled in that server. You can invite the bot to your own Discord server or join the support server via the links on
              the <FormattedLink location={location} href="/" >homepage</FormattedLink>.
            </div>
          </li>
      </ul>
    </Main>
  )
}
