/* eslint-disable @next/next/no-img-element */
import { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import Image from "next/image"
import { useState } from "react"
import FormattedLink from "../../components/FormattedLink"
import Main from "../../components/Main"
import YouTube from "../../components/YouTube"
import { CharacterCurves, CostTemplates, getCharacterCurves, getCharacters, getCostTemplates, urlify } from "../../utils/data-cache"
import { elements, ElementType, getCharStatsAt, getCostsFromTemplate, image, isFullCharacter, stat, weapons } from "../../utils/utils"
import { Character, CharacterFull, CostTemplate, CurveEnum, Meta, Skills } from "../../utils/types"
import styles from "../style.module.css"

interface Props {
  char: Character,
  characterCurves: CharacterCurves | null
  costTemplates: CostTemplates | null
}

export default function CharacterWebpage({ char, location, characterCurves, costTemplates }: Props & { location: string }) {
  const charElems = char.skills?.map(skill => skill.ult?.type).filter(x => x) as ElementType[] ?? [char.meta.element]
  return (
    <Main>
      <Head>
        <title>{char.name} | Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content={`${char.name} | Hu Tao`} />
        <meta property="og:description" content={`View ${char.name} information`} />
      </Head>
      <h2 className="font-semibold">
        <FormattedLink href="/characters/" location={location} font="semibold" size="lg">
          Characters
        </FormattedLink>
      </h2>

      <h1 className="text-4xl font-bold pb-2">
        {char.name}
      </h1>

      <div className="float-right border-2 border-slate-500 dark:bg-slate-600 bg-slate-200 m-2 px-2">
        Table of Contents
        {isFullCharacter(char) && characterCurves && <TOC href="#stats" title="Stats / Ascensions" />}
        {char.meta && <TOC href="#meta" title="Meta" />}
        {char.media.videos && <TOC href="#videos" title={Object.keys(char.media.videos).length > 1 ? "Videos" : "Video"} />}
      </div>

      <div id="description">
        <blockquote className="pl-5 mb-2 border-l-2">
          {char.desc}
        </blockquote>

        {charElems.map(e => <div key={e} className="w-5 inline-block pr-1">
          <Image src={elements[e]} alt={`${e} Element`} />
        </div>)}

        {char.star && <div className="inline-block pr-2">
          {char.star}★
        </div>}

        {char.weaponType ? <div className="inline-block">
          <div className="w-5 inline-block pr-1">
            <Image src={weapons[char.weaponType]} alt={`${char.weaponType} Element`} />
          </div>

          {char.weaponType} user
        </div> : <div className="inline-block">Character (unreleased)</div>}

        {char.ascensionCosts && <AscensionCosts costs={char.ascensionCosts} />}
        {char.skills && <TalentCosts skills={char.skills} />}
        {isFullCharacter(char) && characterCurves && <Stats char={char} curves={characterCurves} />}
        {char.ascensionCosts && costTemplates && <FullAscensionCosts template={char.ascensionCosts} costTemplates={costTemplates} />}
        {char.meta && <Meta meta={char.meta} />}
        {char.media.videos && <Videos videos={char.media.videos} />}
      </div>
    </Main>
  )
}

function TOC({ href, title }: { href: string, title: string }) {
  return <div>
    <FormattedLink href={href} size="base">{title}</FormattedLink>
  </div>
}

function AscensionCosts({ costs }: { costs: CostTemplate }) {
  const ascensionCosts = [
    costs.mapping.Gem4,
    costs.mapping.BossMat,
    costs.mapping.Specialty,
    costs.mapping.EnemyDropTier3,
  ].filter(x => x)
  return <div className="flex flex-row items-center">
    <div className="text-base font-semibold pt-1 inline-block pr-1 h-9">Ascension materials:</div>
    {ascensionCosts.map(e => <div className="inline-block pr-1 w-6 h-6 md:h-8 md:w-8" key={e}>
      <img src={image("material", e)} alt={e} width={256} height={256} />
    </div>)}
  </div>
}

function FullAscensionCosts({ template, costTemplates }: { template: CostTemplate, costTemplates: CostTemplates }) {
  const costs = getCostsFromTemplate(template, costTemplates)

  return <>
    <table className={`table-auto w-full ${styles.table} mb-2`}>
      <thead className="font-semibold divide-x divide-gray-200 dark:divide-gray-500">
        <td>Asc.</td>
        <td>Mora</td>
        <td>Items</td>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-500">
        {costs.slice(1).map(({ mora, items }, ind) => {
          let newItems = items
        if (ind == 0 && template.mapping.BossMat)
          newItems = [items[0], { name: "", count: 0 }, ...items.slice(1)]
        return <tr className="pr-1 divide-x divide-gray-200 dark:divide-gray-500" key={ind}>
          <td>A{ind + 1}</td>
          <td className="text-right">{mora}</td>
          {newItems.map(({ count, name }) => <td key={name}>
            {count > 0 &&
            <div className="flex flex-row align-middle items-center">
            <div>{count}&times;</div>
            <div className="pr-1 w-6 h-6 md:h-8 md:w-8">
              <img src={image("material", name)} alt={name} width={256} height={256} />
            </div>
            <div>{name}</div></div>}
          </td>)}
        </tr>})}
      </tbody>
    </table>
  </>
}

function TalentCosts({ skills }: { skills: Skills[] }) {
  const talents = skills
    .flatMap(s => [...(s.talents ?? []), s.ult])
    .filter(x => x)

  const books = talents
    .flatMap(s => [
      s?.costs?.mapping?.Book,
      s?.costs?.mapping?.Book1,
      s?.costs?.mapping?.Book2,
      s?.costs?.mapping?.Book3,
    ])
    .filter((x, i, a) => x && a.indexOf(x) == i)
    .map(x => `Guide to ${x}`)

  const mats = talents
    .map(s => s?.costs?.mapping?.BossMat)
    .filter((x, i, a) => x && a.indexOf(x) == i)

  const drops = talents
    .map(s => s?.costs?.mapping?.EnemyDropTier3)
    .filter((x, i, a) => x && a.indexOf(x) == i)

  const all = [...books, ...mats, ...drops] as string[]
  return <div className="flex flex-row items-center">
    <div className="text-base font-semibold pt-1 inline-block pr-1 h-9">Talent materials:</div>
    {all.map(e => <div className="inline-block pr-1 w-6 h-6 md:h-8 md:w-8" key={e}>
      <img src={image("material", e)} alt={e} width={256} height={256} />
    </div>)}
  </div>
}

function Stats({ char, curves }: { char: CharacterFull, curves: Record<CurveEnum, number[]> }) {
  const maxAscension = char.ascensions[char.ascensions.length - 1]

  const levels: { a: number, lv: number }[] = []

  let prev = 1
  for (const asc of char.ascensions) {
    levels.push({ a: asc.level, lv: prev })
    levels.push({ a: asc.level, lv: asc.maxLevel })
    prev = asc.maxLevel
  }
  const max = getCharStatsAt(char, maxAscension.maxLevel, maxAscension.level, curves)

  return <>
    <h3 className="text-lg font-bold pt-1" id="stats">Stats / Ascensions:</h3>
    <table className={`table-auto w-full ${styles.table}  ${styles.stattable} mb-2`}>
      <thead className="font-semibold divide-x divide-gray-200 dark:divide-gray-500">
        <td>Asc.</td>
        <td>Lv.</td>
        {Object.keys(max).map((name) => <td key={name}>{name}</td>)}
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-500">
        {levels.map(({ a, lv }) => <tr className="pr-1 divide-x divide-gray-200 dark:divide-gray-500" key={a + "," + lv}>
          <td>A{a}</td>
          <td>{lv}</td>
          {Object.entries(getCharStatsAt(char, lv, a, curves)).map(([name, value]) => <td key={name}>{stat(name, value)}</td>)}
        </tr>)}
      </tbody>
    </table>
  </>
}

function Meta({ meta }: { meta: Meta }) {
  return <>
    <h3 className="text-lg font-bold pt-1" id="meta">Meta:</h3>
    <table className={`table-auto ${styles.table} mb-2`}>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-500">
        {meta.title && <tr><td>Title</td><td>{meta.title}</td></tr>}
        {meta.birthDay && meta.birthMonth && <tr><td>Title</td><td>{
          new Date(Date.UTC(2020, meta.birthMonth - 1, meta.birthDay))
            .toLocaleString("en-UK", {
              timeZone: "UTC",
              month: "long",
              day: "numeric",
            })}</td></tr>}
        {meta.association && <tr><td>Association</td><td>{meta.association}</td></tr>}
        {meta.affiliation && <tr><td>Affiliation</td><td>{meta.affiliation}</td></tr>}
        {meta.constellation && <tr><td>Constellation</td><td>{meta.constellation}</td></tr>}
        {meta.element && <tr><td>Element</td><td>{Object.keys(elements).includes(meta.element) ? <>
          <div className="w-5 inline-block pr-1">
            <Image src={elements[meta.element as ElementType]} alt={`${meta.element} Element`} />
          </div>
          {meta.element}</> : meta.element}</td></tr>}
        {meta.cvChinese && <tr><td>Chinese voice actor</td><td>{meta.cvChinese}</td></tr>}
        {meta.cvJapanese && <tr><td>Japanese voice actor</td><td>{meta.cvJapanese}</td></tr>}
        {meta.cvEnglish && <tr><td>English voice actor</td><td>{meta.cvEnglish}</td></tr>}
        {meta.cvKorean && <tr><td>Korean voice actor</td><td>{meta.cvKorean}</td></tr>}
      </tbody>
    </table>
  </>
}

function Videos({ videos }: { videos: Record<string, string> }) {
  const multiple = Object.keys(videos).length > 1

  return <>
    <h3 className="text-lg font-bold pt-1" id="videos">{multiple ? "Videos" : "Video"}:</h3>
    {Object.entries(videos).map(([name, link]) => <Video key={name} name={name} link={link} />)}
  </>
}

function Video({ name, link }: { name: string, link: string }) {
  const [expanded, setExpanded] = useState(false)

  return <div className={`${expanded ? "text-blue-600 dark:text-blue-400 hover:text-blue-400 dark:hover:text-blue-500" : "text-blue-700 dark:text-blue-300 hover:text-blue-400 dark:hover:text-blue-400"} cursor-pointer`} onClick={() => setExpanded(!expanded)}>
    {name}
    {expanded && <YouTube vidID={link.replace("https://youtu.be/", "")} autoplay />}
  </div>
}

export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> {
  const charName = context.params?.name
  const data = await getCharacters()

  const char = Object.values(data ?? {}).find(g => urlify(g.name, false) == charName)
  if (!data || !char) {
    return {
      notFound: true,
      revalidate: 5 * 60
    }
  }

  let characterCurves = null
  if (isFullCharacter(char)) {
    const curves = await getCharacterCurves()
    if (curves)
      characterCurves = Object.fromEntries(char.curves.map(c => c.curve).filter((v, i, arr) => arr.indexOf(v) == i).map(c => [c, curves[c]])) as CharacterCurves
  }

  let costTemplates = null
  if (char.ascensionCosts) {
    const templates = await getCostTemplates()
    if (templates)
      costTemplates = Object.fromEntries([char.ascensionCosts.template].filter((v, i, arr) => arr.indexOf(v) == i).map(c => [c, templates[c]])) as CostTemplates

  }

  return {
    props: {
      char,
      characterCurves,
      costTemplates
    },
    revalidate: 60 * 60
  }
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const data = await getCharacters()
  return {
    paths: Object.values(data ?? {}).map(g => ({
      params: { name: urlify(g.name, false) }
    })) ?? [],
    fallback: "blocking"
  }
}
