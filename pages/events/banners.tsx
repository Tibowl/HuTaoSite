/* eslint-disable @next/next/no-img-element */
import { GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import { useState } from "react"
import { ExclusiveButton } from "../../components/Filters"
import FormattedLink from "../../components/FormattedLink"
import { SmallIcon } from "../../components/Icon"
import Main from "../../components/Main"
import { config } from "../../utils/config"
import { getCharacters, getWeapons } from "../../utils/data-cache"
import { SmallChar, SmallWeapon, Wish } from "../../utils/types"
import { createSmallChar, createSmallWeapon } from "../../utils/utils"
import styles from "../style.module.css"


interface Props {
  banners: (Wish & {index: number})[]
  weapons: SmallWeapon[]
  chars: SmallChar[]
}

export default function Banners(props: Props & { location: string }) {
  const desc = "An automatically updating list of past, current and announced Event Wishes of Genshin Impact."
  const [filter, setFilter] = useState(false)

  const [bannerType, setBannerType] = useState("both" as "both" | "char" | "weapons")


  return (
    <Main>
      <Head>
        <title>Banners | Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Banners | Hu Tao" />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
      </Head>

      <h2 className="font-semibold">
        <FormattedLink href={"/events"} location={props.location} className="font-semibold text-lg">
          All Events
        </FormattedLink>
      </h2>
      <h1 className="text-5xl font-bold pb-2">
        Banners
      </h1>

      {filter ? <div className="bg-slate-100 dark:bg-slate-600 flex flex-col p-2 rounded-2xl font-semibold gap-2">
        <div className="pb-2">
          <div className="flex flex-row font-semibold float-right">
            <ExclusiveButton type={filter} value={false} setter={setFilter}>
              Hide filters
            </ExclusiveButton>
          </div>
          <div>
            Banner type filter
          </div>
          <div className="flex flex-row flex-wrap gap-2 pt-2">
            <ExclusiveButton type={bannerType} value={"both"} setter={setBannerType}>
              All banners
            </ExclusiveButton>
            <ExclusiveButton type={bannerType} value={"char"} setter={setBannerType}>
              Character banners only
            </ExclusiveButton>
            <ExclusiveButton type={bannerType} value={"weapons"} setter={setBannerType}>
              Weapon banners only
            </ExclusiveButton>
          </div>
        </div>
      </div> : <div className="flex flex-row font-semibold justify-end">
        <ExclusiveButton type={filter} value={true} setter={setFilter}>
          Show filters
        </ExclusiveButton>
      </div>
      }

      <table className={`table-auto w-full ${styles.table} my-2 sm:text-sm md:text-base text-xs`}>
        <thead>
          <tr className="divide-x divide-gray-200 dark:divide-gray-500">
            <th>Title</th>
            <th>Main</th>
            <th>Other</th>
            <th>Start</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-500">
          {props.banners
            .filter(w => bannerType == "both" || (bannerType == "weapons" && w.title.includes("Epitome Invocation")) || (bannerType == "char" && !w.title.includes("Epitome Invocation")))
            .map((event, i) => <WishLine key={"ongoing"+i} w={event} chars={props.chars} weapons={props.weapons} location={props.location} />)}
          </tbody>
      </table>
    </Main>
  )
}

function WishLine({ w, chars, weapons, location }: { w: Wish, chars: SmallChar[], weapons: SmallWeapon[], location: string }) {
  const durations = w.duration.match(/(.*?)(–|—| - )(.*)/)
  const duration = durations ? [durations[1], durations[3]] : [w.duration]

  const img = w.img ?? "img/Event_No_Img.png"

  return <tr className="pr-1 divide-x divide-gray-200 dark:divide-gray-500">
    <td className={"w-56 text-center pb-2"}>
      <span className="font-semibold">{w.title.match(/".*?"/)?.[0]?.replace(/"/g, "") ?? w.title}</span>
      <img loading="lazy" className="rounded-lg" src={img.startsWith("img/") ? `/${img}` : img} width={1080} height={533} alt={w.title} />
    </td>
    <td>
      {w.main.map(o => <Link key={o} target={o} chars={chars} weapons={weapons} location={location}/>)}
    </td>
    <td>
      {w.other.map(o => <Link key={o} target={o} chars={chars} weapons={weapons} location={location}/>)}
    </td>
    <td>{duration.map(o => <div key={o}>{o}</div>)}</td>
  </tr>
}

function Link({ target, chars, weapons, location }: { target: string, chars: SmallChar[], weapons: SmallWeapon[], location: string }) {
  const char = chars.find(x => x.name == target)
  if (char)
    return <div className="flex flex-wrap justify-start text-center items-center gap-1">
      <SmallIcon sizeSet="s" thing={char} location={location}>{target}</SmallIcon>
    </div>
  const weapon = weapons.find(x => x.name == target)
  if (weapon)
    return <div className="flex flex-wrap justify-start text-center items-center gap-1">
      <SmallIcon sizeSet="s" thing={weapon} location={location}>{target}</SmallIcon>
    </div>

  return <div>{target}</div>
}

export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> {
  const banners: Wish[] = await fetch(`${config.discordUri}/banners`, {
    headers: { Authorization: `${config.discordSecret}` },
  }).then((res) => res.json())

  const weapons = await getWeapons()
  const chars = await getCharacters()


  if (!banners || !weapons || !chars) {
    return {
      notFound: true,
      revalidate: 15 * 60
    }
  }

  return {
    props: {
      banners: banners
        .map((e, i) => Object.assign({ index: i }, e))
        .sort((a, b) => {
          if (Math.abs(a.roughDate - b.roughDate) < 3600) {
            if (a.duration == b.duration)
              return a.title.includes("Epitome") ? 1 : b.title.includes("Epitome") ? -1 : 0

            return b.duration.localeCompare(a.duration)
          } else
            return b.roughDate - a.roughDate
        }),
      weapons: Object.values(weapons).map(x => createSmallWeapon(x)),
      chars: Object.values(chars).map(x => createSmallChar(x)),
    },
    revalidate: 60 * 30
  }
}
