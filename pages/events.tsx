/* eslint-disable @next/next/no-img-element */
import { GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import { useEffect, useState } from "react"
import FormattedLink from "../components/FormattedLink"
import Main from "../components/Main"
import { getEvents } from "../utils/data-cache"
import { Event as GenshinEvent, EventType } from "../utils/types"
import { formatTime, getDate, timeLeft } from "../utils/utils"
import styles from "./style.module.css"


interface Props {
  events: GenshinEvent[]
}

type Server = "Asia" | "Europe" | "North America"

const timezones: Record<Server, string> = {
  "Asia": "+08:00",
  "Europe": "+01:00",
  "North America": "-05:00",
}

export default function Events(props: Props & { location: string }) {
  const [now, setNow] = useState(() => Date.now())

  const [server, setServer] = useState(undefined as Server|undefined)

  const [serverTimezone, setServerTimezone] = useState("+08:00")
  const [showPast, setShowPast] = useState(false)

  useEffect(() => {
    if (typeof window == "undefined") return undefined

    const server = localStorage.getItem("server")

    if (server && Object.keys(timezones).includes(server)) {
      setServer(server as Server)
      return
    }

    const clientOffset = -(new Date().getTimezoneOffset() / 60)

    if (clientOffset > 5)
      setServer("Asia")
    else if (clientOffset > -2 || clientOffset < -11)
      setServer("Europe")
    else
      setServer("North America")
  }, [])

  useEffect(() => {
    if (server) {
      setServerTimezone(timezones[server])
      localStorage.setItem("server", server)
    }
  }, [server])

  useEffect(() => {
    const timer = setTimeout(() => {
      setNow(Date.now())
    }, 1010 - (Date.now() % 1000))

    return () => clearTimeout(timer)
  }, [now])


  const ongoing = props.events
    .filter(e => {
      const start = getStartTime(e, serverTimezone)
      const end = getEndTime(e, serverTimezone)

      return start && start.getTime() <= now &&
        (
          (end && end.getTime() >= now) ||
          (!end && e.reminder == "daily")
        )
    }).sort((a, b) => {
      const endA = getEndTime(a, serverTimezone)
      const endB = getEndTime(b, serverTimezone)

      if (!endA) return 1
      if (!endB) return -1

      return endA.getTime() - endB.getTime()
    })

  const upcoming = props.events
    .filter(e => {
      const start = getStartTime(e, serverTimezone)
      return start == false || start.getTime() > now
    })
    .sort((a, b) => {
      const startA = getStartTime(a, serverTimezone)
      const startB = getStartTime(b, serverTimezone)

      if (!startA) return 1
      if (!startB) return -1

      return startA.getTime() - startB.getTime()
    })

  const past = props.events
    .filter(e => !ongoing.includes(e) && !upcoming.includes(e))
    .sort((a, b) => {
      const startA = getStartTime(a, serverTimezone)
      const startB = getStartTime(b, serverTimezone)

      if (!startA) return -1
      if (!startB) return 1

      return startB.getTime() - startA.getTime()
    })

  const desc = "View ongoing and future events of Genshin Impact."
  return (
    <Main>
      <Head>
        <title>Events | Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Events | Hu Tao" />
        <meta property="og:description" content={desc} />
        <meta property="description" content={desc} />
      </Head>

      <h1 className="text-5xl font-bold pb-2">
        Events
      </h1>
      <div>
        Select server:
        <div>
          {Object.keys(timezones).map((t) => <span
            key={t}
            className={`${server == t ? "bg-green-500" : "bg-blue-500"} text-slate-50 text-center rounded-lg mr-2 px-1 py-0.5 cursor-pointer`}
            onClick={() => setServer(t as Server)}
          >
            {t}
          </span>)}
        </div>
      </div>

      <h3 className="text-xl mt-3">Ongoing event{ongoing.length == 1 ? "" : "s"}</h3>
      <div className="flex flex-row flex-wrap pt-2 gap-2">
        {ongoing
          .map((event, i) => <EventCard key={i} e={event} now={now} serverTimezone={serverTimezone} hoverClass="hover:text-blue-800" className="dark:bg-green-500 bg-green-300 text-black" />)}
      </div>

      <h3 className="text-xl mt-3">Upcoming event{upcoming.length == 1 ? "" : "s"}</h3>
      <div className="flex flex-row flex-wrap pt-2 gap-2">
        {upcoming
          .map((event, i) => <EventCard key={i} e={event} now={now} serverTimezone={serverTimezone} className="dark:bg-slate-800 bg-slate-300" />)}
      </div>

      <h3 className="text-xl mt-3">Past event{past.length == 1 ? "" : "s"}</h3>
      {showPast ? <div className="flex flex-row flex-wrap pt-2 gap-2">
        {past
          .map((event, i) => <EventCard key={i} e={event} now={now} serverTimezone={serverTimezone} hoverClass="hover:text-blue-800" className="dark:bg-red-400 bg-red-300 text-black" />)}
      </div> : <span className="bg-blue-500 text-slate-50 text-center rounded-lg mr-2 mt-1 px-1 py-0.5 cursor-pointer" onClick={() => setShowPast(true)}>Show past events</span>}
    </Main>
  )
}

function EventCard({ e, className, now, serverTimezone, hoverClass = "" }: { e: GenshinEvent, className: string, hoverClass?: string, now: number, serverTimezone: string }) {
  const start = getStartTime(e, serverTimezone)
  const end = getEndTime(e, serverTimezone)
  const child = <div className={`text-center max-w-md w-full rounded-xl pb-1 ${className} ${e.link ? `${hoverClass} transition` : ""}`}>
    <div className={`${styles.mask} w-full`}>
      <img loading="lazy" className="rounded-t-xl" src={e.img ?? "/img/Event_No_Img.png"} width={448} alt={e.name} />
    </div>
    <div>
      <h3 className="font-semibold">{e.name}</h3>
      {start && <div className={e.prediction ? "opacity-60" : ""}>{e.prediction && <span className="font-bold cursor-help" title="Predicted based on past events like this">Predicted</span>} {e.type == EventType.Unlock ? "Unlock Time" : "Start Time"}: {formatTime(start)} ({timeLeft(start.getTime() - now)})</div>}
      {end && <div className={e.prediction ? "opacity-60" : ""}>{e.prediction && <span className="font-bold cursor-help" title="Predicted based on past events like this">Predicted</span>} End Time {formatTime(end)} ({timeLeft(end.getTime() - now)})</div>}

    </div>
  </div>
  return e.link ? <FormattedLink href={e.link} target={"htb-event"} className="font-normal">{child}</FormattedLink> : child
}

function getStartTime(event: GenshinEvent, serverTimezone: string) {
  const serverTimeStart = event.start_server ?? (event.type == EventType.Banner || event.type == EventType.InGame || event.type == EventType.Unlock)
  const startTime = event.start != undefined && getDate(event.start, event.timezone ?? serverTimeStart ? serverTimezone : undefined)

  return startTime
}

function getEndTime(event: GenshinEvent, serverTimezone: string) {
  const serverTimeEnd = event.end_server ?? (event.type == EventType.Banner || event.type == EventType.InGame || event.type == EventType.Web)
  const endTime = event.end != undefined && getDate(event.end, event.timezone ?? serverTimeEnd ? serverTimezone : undefined)

  return endTime
}


export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> {
  const events = await getEvents()

  if (!events) {
    return {
      notFound: true,
      revalidate: 15 * 60
    }
  }

  return {
    props: {
      events
    },
    revalidate: 60 * 60 * 4
  }
}
