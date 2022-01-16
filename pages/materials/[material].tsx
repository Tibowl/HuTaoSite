/* eslint-disable @next/next/no-img-element */
import { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import ReactMarkdown from "react-markdown"
import FormattedLink from "../../components/FormattedLink"
import Guides from "../../components/Guides"
import Icon from "../../components/Icon"
import Main from "../../components/Main"
import { getMaterials } from "../../utils/data-cache"
import { Material } from "../../utils/types"
import { getGuidesFor, getLinkToGuide, getStarColor, urlify } from "../../utils/utils"

interface Props {
  mat: Material,
  guides?: string[][]
}

export default function CharacterWebpage({ mat, location, guides }: Props & { location: string }) {
  const color = getStarColor(mat.stars ?? 1)

  return (
    <Main>
      <Head>
        <title>{mat.name} | Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content={`${mat.name} | Hu Tao`} />
        <meta property="og:description" content={`View ${mat.name} information`} />
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

  const mat = Object.values(data ?? {}).find(g => urlify(g.name, false) == matName)
  if (!data || !mat) {
    return {
      notFound: true,
      revalidate: 5 * 60
    }
  }

  const guides = (await getGuidesFor("material", mat.name))?.map(({ guide, page }) => [page.name, getLinkToGuide(guide, page)])

  return {
    props: {
      mat,
      guides
    },
    revalidate: 60 * 60
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
