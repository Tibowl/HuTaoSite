/* eslint-disable @next/next/no-img-element */
import { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import Image from "next/image"
import { ReactElement, useState } from "react"
import ReactMarkdown from "react-markdown"
import FormattedLink from "../../components/FormattedLink"
import Guides from "../../components/Guides"
import Icon from "../../components/Icon"
import Main from "../../components/Main"
import { MaterialCost, MaterialImage } from "../../components/Material"
import { Specialty, SpecialtyItem } from "../../components/Specialty"
import { FullAscensionCosts } from "../../components/Tables"
import YouTube from "../../components/YouTube"
import { CharacterCurves, CostTemplates, getCharacterCurves, getCharacters, getCostTemplates, getMaterials } from "../../utils/data-cache"
import { Character, CharacterFull, Constellation, CostTemplate, CurveEnum, Meta, Passive, Skill, Skills, TalentTable, TalentValue } from "../../utils/types"
import { createSmallChar, createSmallMaterial, elements, ElementType, getCharStatsAt, getCostsFromTemplate, getGuidesFor, getIconPath, getLinkToGuide, getStarColor, isFullCharacter, isValueTable, joinMulti, stat, urlify, weapons } from "../../utils/utils"
import styles from "../style.module.css"

interface Props {
  char: Character,
  characterCurves: CharacterCurves | null
  costTemplates: CostTemplates
  specialty: SpecialtyItem | null
  guides?: string[][]
}

export default function CharacterWebpage({ char, location, characterCurves, costTemplates, guides, specialty }: Props & { location: string }) {
  const charElems = char.skills?.map(skill => skill.ult?.type).filter(x => x) as ElementType[] ?? [char.meta.element]
  const multiskill = (char.skills?.length ?? 0) > 1
  const color = getStarColor(char.star ?? 0)

  return (
    <Main>
      <Head>
        <title>{char.name} | Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content={`${char.name} | Hu Tao`} />
        <meta property="og:description" content={getDescription(char, charElems, characterCurves)} />
        <meta name="description" content={getDescription(char, charElems, characterCurves)} />
        {char.icon && <meta property="og:image" content={getIconPath(char.icon)} />}
      </Head>
      <h2 className="font-semibold">
        <FormattedLink href="/characters/" location={location} className="font-semibold text-lg">
          Characters
        </FormattedLink>
      </h2>

      <h1 className="text-4xl font-bold pb-2 sm:sr-only not-sr-only">
        <Icon icon={char} className={`${color} rounded-xl sm:w-0 mr-2 w-12 inline-block`} />
        {char.name}
      </h1>

      <div className="sm:float-right border-2 border-slate-500 dark:bg-slate-600 bg-slate-200 m-2 px-2">
        Table of Contents
        {isFullCharacter(char) && characterCurves && <TOC href="#stats" title="Stats" />}
        {char.ascensionCosts && costTemplates && <TOC href="#ascensions" title="Ascensions" />}
        {char.meta && <TOC href="#meta" title="Meta" />}
        {char.media.videos && <TOC href="#videos" title={Object.keys(char.media.videos).length > 1 ? "Videos" : "Video"} />}
        {char.skills && char.skills.map((s, i) => (<span key={i}>
          {multiskill && <div>{s.ult?.type ?? `Skillset #${i}`}</div>}
          {s.talents && <TOC depth={multiskill ? 1 : 0} href={`#talents${i > 0 ? `-${i}` : ""}`} title="Talents" />}
          {s.passive && <TOC depth={multiskill ? 1 : 0} href={`#passive${i > 0 ? `-${i}` : ""}`} title="Passives" />}
          {s.constellations && <TOC depth={multiskill ? 1 : 0} href={`#const${i > 0 ? `-${i}` : ""}`} title="Constellations" />}
        </span>))}
      </div>

      <div className="grid grid-flow-col justify-start">
        <div className="sm:w-36 mr-2 w-0 ">
          <Icon icon={char} className={`${color} rounded-xl`} />
        </div>

        <div id="description" className="w-full">
          <h1 className="text-4xl font-bold pb-2 sm:not-sr-only sr-only">
            {char.name}
          </h1>

          <blockquote className="pl-5 mb-2 border-l-2">
            <ReactMarkdown>{(char.desc?.replace(/ ?\$\{.*?\}/g, "").replace(/\n/g, "\n\n") ?? "")}</ReactMarkdown>
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
        </div>
      </div>

      <div id="details">
        {char.ascensionCosts && <AscensionCosts costs={char.ascensionCosts} />}
        {char.skills && getTalentCosts(char.skills).length > 0 && <TalentCosts talentCosts={getTalentCosts(char.skills)} />}
        {guides && guides.length > 0 && <Guides guides={guides} />}
        <div className="clear-both" />
        {isFullCharacter(char) && characterCurves && <Stats char={char} curves={characterCurves} />}
        {char.ascensionCosts && costTemplates && <FullAscensionCosts template={char.ascensionCosts} costTemplates={costTemplates} />}
        {char.meta && <MetaSection meta={char.meta} />}
        {specialty && <>
          <h3 className="text-lg font-bold pt-1" id="specialty">Specialty:</h3>
          <Specialty specialty={specialty} location={location} />
        </>}
        {char.media.videos && <Videos videos={char.media.videos} />}
        {char.skills && costTemplates && <CharacterSkills skills={char.skills} costTemplates={costTemplates} />}
      </div>
    </Main>
  )
}

function getDescription(char: Character, charElems: ElementType[], characterCurves: CharacterCurves | null): string | undefined {
  return `${char.name} is a ${char.star ? `${char.star} star ` : ""}${joinMulti(charElems)} ${getWeaponLine()}.\n${getCharStatsLine()}\n${getAscensionLine()}${getTalentLine()}`.trim()

  function getCharStatsLine() {
    if (isFullCharacter(char) && characterCurves)
      return getStatsLine(
        char.ascensions[char.ascensions.length - 1].maxLevel,
        getCharStatsAt(char, char.ascensions[char.ascensions.length - 1].maxLevel, char.ascensions.length - 1, characterCurves)
      )
    return ""
  }

  function getStatsLine(level: number, stats: Record<string, number>) {
    return `Stats at level ${level}: ${joinMulti(Object.entries(stats).map(([name, value]) => `${stat(name, value)} ${name}`))}. \n`
  }

  function getWeaponLine() {
    if (char.weaponType)
      return `${char.weaponType} user`
    return "character (unreleased)"
  }

  function getTalentLine() {
    if (char.skills && getTalentCosts(char.skills).length > 0)
      return `Uses ${joinMulti(getTalentCosts(char.skills))} for talents. \n`
    return ""
  }

  function getAscensionLine() {
    if (char.ascensionCosts)
      return `Uses ${joinMulti(getAscensionCosts(char.ascensionCosts))} for ascensions. \n`
    return ""
  }
}

function TOC({ href, title, depth = 0 }: { href: string, title: string, depth?: number }) {
  const size = depth > 0 ? "sm" : "base"
  return <div>
    <FormattedLink href={href} className={`text-${size}`} style={({ marginLeft: (0.25 * depth) + "rem" })}>{title}</FormattedLink>
  </div>
}
function getAscensionCosts(costs: CostTemplate) {
  return [
    costs.mapping.Gem4,
    costs.mapping.BossMat,
    costs.mapping.Specialty,
    costs.mapping.EnemyDropTier3,
  ].filter(x => x)
}
function AscensionCosts({ costs }: { costs: CostTemplate }) {
  const ascensionCosts = getAscensionCosts(costs)
  return <div className="flex flex-wrap items-center">
    <div className="text-base font-semibold pt-1 inline-block pr-1 h-9">Ascension materials:</div>
    {ascensionCosts.map(e => <MaterialImage key={e} name={e} />)}
  </div>
}

function getTalentCosts(skills: Skills[]): string[] {
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

  return [...books, ...mats, ...drops] as string[]
}

function TalentCosts({ talentCosts }: { talentCosts: string[] }) {
  return <div className="flex flex-wrap items-center">
    <div className="text-base font-semibold pt-1 inline-block pr-1 h-9">Talent materials:</div>
    {talentCosts.map(e => <MaterialImage key={e} name={e} />)}
  </div>
}

function Stats({ char, curves }: { char: CharacterFull, curves: Record<CurveEnum, number[]> }) {
  const [expanded, setExpanded] = useState(false)

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
    <h3 className="text-lg font-bold pt-1" id="stats">Stats:</h3>
    <table className={`table-auto w-full ${styles.table} ${styles.stattable} mb-2 ${expanded ? "" : "cursor-pointer"} sm:text-sm md:text-base text-xs`} onClick={() => setExpanded(true)}>
      <thead>
        <tr className="divide-x divide-gray-200 dark:divide-gray-500">
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
            {Object.entries(getCharStatsAt(char, lv, a, curves)).map(([name, value]) => <td key={name}>{stat(name, value)}</td>)}
          </tr>)}
        {!expanded && <tr className="pr-1 cursor-pointer text-blue-700 dark:text-blue-300 hover:text-blue-400 dark:hover:text-blue-400 no-underline transition-all duration-200 font-semibold">
          <td colSpan={Object.keys(getCharStatsAt(char, 1, 1, curves)).length + 2} style={({ textAlign: "center" })}>Click to expand...</td>
        </tr>}
      </tbody>
    </table>
  </>
}

function MetaSection({ meta }: { meta: Meta }) {
  return <div>
    <h3 className="text-lg font-bold pt-1" id="meta">Meta:</h3>
    <table className={`table-auto ${styles.table} mb-2 w-full`}>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-500">
        {meta.title && <tr><td>Title</td><td>{meta.title}</td></tr>}
        {meta.birthDay && meta.birthMonth && <tr><td>Birthday</td><td>{
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
  </div>
}

function Videos({ videos }: { videos: Record<string, string> }) {
  const multiple = Object.keys(videos).length > 1

  return <div>
    <h3 className="text-lg font-bold pt-1" id="videos">{multiple ? "Videos" : "Video"}:</h3>
    {Object.entries(videos).map(([name, link]) => <Video key={name} name={name} link={link} />)}
  </div>
}

function Video({ name, link }: { name: string, link: string }) {
  const [expanded, setExpanded] = useState(false)

  return <div className={`${expanded ? "text-blue-600 dark:text-blue-400 hover:text-blue-400 dark:hover:text-blue-500" : "text-blue-700 dark:text-blue-300 hover:text-blue-400 dark:hover:text-blue-400"} cursor-pointer`} onClick={() => setExpanded(!expanded)}>
    {name}
    {expanded && <YouTube vidID={link.replace("https://youtu.be/", "")} autoplay />}
  </div>
}

function CharacterSkills({ skills, costTemplates }: { skills: Skills[], costTemplates: CostTemplates }) {
  return <>
    {skills.map((skill, i) => {
      return <div key={i}>
        {(skill.talents || skill.ult) && <>
          <h3 className="text-lg font-bold pt-1" id={`talents${i > 0 ? `-${i}` : ""}`}>Talents:</h3>
          {[...(skill.talents ?? []), skill.ult].map(s => s && <Talent costTemplates={costTemplates} talent={s} key={s.name} />)}
        </>}
        {skill.passive && <>
          <h3 className="text-lg font-bold pt-1" id={`passive${i > 0 ? `-${i}` : ""}`}>Passives:</h3>
          {skill.passive.map(p => p && <PassiveSection passive={p} key={p.name} />)}
        </>}
        {skill.constellations && <>
          <h3 className="text-lg font-bold pt-1" id={`const${i > 0 ? `-${i}` : ""}`}>Constellations:</h3>
          {skill.constellations.map(c => c && <ConstellationSection c={c} key={c.name} />)}
        </>}
      </div>
    })}
  </>
}

function Talent({ talent, costTemplates }: { talent: Skill, costTemplates: CostTemplates }) {
  return <div className="border p-1 rounded-xl mb-2 border-opacity-75">
    <div className="flex flex-row items-center" id={urlify(talent.name, false)}>
      {talent.icon && <Icon icon={talent} className="rounded-full w-16 h-16 mr-2 bg-slate-600" />}
      <div className="font-bold">{talent.name}</div>
    </div>
    <div className="flex flex-wrap sm:flex-nowrap sm:flex-row pb-1">
      <div className={(talent.video || talent.videomp4) ? "max-w-2xl w-2xl pl-1" : "pl-1"}>
        <ReactMarkdown>{(talent.desc?.replace(/ ?\$\{.*?\}/g, "").replace(/\n/g, "\n\n") ?? "")}</ReactMarkdown>
      </div>
      {(talent.video || talent.videomp4) && <div className="p-2 flex flex-col justify-around items-center sm:items-end w-full sm:min-w-min">
        {talent.videomp4 ? <video src={talent.videomp4} autoPlay muted loop playsInline className="w-fit" /> : <img src={talent.video} alt="Talent video" className="w-full" />}
      </div>}
    </div>
    {talent.talentTable && <TalentTableSection table={talent.talentTable} />}
    {talent.costs && !Array.isArray(talent.costs) && <TalentCost template={talent.costs} costTemplates={costTemplates} />}
  </div>
}

function TalentCost({ template, costTemplates }: { template: CostTemplate, costTemplates: CostTemplates }) {
  const costs = getCostsFromTemplate(template, costTemplates)
  const maxCostWidth = costs?.reduce((p, c) => Math.max(p, c.items.length), 1) ?? 1
  const [expanded, setExpanded] = useState(false)

  return <>
    <div className="font-bold">Talent costs:</div>
    <table className={`table-auto w-full ${styles.table} mb-2 ${expanded ? "" : "cursor-pointer"} sm:text-sm md:text-base text-xs`} onClick={() => setExpanded(true)}>
      <thead>
        <tr className="divide-x divide-gray-200 dark:divide-gray-500">
          <th>Lv.</th>
          <th>Mora</th>
          <th colSpan={maxCostWidth}>Items</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-500">
        {costs
          .map(({ mora, items }, ind) => <tr className="pr-1 divide-x divide-gray-200 dark:divide-gray-500" key={ind}>
            <td>{ind + 1}&rarr;{ind + 2}</td>
            <td className="text-right">{mora}</td>
            {items.map(({ count, name }, i, arr) => <td key={name} colSpan={i == arr.length - 1 ? maxCostWidth - i : 1}>
              {count > 0 && <MaterialCost name={name} count={count} />}
            </td>)}
          </tr>
          )
          .filter((_, i, arr) => expanded ? true : (i == arr.length - 1))}
        {!expanded && <tr className="pr-1 cursor-pointer text-blue-700 dark:text-blue-300 hover:text-blue-400 dark:hover:text-blue-400 no-underline transition-all duration-200 font-semibold">
          <td colSpan={maxCostWidth + 2} style={({ textAlign: "center" })}>Click to expand...</td>
        </tr>}
      </tbody>
    </table>
  </>
}

function TalentTableSection({ table }: { table: (TalentTable | TalentValue)[] }) {
  const maxLevel = table.reduce((p, c) => Math.max(p, isValueTable(c) ? c.values.length : 1), 1)
  const levels = []
  for (let i = 0; i < maxLevel; i++)
    levels.push(i)

  function hint(input: string): ReactElement {
    return <>
      {input.split("").map((x, i) => <span key={i}>{x}{x.match(/[+/%]/) && <wbr />}</span>)}
    </>
  }
  function countUp<T>(arr: T[], v: T, i: number): number {
    let j = 1
    while (i < arr.length) {
      if (arr[++i] == v)
        j++
      else
        break
    }
    return j
  }

  return <div className="overflow-x-auto pt-1">
    <div className="font-bold">Talent values:</div>
    <table className={`${maxLevel > 3 ? "table-auto" : "table-fixed"} w-full ${styles.table} mb-2 sm:text-sm md:text-base text-xs`}>
      <thead>
        <tr className="divide-x divide-gray-200 dark:divide-gray-500">
          <th>Name</th>
          {levels.map((i) => <th key={i + 1}>Lv. {i + 1}</th>)}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-500">
        {table
          .map(row => <tr className="pr-1 divide-x divide-gray-200 dark:divide-gray-500" key={row.name}>
            <td>{row.name}</td>
            {isValueTable(row) ? row.values.map((v, i, arr) => arr[i - 1] != v && <td key={i} colSpan={countUp(arr, v, i)} className="text-center">{hint(v)}</td>) : <td colSpan={maxLevel} style={({ textAlign: "center" })}>{hint(row.value)}</td>}
          </tr>)}
      </tbody>
    </table>
  </div>
}

function PassiveSection({ passive }: { passive: Passive }) {
  return <div className="border p-1 rounded-xl mb-2 border-opacity-75">
    <div className="flex flex-row items-center" id={urlify(passive.name, false)}>
      {passive.icon && <Icon icon={passive} className="rounded-full w-16 h-16 mr-2 bg-slate-600" />}
      <div className="font-bold">{passive.name}</div>
    </div>
    <div className="flex flex-col pb-1 pl-1">
      <ReactMarkdown>{(passive.desc?.replace(/ ?\$\{.*?\}/g, "").replace(/\n/g, "\n\n") ?? "")}</ReactMarkdown>
      {passive.minAscension != undefined && <div className="italic font-semibold pt-2">
        {passive.minAscension == 0 ? "Unlocked by default" : `Unlocks at ascension ${passive.minAscension}`}
      </div>}
    </div>
  </div>
}

function ConstellationSection({ c }: { c: Constellation }) {
  return <div className="border p-1 rounded-xl mb-2 border-opacity-75">
    <div className="flex flex-row items-center" id={urlify(c.name, false)}>
      {c.icon && <Icon icon={c} className="rounded-full w-16 h-16 mr-2 bg-slate-600" />}
      <div className="font-bold">{c.name}</div>
    </div>
    <div className="flex flex-col pb-1 pl-1">
      <ReactMarkdown>{(c.desc?.replace(/ ?\$\{.*?\}/g, "").replace(/\n/g, "\n\n") ?? "")}</ReactMarkdown>
    </div>
  </div>
}

export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> {
  const charName = context.params?.char
  const data = await getCharacters()

  const char = Object.values(data ?? {}).find(c => urlify(c.name, false) == charName)
  if (!data || !char) {
    return {
      notFound: true,
      revalidate: 15 * 60
    }
  }

  const neededTemplates: string[] = []
  let characterCurves = null
  if (isFullCharacter(char)) {
    const curves = await getCharacterCurves()
    if (curves)
      characterCurves = Object.fromEntries(char.curves.map(c => c.curve).filter((v, i, arr) => arr.indexOf(v) == i).map(c => [c, curves[c]])) as CharacterCurves
  }

  if (char.skills)
    neededTemplates.push(...char.skills.flatMap(s => {
      const templates = s.talents?.flatMap(t => t.costs?.template ?? []) ?? []
      if (s.ult?.costs?.template)
        templates.push(s.ult.costs.template)
      return templates
    }))


  let costTemplates = {}
  if (char.ascensionCosts) {
    neededTemplates.push(char.ascensionCosts.template)
  }

  if (neededTemplates.length > 0) {
    const templates = await getCostTemplates()
    if (templates)
      costTemplates = Object.fromEntries(neededTemplates.filter((v, i, arr) => arr.indexOf(v) == i).map(c => [c, templates[c]])) as CostTemplates
  }

  const guides = (await getGuidesFor("character", char.name))?.map(({ guide, page }) => [page.name, getLinkToGuide(guide, page)])

  let specialty: SpecialtyItem | null = null

  const mats = await getMaterials()
  const special = Object.values(mats ?? {}).find(m => m.specialty?.char == char.name)
  if (special) {
    const recipe = Object.values(mats ?? {}).find(m => m.name == special.specialty?.recipe)

    if (recipe)
      specialty = {
        special: createSmallMaterial(special),
        char: createSmallChar(char),
        recipe: createSmallMaterial(recipe)
      }
  }


  return {
    props: {
      char,
      specialty,
      characterCurves,
      costTemplates,
      guides
    },
    revalidate: 60 * 60 * 1
  }
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const data = await getCharacters()
  return {
    paths: Object.values(data ?? {}).map(c => ({
      params: { char: urlify(c.name, false) }
    })) ?? [],
    fallback: "blocking"
  }
}
