import { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import Image from "next/image"
import { useState } from "react"
import FormattedLink from "../../components/FormattedLink"
import Main from "../../components/Main"
import YouTube from "../../components/YouTube"
import { getCharacterCurves, getCharacters, urlify } from "../../utils/data-cache"
import { elements, ElementType, getCharStatsAt, isFullCharacter, stat, weapons } from "../../utils/utils"
import { Character, CharacterFull, CostTemplate, CurveEnum, Skills } from "../../utils/types"

interface Props {
  char: Character,
  characterCurves: Record<CurveEnum, number[]> | null
}

export default function CharacterWebpage({ char, location, characterCurves }: Props & { location: string }) {
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

      <div className="float-right border-2 border-slate-500 dark:bg-slate-600 bg-slate-200 m-2">
        Table of Content
      </div>

      <div>
        <blockquote className="pl-5 border-l-2">
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
        {isFullCharacter(char) && characterCurves && <QuickStats char={char} curves={characterCurves}/>}
        {char.media.videos && <Videos videos={char.media.videos} />}
      </div>

    </Main>
  )
}

function AscensionCosts({ costs }: { costs: CostTemplate }) {
  const ascensionCosts = [
    costs.mapping.Gem4,
    costs.mapping.BossMat,
    costs.mapping.Specialty,
    costs.mapping.EnemyDropTier3,
  ].filter(x => x)
  return <div>
    <h4 className="text-base font-semibold pt-1 inline-block pr-1">Ascension materials:</h4>
    {ascensionCosts.map(e => <div className="inline-block pr-1" key={e}>
      {e}
    </div>)}
  </div>
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

  const all = [...books, ...mats, ...drops]
  return <div>
    <h4 className="text-base font-semibold pt-1 inline-block pr-1">Talent materials:</h4>
    {all.map(e => <div className="inline-block pr-1" key={e}>
      {e}
    </div>)}
  </div>
}

function QuickStats({ char, curves }: { char: CharacterFull, curves: Record<CurveEnum, number[]> }) {
  const maxAscension = char.ascensions[char.ascensions.length - 1]

  const base = getCharStatsAt(char, 1, 0, curves)
  const max = getCharStatsAt(char, maxAscension.maxLevel, maxAscension.level, curves)

  // TODO

  return <div className="flex flex-row justify-evenly">
    <div>
      <h4 className="text-base font-semibold pt-1 inline-block pr-1">Base stats:</h4>
      {Object.entries(base)
        .map(([name, value]) => <div className="pr-1" key={name}>
          {name}: {stat(name, value)}
        </div>)}
    </div>
    <div>
      <h4 className="text-base font-semibold pt-1 inline-block pr-1">Max stats:</h4>
      {Object.entries(max)
        .map(([name, value]) => <div className="pr-1" key={name}>
          {name}: {stat(name, value)}
        </div>)}
    </div>
  </div>
}

function Videos({ videos }: { videos: Record<string, string> }) {
  const multiple = Object.keys(videos).length > 1

  return <div>
    <h3 className="text-lg font-bold pt-1">{multiple ? "Videos" : "Video"}:</h3>
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
      characterCurves = Object.fromEntries(char.curves.map(c => c.curve).filter((v, i, arr) => arr.indexOf(v) == i).map(c => [c, curves[c]])) as Record<CurveEnum, number[]>
  }

  return {
    props: {
      char,
      characterCurves
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
