import { serialize } from "cookie"
import { GetServerSideProps } from "next"
import Head from "next/head"
import { Component } from "react"
import Main from "../../components/Main"
import { config } from "../../utils/config"
import { parseUser } from "../../utils/parse-user"
import { DiscordUser, Reminder } from "../../utils/types"

interface Props {
  user: DiscordUser
  reminders: Reminder[]
}

export default class Reminders extends Component<Props, { reminders: Reminder[] }> {
  constructor(props: Props) {
    super(props)
    this.state = {
      reminders: this.props.reminders
    }
  }

  render() {
    const { user } = this.props
    const { reminders } = this.state

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
        <div className="text-base">Logged in as: <DiscordAvatar user={user} /> {user.username}<span className="text-xs">#{user.discriminator}</span></div>
        <div className="text-xl mt-3">{reminders.length} reminder{reminders.length == 1 ? "" : "s"}</div>
        {reminders.map(r => <ReminderCard r={r} key={r.id} onDelete={() => this.setState({
          reminders: reminders.filter(re => r.id != re.id)
        })} />)}
      </Main>
    )
  }
}

function ReminderCard({ r, onDelete }: { r: Reminder, onDelete: () => void }) {
  const deleteReminder = async () => {
    const res = await fetch("/api/reminders/delete", {
      body: JSON.stringify({ r }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    })

    if ((res.status >= 200 && res.status < 300) || res.status == 404)
      onDelete()
  }
  return <div key={r.id} className="border rounded-md p-2 mt-2 text-slate-700 dark:text-slate-300">
    <div className="text-xl text-slate-900 dark:text-slate-100">#{r.id}: <span>{r.subject}</span></div>
    Will trigger on <span className="text-slate-900 dark:text-slate-100">{new Date(r.timestamp).toLocaleString(undefined, { day: "numeric", year: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
    <div className="bg-red-500 text-slate-50 w-16 text-center rounded-lg mt-2 cursor-pointer" onClick={deleteReminder}>Delete</div>
  </div>
}

function DiscordAvatar({ user }: { user: DiscordUser }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img
    src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=16` : "https://discord.com/assets/1f0bfc0865d324c2587920a7d80c609b.png"}
    alt="Discord avatar"
    width={16}
    height={16}
    className="rounded-xl p-0 m-0 inline-block"
  />
}

export const getServerSideProps: GetServerSideProps<Props> = async function (ctx) {
  const user = parseUser(ctx.req.headers.cookie)

  if (!user) {
    ctx.res.setHeader(
      "Set-Cookie",
      serialize("oauth-redirect", ctx.resolvedUrl, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 3600,
        sameSite: "lax",
        path: "/",
      }))

    return {
      redirect: {
        destination: "/api/oauth",
        permanent: false,
      },
    }
  }

  const reminders: Reminder[] = await fetch(`${config.discordUri}/reminders/${user.id}/get`, {
    headers: { Authorization: `${config.discordSecret}` },
  }).then((res) => res.json())

  return { props: { user, reminders } }
}
