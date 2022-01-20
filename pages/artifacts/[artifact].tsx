import { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import ReactMarkdown from "react-markdown"
import FormattedLink from "../../components/FormattedLink"
import Guides from "../../components/Guides"
import Icon from "../../components/Icon"
import Main from "../../components/Main"
import { getArtifacts } from "../../utils/data-cache"
import { Arti, Artifact, Bonus } from "../../utils/types"
import { clean, getGuidesFor, getIconPath, getLinkToGuide, getStarColor, joinMulti, urlify } from "../../utils/utils"

interface Props {
  artifact: Artifact,
  guides?: string[][],
}

export default function ArtifactWebpage({ artifact, location, guides }: Props & { location: string }) {
  const color = getStarColor(Math.max(...(artifact.levels ?? [1])))

  return (
    <Main>
      <Head>
        <title>{artifact.name} | Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content={`${artifact.name} | Hu Tao`} />
        <meta property="og:description" content={`The ${artifact.name} artifact set${artifact.artis?.length ?? 0 > 0 ?
          ` consists of ${artifact.artis?.length} pieces and is available in ${joinMulti(artifact.levels?.map(l => `${l}`) ?? [])} star variants. \nIt also has` :
          " has"} ${joinMulti(artifact.bonuses?.map(b => `a ${b.count} piece set bonus: "${clean(b.desc)}"`) ?? [])}.`} />
        {artifact.artis?.[0]?.icon && <meta property="og:image" content={getIconPath(artifact.artis[0].icon)} />}
      </Head>
      <h2 className="font-semibold">
        <FormattedLink href="/artifacts/" location={location} className="font-semibold text-lg">
          Artifacts
        </FormattedLink>
      </h2>

      <h1 className="text-4xl font-bold pb-2 sm:sr-only not-sr-only">
        <Icon icon={{ name: artifact.name, icon: artifact.artis?.[0]?.icon }} className={`${color} rounded-xl sm:w-0 mr-2 w-12 inline-block`} />
        {artifact.name}
      </h1>

      <div className="grid grid-flow-col justify-start">
        <div className="sm:w-36 mr-2 w-0 ">
          <Icon icon={{ name: artifact.name, icon: artifact.artis?.[0]?.icon }} className={`${color} rounded-xl`} />
        </div>

        <div id="description" className="w-full">
          <h1 className="text-4xl font-bold pb-2 sm:not-sr-only sr-only">
            {artifact.name}
          </h1>

          {artifact.levels && <div className="inline-block pr-2">
            Available in {joinMulti(artifact.levels.map(l => `${l}★`))}
          </div>}
        </div>
      </div>

      <div id="details">
        {guides && guides.length > 0 && <Guides guides={guides} />}
        {artifact.bonuses && artifact.bonuses.length > 0 && <Bonuses bonuses={artifact.bonuses} />}
        {artifact.artis && artifact.artis.length > 0 && <Artis artis={artifact.artis} />}

      </div>
    </Main>
  )
}

function Bonuses({ bonuses }: { bonuses: Bonus[] }) {
  return <>
    <h3 className="text-lg font-bold pt-1" id="bonuses">Bonuses:</h3>
    {bonuses.map(bonus => <div key={bonus.count} className="py-2">
      <div className="font-semibold">{bonus.count}-Piece Set Bonus</div>
      {bonus.desc}
    </div>)}
  </>
}

function Artis({ artis }: { artis: Arti[] }) {
  return <>
    <h3 className="text-lg font-bold pt-1" id="artis">Pieces:</h3>
    {artis.map(arti =>
      <div key={arti.type} className="border p-1 rounded-xl mb-2 border-opacity-75">
        <div className="flex flex-row items-center" id={urlify(arti.name, false)}>
          {arti.icon && <Icon icon={arti} className="rounded-full w-16 h-16 mr-2 " />}
          <div className="font-bold">{arti.name}</div>
        </div>
        <div className="flex flex-col pb-1 pl-1">
          <ReactMarkdown>{(arti.desc?.replace(/ ?\$\{.*?\}/g, "").replace(/\n/g, "\n\n") ?? "")}</ReactMarkdown>
        </div>
      </div>
    )}
  </>
}

export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> {
  const artifactName = context.params?.artifact
  const data = await getArtifacts()

  const artifact = Object.values(data ?? {}).find(g => urlify(g.name, false) == artifactName)
  if (!data || !artifact) {
    return {
      notFound: true,
      revalidate: 5 * 60
    }
  }

  const guides = (await getGuidesFor("artifact", artifact.name))?.map(({ guide, page }) => [page.name, getLinkToGuide(guide, page)])

  return {
    props: {
      artifact,
      guides,
    },
    revalidate: 60 * 60
  }
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const data = await getArtifacts()
  return {
    paths: Object.values(data ?? {}).map(a => ({
      params: { artifact: urlify(a.name, false) }
    })) ?? [],
    fallback: "blocking"
  }
}
