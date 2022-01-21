import Head from "next/head"
import FormattedLink from "../../components/FormattedLink"
import Main from "../../components/Main"

export default function Tools({ location }: { location: string }) {
  const desc = "Some tools for Genshin Impact."
  return (
    <Main>
      <Head>
        <title>Tools | Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Tools | Hu Tao" />
        <meta property="og:description" content={desc} />
        <meta property="description" content={desc} />
      </Head>

      <h1 className="text-5xl font-bold pb-2">
        Tools
      </h1>

      <ul>
        <li className="pb-3">
          <FormattedLink className="font-semibold text-2xl" location={location} href="/tools/reminders" >
            Reminders
          </FormattedLink>
          <div className="ml-6">
            Reminders are send to your Discord DM&apos;s via the Discord bot. Please make sure you share at least one server with the Discord bot
            and have DM&apos;s enabled in that server. You can invite the bot to your own Discord server or join the support server via the links on
            the <FormattedLink location={location} href="/" >homepage</FormattedLink>.
          </div>
        </li>
        <li className="pb-3">
          <FormattedLink className="font-semibold text-2xl" location={location} href="/tools/gachacalc" >
            Gacha Rate Calculator
          </FormattedLink>
          <div className="ml-6">
            Calculate odds of getting a certain constellation/refinement within a certain amount of pulls.
          </div>
        </li>
      </ul>
    </Main>
  )
}
