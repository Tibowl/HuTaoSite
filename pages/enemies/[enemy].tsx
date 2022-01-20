import { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import Image from "next/image"
import ReactMarkdown from "react-markdown"
import FormattedLink from "../../components/FormattedLink"
import Guides from "../../components/Guides"
import Icon from "../../components/Icon"
import Main from "../../components/Main"
import { getEnemies } from "../../utils/data-cache"
import { Enemy } from "../../utils/types"
import { elements, getGuidesFor, getIconPath, getLinkToGuide, getStarColor, urlify } from "../../utils/utils"
import styles from "../style.module.css"

interface Props {
  enemy: Enemy,
  guides?: string[][],
}

export default function EnemyWebpage({ enemy, location, guides }: Props & { location: string }) {
  const color = getStarColor(1)

  return (
    <Main>
      <Head>
        <title>{enemy.name} | Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content={`${enemy.name} | Hu Tao`} />
        <meta property="og:description" content={`${enemy.name}${enemy.type ? ` (${enemy.type})` : ""}${enemy.kind ? ` is a ${enemy.kind}` : " is an enemy"} in Genshin Impact.${enemy.resistance ? " Click to find out their resistances!" : ""}`} />
        {enemy.icon && <meta property="og:image" content={getIconPath(enemy.icon)} />}
      </Head>
      <h2 className="font-semibold">
        <FormattedLink href="/enemies/" location={location} className="font-semibold text-lg">
          Enemies
        </FormattedLink>
      </h2>

      <h1 className="text-4xl font-bold pb-2 sm:sr-only not-sr-only">
        <Icon icon={enemy} className={`${color} rounded-xl sm:w-0 mr-2 w-12 inline-block`} />
        {enemy.name}
      </h1>

      <div className="grid grid-flow-col justify-start">
        <div className="sm:w-36 mr-2 w-0 ">
          <Icon icon={enemy} className={`${color} rounded-xl`} />
        </div>

        <div id="description" className="w-full">
          <h1 className="text-4xl font-bold pb-2 sm:not-sr-only sr-only">
            {enemy.name}
          </h1>

          {enemy.type && <div className="inline-block pr-2 font-semibold">
            {enemy.type}
          </div>}

          {enemy.kind && <div className="inline-block pr-2 ">
            {enemy.kind}
          </div>}

          <blockquote className="pl-5 mt-3 mb-2 border-l-2">
            <ReactMarkdown>{(enemy.desc?.replace(/ ?\$\{.*?\}/g, "").replace(/\n/g, "\n\n") ?? "")}</ReactMarkdown>
          </blockquote>
        </div>
      </div>

      <div id="details">
        {guides && guides.length > 0 && <Guides guides={guides} />}
        {enemy.notes && <ReactMarkdown>{(enemy.notes?.replace(/ ?\$\{.*?\}/g, "").replace(/\n/g, "\n\n") ?? "")}</ReactMarkdown>}
        {enemy.resistance && <Resistances resistance={enemy.resistance} />}
      </div>
    </Main>
  )
}

function Resistances({ resistance }: { resistance: string[][] }) {
  function getStyles(r: string) {

    if (r.match(/\d+%/)) {
      const amount = parseInt(r.replace("%", ""))
      if (amount == 10) return "opacity-60"
      else if (amount > 50) return "font-bold"
      else if (amount > 100) return "font-bold text-red-400"
      else if (amount < -50) return "font-semibold text-green-400"
      else if (amount < 0) return "text-green-400"
    }

    return ""
  }
  return <>
    <h3 className="text-lg font-bold pt-1" id="resistance">Resistances:</h3>
    <table className={`table-auto w-full ${styles.table} mb-2 sm:text-base text-sm`}>
      <thead className="font-semibold divide-x divide-gray-200 dark:divide-gray-500">
        <td>
          <div className="flex flex-row items-center content-center">
            <div className="absolute invisible inline-block w-5 h-5 sm:relative sm:pr-1 sm:visible"><Image src={elements.Pyro} alt={"Pyro Element"} /></div>
            <div>Pyro</div>
          </div>
        </td>
        <td>
          <div className="flex flex-row items-center content-center">
            <div className="absolute invisible inline-block w-5 h-5 sm:relative sm:pr-1 sm:visible"><Image src={elements.Electro} alt={"Electro Element"} /></div>
            <div>Electro</div>
          </div>
        </td>
        <td>
          <div className="flex flex-row items-center content-center">
            <div className="absolute invisible inline-block w-5 h-5 sm:relative sm:pr-1 sm:visible"><Image src={elements.Cryo} alt={"Cryo Element"} /></div>
            <div>Cryo</div>
          </div>
        </td>
        <td>
          <div className="flex flex-row items-center content-center">
            <div className="absolute invisible inline-block w-5 h-5 sm:relative sm:pr-1 sm:visible"><Image src={elements.Hydro} alt={"Hydro Element"} /></div>
            <div>Hydro</div>
          </div>
        </td>
        <td>
          <div className="flex flex-row items-center content-center">
            <div className="absolute invisible inline-block w-5 h-5 sm:relative sm:pr-1 sm:visible"><Image src={elements.Anemo} alt={"Anemo Element"} /></div>
            <div>Anemo</div>
          </div>
        </td>
        <td>
          <div className="flex flex-row items-center content-center">
            <div className="absolute invisible inline-block w-5 h-5 sm:relative sm:pr-1 sm:visible"><Image src={elements.Geo} alt={"Geo Element"} /></div>
            <div>Geo</div>
          </div>
        </td>
        <td>Physical</td>
        {resistance[0].length > 7 && <td>Note</td>}
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-500">
        {resistance
          .map((row, i) => <tr className="pr-1 divide-x divide-gray-200 dark:divide-gray-500" key={i}>
            {row.map((r, j) => <td key={i + "," + j} className={getStyles(r)}><ReactMarkdown>{r}</ReactMarkdown></td>)}
          </tr>)}
      </tbody>
    </table>
  </>
}

export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> {
  const enemyName = context.params?.enemy
  const data = await getEnemies()

  const enemy = Object.values(data ?? {}).find(e => urlify(e.name, false) == enemyName)
  if (!data || !enemy) {
    return {
      notFound: true,
      revalidate: 5 * 60
    }
  }

  const guides = (await getGuidesFor("enemy", enemy.name))?.map(({ guide, page }) => [page.name, getLinkToGuide(guide, page)])

  return {
    props: {
      enemy,
      guides,
    },
    revalidate: 60 * 60
  }
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const data = await getEnemies()
  return {
    paths: Object.values(data ?? {}).map(e => ({
      params: { enemy: urlify(e.name, false) }
    })) ?? [],
    fallback: "blocking"
  }
}
