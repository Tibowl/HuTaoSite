import { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import FormattedLink from "../../components/FormattedLink"
import Guides from "../../components/Guides"
import Icon from "../../components/Icon"
import Main from "../../components/Main"
import { MaterialImage } from "../../components/Material"
import { FullAscensionCosts } from "../../components/Tables"
import { CostTemplates, getCostTemplates, getWeaponCurves, getWeapons, WeaponCurves } from "../../utils/data-cache"
import { CostTemplate, PlaceHolderStats, Refinement, StatsName, Weapon, WeaponCurveName } from "../../utils/types"
import { clean, getGuidesFor, getIconPath, getLinkToGuide, getStarColor, getWeaponStatsAt, joinMulti, stat, urlify } from "../../utils/utils"
import styles from "../style.module.css"

interface Props {
  weapon: Weapon,
  weaponCurves: WeaponCurves | null
  costTemplates: CostTemplates | null
  guides?: string[][],
}


export default function WeaponWebpage({ weapon, weaponCurves, costTemplates, location, guides }: Props & { location: string }) {
  const color = getStarColor(weapon.stars ?? 1)


  const desc = getDescription(weapon, weaponCurves)
  return (
    <Main>
      <Head>
        <title>{weapon.name} | Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content={`${weapon.name} | Hu Tao`} />
        <meta property="og:description" content={desc} />
        <meta property="description" content={desc} />
        {weapon.icon && <meta property="og:image" content={getIconPath(weapon.icon)} />}
      </Head>
      <h2 className="font-semibold">
        <FormattedLink href="/weapons/" location={location} className="font-semibold text-lg">
          Weapons
        </FormattedLink>
      </h2>

      <h1 className="text-4xl font-bold pb-2 sm:sr-only not-sr-only">
        <Icon icon={weapon} className={`${color} rounded-xl sm:w-0 mr-2 w-12 inline-block`} />
        {weapon.name}
      </h1>

      <div className="grid grid-flow-col justify-start">
        <div className="sm:w-36 mr-2 w-0 ">
          <Icon icon={weapon} className={`${color} rounded-xl`} />
        </div>

        <div id="description" className="w-full">
          <h1 className="text-4xl font-bold pb-2 sm:not-sr-only sr-only">
            {weapon.name}
          </h1>

          {weapon.stars && <div className="inline-block pr-2">
            {weapon.stars}★
          </div>}

          {weapon.weaponType && <div className="inline-block pr-2">
            {weapon.weaponType}
          </div>}

          <blockquote className="pl-5 mt-3 mb-2 border-l-2">
            <ReactMarkdown>{(weapon.desc?.replace(/ ?\$\{.*?\}/g, "").replace(/\n/g, "\n\n") ?? "")}</ReactMarkdown>
          </blockquote>
        </div>
      </div>

      <div id="details">
        {weapon.ascensionCosts && <AscensionCosts costs={weapon.ascensionCosts} />}
        {guides && guides.length > 0 && <Guides guides={guides} />}
        <div className="clear-both" />
        {weapon.ascensions && weapon.weaponCurve && weaponCurves && <Stats weapon={weapon} curves={weaponCurves} />}
        {weapon.refinements && weapon.refinements.length > 0 && <Refinements refinements={weapon.refinements} />}
        {weapon.placeholderStats && <PlaceholderStats placeholderStats={weapon.placeholderStats} />}
        {weapon.ascensionCosts && costTemplates && <FullAscensionCosts template={weapon.ascensionCosts} costTemplates={costTemplates} />}

        {weapon.lore && <>
          <h3 className="text-lg font-bold pt-1" id="lore">Lore:</h3>
          <blockquote className="pl-5 mb-2 border-l-2">
            <ReactMarkdown>{(weapon.lore?.replace(/ ?\$\{.*?\}/g, "").replace(/\n/g, "\n\n") ?? "")}</ReactMarkdown>
          </blockquote>
        </>}
      </div>
    </Main>
  )
}

function getDescription(weapon: Weapon, weaponCurves: WeaponCurves | null): string | undefined {
  return `${weapon.name} is a ${weapon.stars ? `${weapon.stars} star ` : ""}${weapon.weaponType}. \n${getStatsLineFromAsc()}\n${getAscensionCostsLine()}${getRefinementLine()}`.trim()

  function getRefinementLine() {
    if (weapon.refinements && weapon.refinements.length > 0)
      return `Refinement ${weapon.refinements[0].name} Lv. 1: ${clean(weapon.refinements[0].desc)}\n`
  }
  function getStatsLineFromAsc() {
    if (weapon.ascensions && weapon.weaponCurve && weaponCurves)
      return getStatsLine(
        weapon.ascensions[weapon.ascensions.length - 1].maxLevel,
        getWeaponStatsAt(weapon, weapon.ascensions[weapon.ascensions.length - 1].maxLevel, weapon.ascensions.length - 1, weaponCurves)
      )
    if (weapon.placeholderStats)
      return getStatsLine(weapon.placeholderStats.level, weapon.placeholderStats.stats)
    return ""
  }

  function getAscensionCostsLine() {
    if (weapon.ascensionCosts)
      return `Uses ${joinMulti(getAscensionCosts(weapon.ascensionCosts))} for ascensions. \n`
    return ""
  }

  function getStatsLine(level: number, stats: Partial<Record<StatsName, number>>) {
    return `Stats at level ${level}: ${joinMulti(Object.entries(stats).map(([name, value]) => `${stat(name, value)} ${name}`))}. \n`
  }
}

function getAscensionCosts(costs: CostTemplate) {
  return [
    costs.mapping.WeaponAsc4 ?? costs.mapping.WeaponAsc3,
    costs.mapping.EnemyDropTierA3 ?? costs.mapping.EnemyDropTierA2,
    costs.mapping.EnemyDropTierB3 ?? costs.mapping.EnemyDropTierB2,
  ].filter(x => x)
}

function AscensionCosts({ costs }: { costs: CostTemplate }) {
  const ascensionCosts = getAscensionCosts(costs)
  return <div className="flex flex-wrap items-center">
    <div className="text-base font-semibold pt-1 inline-block pr-1 h-9">Ascension materials:</div>
    {ascensionCosts.map(e => <MaterialImage key={e} name={e} />)}
  </div>
}

function Stats({ weapon, curves }: { weapon: Weapon, curves: Record<WeaponCurveName, number[]> }) {
  const [expanded, setExpanded] = useState(false)

  if (!weapon.ascensions) return <>Error while rendering stats</>

  const maxAscension = weapon.ascensions[weapon.ascensions.length - 1]

  const levels: { a: number, lv: number }[] = []

  let prev = 1
  for (const asc of weapon.ascensions) {
    levels.push({ a: asc.level, lv: prev })
    levels.push({ a: asc.level, lv: asc.maxLevel })
    prev = asc.maxLevel
  }
  const max = getWeaponStatsAt(weapon, maxAscension.maxLevel, maxAscension.level, curves)

  return <>
    <h3 className="text-lg font-bold pt-1" id="stats">Stats:</h3>
    <table className={`table-auto w-full md:max-w-xl ${styles.table} ${styles.stattable} mb-2 ${expanded ? "" : "cursor-pointer"} sm:text-base text-sm`} onClick={() => setExpanded(true)}>
      <thead>
        <tr className="font-semibold divide-x divide-gray-200 dark:divide-gray-500">
          <th>Asc.</th>
          <th>Lv.</th>
          {Object.keys(max).map((name) => <th key={name}>{name}</th>)}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-500">
        {levels
          .filter((r) => expanded ? true : (r.a == 0 && r.lv == 1) || (r.a == maxAscension.level && r.lv == maxAscension.maxLevel))
          .map(({ a, lv }) => <tr className="pr-1 divide-x divide-gray-200 dark:divide-gray-500" key={a + "," + lv}>
            <td>A{a}</td>
            <td>{lv}</td>
            {Object.entries(getWeaponStatsAt(weapon, lv, a, curves)).map(([name, value]) => <td key={name}>{stat(name, value)}</td>)}
          </tr>)}
        {!expanded && <tr className="pr-1 cursor-pointer text-blue-700 dark:text-blue-300 hover:text-blue-400 dark:hover:text-blue-400 no-underline transition-all duration-200 font-semibold">
          <td colSpan={Object.keys(getWeaponStatsAt(weapon, 1, 1, curves)).length + 2} style={({ textAlign: "center" })}>Click to expand...</td>
        </tr>}
      </tbody>
    </table>
  </>
}

function PlaceholderStats({ placeholderStats }: { placeholderStats: PlaceHolderStats }) {
  const { stats, level } = placeholderStats

  return <>
    <h3 className="text-lg font-bold pt-1" id="stats">Placeholder stats:</h3>
    <table className={`table-auto w-full md:max-w-xl ${styles.table} ${styles.stattable} mb-2 sm:text-base text-sm`}>
      <thead>
        <tr className="font-semibold divide-x divide-gray-200 dark:divide-gray-500">
          <th>Lv.</th>
          {Object.keys(stats).map((name) => <th key={name}>{name}</th>)}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-500">
        <tr className="pr-1 divide-x divide-gray-200 dark:divide-gray-500">
          <td>{level}</td>
          {Object.entries(stats).map(([name, value]) => <td key={name}>{stat(name, value)}</td>)}
        </tr>
      </tbody>
    </table>
  </>
}


function Refinements({ refinements }: { refinements: Refinement[] }) {
  const [expanded, setExpanded] = useState(false)

  return <>
    <h3 className="text-lg font-bold pt-1" id="refinements">Refinements:</h3>
    <table className={`table-auto w-full ${styles.table} mb-2 ${expanded ? "" : "cursor-pointer"} sm:text-base text-sm`} onClick={() => setExpanded(true)}>
      <thead>
        <tr className="font-semibold divide-x divide-gray-200 dark:divide-gray-500">
          <th>Refinement</th>
          <th>Desc</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-500">
        {refinements
          .filter((r, i, arr) => expanded ? true : (i == 0 || i == arr.length - 1))
          .map(({ name, desc }, i) => <tr className="pr-1 divide-x divide-gray-200 dark:divide-gray-500" key={i}>
            <td>{name} <span className="font-semibold">R{i + 1}</span></td>
            <td><ReactMarkdown>{desc}</ReactMarkdown></td>
          </tr>)}
        {!expanded && <tr className="pr-1 cursor-pointer text-blue-700 dark:text-blue-300 hover:text-blue-400 dark:hover:text-blue-400 no-underline transition-all duration-200 font-semibold">
          <td colSpan={2} style={({ textAlign: "center" })}>Click to expand...</td>
        </tr>}
      </tbody>
    </table>
  </>
}


export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> {
  const weaponName = context.params?.weapon
  const data = await getWeapons()

  const weapon = Object.values(data ?? {}).find(g => urlify(g.name, false) == weaponName)
  if (!data || !weapon) {
    return {
      notFound: true,
      revalidate: 15 * 60
    }
  }

  const guides = (await getGuidesFor("weapon", weapon.name))?.map(({ guide, page }) => [page.name, getLinkToGuide(guide, page)])

  let weaponCurves = null
  if (weapon.weaponCurve) {
    const curves = await getWeaponCurves()

    if (curves)
      weaponCurves = Object.fromEntries(weapon.weaponCurve.map(c => c.curve).filter((v, i, arr) => arr.indexOf(v) == i).map(c => [c, curves[c]])) as WeaponCurves
  }

  const neededTemplates: string[] = []

  let costTemplates = null
  if (weapon.ascensionCosts) {
    neededTemplates.push(weapon.ascensionCosts.template)
  }

  if (neededTemplates.length > 0) {
    const templates = await getCostTemplates()
    if (templates)
      costTemplates = Object.fromEntries(neededTemplates.filter((v, i, arr) => arr.indexOf(v) == i).map(c => [c, templates[c]])) as CostTemplates
  }

  return {
    props: {
      weapon,
      guides,
      weaponCurves,
      costTemplates
    },
    revalidate: 60 * 60 * 4
  }
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const data = await getWeapons()
  return {
    paths: Object.values(data ?? {}).map(w => ({
      params: { weapon: urlify(w.name, false) }
    })) ?? [],
    fallback: "blocking"
  }
}
