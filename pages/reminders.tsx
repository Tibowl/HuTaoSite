import { GetServerSideProps } from "next"
import { DiscordUser } from "../utils/types"
import { parseUser } from "../utils/parse-user"
import Main from "../components/Main"

interface Props {
  user: DiscordUser;
}

export default function Reminders(props: Props) {
  return (
    <Main>
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
