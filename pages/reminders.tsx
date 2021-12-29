import { GetServerSideProps } from "next"
import { DiscordUser } from "../utils/types"
import { parseUser } from "../utils/parse-user"
import Main from "../components/Main"
import Head from "next/head"

interface Props {
  user: DiscordUser;
}

export default function Reminders(props: Props) {
  return (
    <Main>
      <Head>
        <title>Reminders | Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Reminders | Hu Tao" />
        <meta property="og:description" content="Change, add and remove your Discord reminders" />
      </Head>
      <h1 className="text-5xl font-bold">
        Reminders
      </h1>
      <div className="text-xs">ID: {props.user.id}</div>
      <div>Not yet implemented</div>
    </Main>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async function (ctx) {
    const user = parseUser(ctx)

    if (!user) {
      return {
        redirect: {
          destination: "/api/oauth",
          permanent: false,
        },
      }
    }
    console.log(user)

    return { props: { user } }
  }
