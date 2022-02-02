/* eslint-disable @next/next/no-img-element */
import { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import ReactMarkdown from "react-markdown"
import FormattedLink from "../../components/FormattedLink"
import Guides from "../../components/Guides"
import Icon, { SmallIcon } from "../../components/Icon"
import Main from "../../components/Main"
import { CostTemplates, getCharacters, getCostTemplates, getMaterials, getWeapons } from "../../utils/data-cache"
import { Cost, CostTemplate, Material, SmallChar, SmallWeapon } from "../../utils/types"
import { clean, createSmallChar, createSmallWeapon, getCostsFromTemplate, getGuidesFor, getIconPath, getLinkToGuide, getStarColor, isInCosts, joinMulti, urlify } from "../../utils/utils"

interface Props {
  mat: Material,
  guides?: string[][],
  usedBy: {
    charTalents: SmallChar[]
    charAscension: SmallChar[]
    weaponAscension: SmallWeapon[]
  }
}

export default function MaterialWebpage({ mat, location, guides, usedBy }: Props & { location: string }) {
  const color = getStarColor(mat.stars ?? 1)
  const usedByDesc = []

  const { charTalents, charAscension, weaponAscension } = usedBy

  const overlap = charTalents.filter(x => charAscension.some(y => x.name == y.name))
  const uniqueTalents = charTalents.filter(x => !charAscension.some(y => x.name == y.name))
  const uniqueAscension = charAscension.filter(x => !charTalents.some(y => x.name == y.name))

  if (overlap.length > 0)
    usedByDesc.push(`Used by ${joinMulti(overlap.map(x => x.name).filter((v, i, a) => a.indexOf(v) == i))} character talents and ascensions.`)

  if (uniqueTalents.length > 0)
    usedByDesc.push(`Used by ${joinMulti(uniqueTalents.map(x => x.name))} character talents.`)

  if (uniqueAscension.length > 0)
    usedByDesc.push(`Used by ${joinMulti(uniqueAscension.map(x => x.name))} character ascensions.`)

  if (weaponAscension.length > 0)
    usedByDesc.push(`Used by ${joinMulti(weaponAscension.map(x => x.name))} weapon ascensions.`)

  const desc = `${mat.name} is a ${mat.stars ? `${mat.stars} star ` : ""}${mat.type}. \n${usedByDesc.join("\n")}\n${mat.desc ? clean(mat.desc ?? "") : ""}`.trim()
  return (
    <Main>
      <Head>
        <title>{mat.name} | Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content={`${mat.name} | Hu Tao`} />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
        {mat.icon && <meta property="og:image" content={getIconPath(mat.icon)} />}
      </Head>
      <h2 className="font-semibold">
        <FormattedLink href="/materials/" location={location} className="font-semibold text-lg">
          Materials
        </FormattedLink>
      </h2>

      <h1 className="text-4xl font-bold pb-2 sm:sr-only not-sr-only">
        <Icon icon={mat} className={`${color} rounded-xl sm:w-0 mr-2 w-12 inline-block`} />
        {mat.name}
      </h1>

      <div className="grid grid-flow-col justify-start">
        <div className="sm:w-36 mr-2 w-0 ">
          <Icon icon={mat} className={`${color} rounded-xl`} />
        </div>

        <div id="description" className="w-full">
          <h1 className="text-4xl font-bold pb-2 sm:not-sr-only sr-only">
            {mat.name}
          </h1>

          {mat.category && <div className="inline-block pr-2 font-semibold">
            {mat.category}
          </div>}

          {mat.stars && <div className="inline-block pr-2">
            {mat.stars}★
          </div>}

          {mat.type && <div className="inline-block pr-2">
            {mat.type}
          </div>}

          <blockquote className="pl-5 mt-3 mb-2 border-l-2">
            <ReactMarkdown>{(mat.desc?.replace(/ ?\$\{.*?\}/g, "").replace(/\n/g, "\n\n") ?? "")}</ReactMarkdown>
          </blockquote>

        </div>
      </div>

      <div id="details">
        {guides && guides.length > 0 && <Guides guides={guides} />}

        {mat.sources && <>
          <h3 className="text-lg font-bold pt-1" id="sources">Sources:</h3>
          {mat.sources.map(s => <div key={s}>{s}</div>)}
        </>}

        {overlap.length > 0 && <>
          <h3 className="text-lg font-bold pt-1" id="chartalents">Used by character ascensions and talents:</h3>
          <div className="flex flex-wrap justify-start text-center mt-2">
            {overlap.map(c => <SmallIcon key={c.name} thing={c} location={location} />)}
          </div>
        </>}

        {uniqueTalents.length > 0 && <>
          <h3 className="text-lg font-bold pt-1" id="chartalents">Used by character talents:</h3>
          <div className="flex flex-wrap justify-start text-center mt-2">
            {uniqueTalents.map(c => <SmallIcon key={c.name} thing={c} location={location} />)}
          </div>
        </>}

        {uniqueAscension.length > 0 && <>
          <h3 className="text-lg font-bold pt-1" id="charascension">Used by character ascensions:</h3>
          <div className="flex flex-wrap justify-start text-center mt-2">
            {uniqueAscension.map(c => <SmallIcon key={c.name} thing={c} location={location} />)}
          </div>
        </>}

        {weaponAscension.length > 0 && <>
          <h3 className="text-lg font-bold pt-1" id="weaponascension">Used by weapon ascensions:</h3>
          <div className="flex flex-wrap justify-start text-center mt-2">
            {weaponAscension.map(c => <SmallIcon key={c.name} thing={c} location={location} />)}
          </div>
        </>}

        {mat.longDesc && <>
          <h3 className="text-lg font-bold pt-1" id="longdesc">Description:</h3>
          <blockquote className="pl-5 mb-2 border-l-2">
            <ReactMarkdown>{(mat.longDesc?.replace(/ ?\$\{.*?\}/g, "").replace(/\n/g, "\n\n") ?? "")}</ReactMarkdown>
          </blockquote>
        </>}
      </div>
    </Main>
  )
}

export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> {
  const matName = context.params?.material
  const data = await getMaterials()

  const mat = Object.values(data ?? {}).find(m => urlify(m.name, false) == matName)
  if (!data || !mat) {
    return {
      notFound: true,
      revalidate: 15 * 60
    }
  }

  const guides = (await getGuidesFor("material", mat.name))?.map(({ guide, page }) => [page.name, getLinkToGuide(guide, page)])

  const char = await getCharacters()
  const costTemplates = await getCostTemplates()
  const charAscension: SmallChar[] = []
  const charTalents: SmallChar[] = []

  if (char && costTemplates) {
    for (const c of Object.values(char)) {
      if (c.ascensionCosts && isInCosts(c.ascensionCosts, costTemplates, mat.name))
        charAscension.push(createSmallChar(c))

      if (c.skills) {
        const talents = c.skills.flatMap(s => [...(s.talents ?? []), s.ult])

        if (talents.some(x => x?.costs && isInCosts(x.costs, costTemplates, mat.name)))
          charTalents.push(createSmallChar(c))
      }
    }
  }


  const weapons = await getWeapons()
  const weaponAscension: SmallWeapon[] = []

  if (weapons && costTemplates) {
    for (const w of Object.values(weapons)) {
      if (w.ascensionCosts && isInCosts(w.ascensionCosts, costTemplates, mat.name))
        weaponAscension.push(createSmallWeapon(w))
    }
  }

  return {
    props: {
      mat,
      guides,
      usedBy: {
        charAscension,
        charTalents,
        weaponAscension: weaponAscension.sort((a, b) => (a.stars && b.stars && b.stars - a.stars) || (a.weapon && b.weapon && a.weapon.localeCompare(b.weapon)) || a.name.localeCompare(b.name))
      }
    },
    revalidate: 60 * 60 * 2
  }
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const data = await getMaterials()
  return {
    paths: Object.values(data ?? {}).map(m => ({
      params: { material: urlify(m.name, false) }
    })) ?? [],
    fallback: "blocking"
  }
}
