import Head from "next/head"
import Main from "../components/Main"
import FormattedLink from "../components/FormattedLink"

export default function Privacy({ location }: { location: string }) {
  const desc = "Hu Tao's Privacy Policy."

  return (
    <Main>
      <Head>
        <title>Privacy Policy | Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Privacy Policy | Hu Tao" />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
      </Head>

      <h1 className="text-5xl font-bold pb-2">
        Privacy Policy
      </h1>

      <h2 className="text-3xl font-bold pb-2">
        Common
      </h2>

      <p>
        We store required information to provide certain services; we might store your Discord name/tag/ID and timestamp, as well as explicitly provided text to provide certain functionality.
      </p>
      <p>
        For example: for reminders we store your Discord ID, provided duration and name for said reminder. This data will be deleted once the timer expires or gets manually removed by the user.
      </p>

      <h2 className="text-3xl font-bold pb-2">
        Website
      </h2>

      <p>
        Outside of the data provided in the Common section above, <FormattedLink href="/" location={location}>hutaobot.moe</FormattedLink> itself does not collect any personal data, except IP addresses in webserver logs.
      </p>
      <p>
        We use Google Analytics to analyse the use of our website. Google Analytics gathers information about website use by means of cookies. The information gathered relating to our website is used to create reports about the use of our website. Google’s privacy policy is available <FormattedLink href="https://www.google.com/policies/privacy/" location="/privacy-policy">here</FormattedLink>.
      </p>

      <h2 className="text-3xl font-bold pb-2">
        Discord Bot
      </h2>

      <p>
        Outside of the data provided in the Common section above, we might temporarily store Discord channel/guild/user names/IDs in our logs when a command gets executed or during certain auto-completions for debugging, tracking performance and aggregated usage statistics.
      </p>

    </Main>
  )
}
