import { GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import { useState } from "react"
import { ExclusiveButton } from "../../components/Filters"
import { SmallIcon } from "../../components/Icon"
import Main from "../../components/Main"
import { getArtifacts } from "../../utils/data-cache"
import { SmallArtifact } from "../../utils/types"
import { createSmallArtifact } from "../../utils/utils"


interface Props {
  artifacts: SmallArtifact[]
}

export default function Artifacts(props: Props & { location: string }) {
  const [filter, setFilter] = useState(false)

  const [starFilter, setStarFilter] = useState(0)

  const desc = `View set bonuses and description of the ${props.artifacts.length} different artifact sets in Genshin Impact.`
  return (
    <Main>
      <Head>
        <title>Artifacts | Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Artifacts | Hu Tao" />
        <meta property="og:description" content={desc} />
        <meta property="description" content={desc} />
      </Head>

      <h1 className="text-5xl font-bold pb-2">
        Artifacts
      </h1>

      {filter ? <div className="bg-slate-100 dark:bg-slate-600 flex flex-col p-2 rounded-2xl font-semibold gap-2">
        <div className="pb-2">
          <div className="flex flex-row font-semibold float-right">
            <ExclusiveButton type={filter} value={false} setter={setFilter}>
              Hide filters
            </ExclusiveButton>
          </div>
          <div>
            Maximum rarity filter
          </div>
          <div className="flex flex-row flex-wrap gap-2 pt-2">
            <ExclusiveButton type={starFilter} value={0} setter={setStarFilter}>
              All
            </ExclusiveButton>
            <ExclusiveButton type={starFilter} value={5} setter={setStarFilter}>
              Max 5★ Only
            </ExclusiveButton>
            <ExclusiveButton type={starFilter} value={4} setter={setStarFilter}>
              Max 4★ Only
            </ExclusiveButton>
            <ExclusiveButton type={starFilter} value={3} setter={setStarFilter}>
              Max 3★ Only
            </ExclusiveButton>
          </div>
        </div>
      </div> : <div className="flex flex-row font-semibold justify-end">
        <ExclusiveButton type={filter} value={true} setter={setFilter}>
          Show filters
        </ExclusiveButton>
      </div>
      }

      <div className="flex flex-wrap justify-evenly text-center pt-2">
        {props.artifacts
          .filter(w => starFilter == 0 || starFilter == w.stars)
          .map(artifact => <SmallIcon key={artifact.name} thing={artifact} location={props.location} />)}
      </div>
    </Main>
  )
}


export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> {
  const data = await getArtifacts()

  if (!data) {
    return {
      notFound: true,
      revalidate: 15 * 60
    }
  }

  return {
    props: {
      artifacts: Object
        .values(data)
        .sort((a, b) => Math.max(...b.levels ?? [5]) - Math.max(...a.levels ?? [5]) || Math.min(...a.levels ?? [4]) - Math.min(...b.levels ?? [4]) || a.name.localeCompare(b.name))
        .map(w => createSmallArtifact(w))
    },
    revalidate: 60 * 60 * 4
  }
}
