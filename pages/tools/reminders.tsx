import { serialize } from "cookie"
import { GetServerSideProps } from "next"
import Head from "next/head"
import { useRouter } from "next/router"
import { Component, useState } from "react"
import ReactModal from "react-modal"
import Main from "../../components/Main"
import { config } from "../../utils/config"
import { parseUser } from "../../utils/parse-user"
import { DiscordUser, Reminder } from "../../utils/types"
import { send } from "../../utils/utils"

interface Props {
  user: DiscordUser
  reminders: Reminder[]
}

const modalStyle: ReactModal.Styles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.66)"
  },
  content: {
    position: "absolute",
    top: "min(10%, 200px)",
    bottom: "auto",

    width: "min(42rem, calc(100% - 40px))",
    left: "max(calc(50% - (42rem/2)), 20px)",

    border: "1px solid rgb(64, 79, 100)",
    color: "white",
    background: "rgb(51 65 85)",
    borderRadius: "1rem"
  }
}
const erorrModalStyle: ReactModal.Styles = {
  overlay: {
    backgroundColor: "rgba(10, 0, 0, 0.66)"
  },
  content: {
    position: "absolute",
    top: "max(calc(50% - (10rem/2)), 20px)",
    maxHeight: "10rem",

    width: "min(20rem, calc(100% - 40px))",
    left: "max(calc(50% - (20rem/2)), 20px)",

    border: "1px solid rgb(156, 79, 100)",
    color: "white",
    background: "rgb(156 65 85)",
    borderRadius: "1rem"
  }
}

export default class Reminders extends Component<Props, { reminders: Reminder[], createReminderOpen: boolean }> {
  constructor(props: Props) {
    super(props)
    this.state = {
      reminders: this.props.reminders,
      createReminderOpen: false
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
        {reminders.map(r => <ReminderCard
          r={r}
          key={r.id}
          onDelete={() => this.setState({
            reminders: reminders.filter(re => r.id != re.id)
          })}
        />)}
        <div className="flex flex-wrap gap-2">
          <span className="bg-blue-600 text-slate-50 w-fit px-3 py-1 text-center rounded-lg mt-2 cursor-pointer" onClick={() => fetch("/api/sendmessage", {
            headers: { "Content-Type": "application/json" },
            method: "POST"
          })}>Send test message</span>
          <span className="bg-green-600 text-slate-50 w-fit px-3 py-1 text-center rounded-lg mt-2 cursor-pointer" onClick={() => this.setState({ createReminderOpen: true })}>Create reminder</span>
          <CreateReminder
            isOpen={this.state.createReminderOpen}
            requestClose={() => this.setState({ createReminderOpen: false })}
            addReminder={(r) => this.setState({ reminders: [...reminders, r] })}
          />
        </div>
      </Main>
    )
  }
}

function CreateReminder({ isOpen, requestClose, addReminder }: { isOpen: boolean, requestClose: () => void, addReminder: (r: Reminder) => void }) {
  const [name, setName] = useState("")
  const [duration, setDuration] = useState("")

  const [error, setError] = useState("")

  async function createReminder(name: string, duration: string) {
    if (name.length > 128) return setError("Name too long")
    if (name.length == 0) return setError("No name given")
    if (duration.length == 0) return setError("No duration given")

    const res = await send("/api/reminders/create", { name, duration })

    if ((res.status >= 200 && res.status < 300)) {
      requestClose()
      addReminder(await res.json())

      setName("")
      setDuration("")
    } else {
      return setError("An error occurred... Try again later")
    }
  }
  return <ReactModal style={modalStyle} isOpen={isOpen} onRequestClose={requestClose} ariaHideApp={false}>
    <ReactModal style={erorrModalStyle} isOpen={error.length > 0} onRequestClose={() => setError("")} ariaHideApp={false}>
      <div className="flex flex-1 justify-center items-center h-full" onKeyDown={() => setError("")}>
        <div className="font-semibold text-xl">
          {error}
        </div>
      </div>
    </ReactModal>

    <h4 className="text-lg font-semibold">Create a reminder</h4>
    <div className="flex flex-col">
      <form onSubmit={(e) => {
        e.preventDefault()
        createReminder(name, duration)
      }}>
        <TextInput value={name} set={setName} placeholder="Enter a name" maxLength={128} label="Name:" />
        <TextInput value={duration} set={setDuration} placeholder="Enter a duration (ex. 10 hours 2 resin 5s)" maxLength={128} label="Duration:" />
        <button className="bg-green-600 text-slate-50 w-fit px-3 py-1 text-center rounded-lg mt-2 cursor-pointer" formAction="submit">Create reminder</button>
      </form>
    </div>
    <br />

    <h4 className="text-lg font-semibold">Presets</h4>
    <div className="flex flex-wrap gap-2">
      <span className="bg-green-600 text-slate-50 w-fit px-3 py-1 text-center rounded-lg mt-2 cursor-pointer" onClick={() => createReminder("Parametric", "6d22h")}>Parametric (6d22h)</span>
      <span className="bg-green-600 text-slate-50 w-fit px-3 py-1 text-center rounded-lg mt-2 cursor-pointer" onClick={() => createReminder("Ores", "72h")}>Ores (72h)</span>
    </div>
  </ReactModal>
}

function TextInput({ value, set, maxLength, placeholder, label }: { value: string, set: (newValue: string) => unknown, maxLength?: number, placeholder: string, label: string }) {
  return <div><label>
    {label}
    <input
      className="bg-slate-800 rounded-lg px-2 ml-2 mt-1"
      value={value}
      onChange={(e) => set(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
    />
  </label></div>
}

function ReminderCard({ r, onDelete }: { r: Reminder, onDelete: () => void }) {
  const deleteReminder = async () => {
    const res = await send("/api/reminders/delete", { r })

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
      })
    )

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
