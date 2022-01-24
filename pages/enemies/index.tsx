import { GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import Image from "next/image"
import { useState } from "react"
import { ExclusiveButton, ToggleAllButton, ToggleButton } from "../../components/Filters"
import { SmallIcon } from "../../components/Icon"
import Main from "../../components/Main"
import { getEnemies } from "../../utils/data-cache"
import { SmallEnemy } from "../../utils/types"
import { createSmallEnemy } from "../../utils/utils"


interface Props {
  enemies: SmallEnemy[]
}

export default function Enemies(props: Props & { location: string }) {
  const [filter, setFilter] = useState(false)

  const defaultKinds = props.enemies.map(m => m.kind).filter((c, i, a) => c && a.indexOf(c) == i) as string[]
  const defaultTypes = props.enemies.map(m => m.type).filter((c, i, a) => c && a.indexOf(c) == i) as string[]

  const [kindFilter, setKindFilter] = useState(defaultKinds)
  const [typeFilter, setTypeFilter] = useState(defaultTypes)

  const desc = `View description, classification and resistances of the ${props.enemies.length} different enemies in Genshin Impact.`
  return (
    <Main>
      <Head>
        <title>Enemies | Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Enemies | Hu Tao" />
        <meta property="og:description" content={desc} />
        <meta property="description" content={desc} />
      </Head>

      <h1 className="text-5xl font-bold pb-2">
        Enemies
      </h1>

      {filter ? <div className="bg-slate-100 dark:bg-slate-600 flex flex-col p-2 rounded-2xl font-semibold gap-2">
        <div className="pb-2">
          <div className="flex flex-row font-semibold float-right">
            <ExclusiveButton type={filter} value={false} setter={setFilter}>
              Hide filters
            </ExclusiveButton>
          </div>
          <div className="flex flex-row gap-4 pt-2">
            Enemy kind
            <ToggleAllButton type={kindFilter} value={defaultKinds} setter={setKindFilter}>
              All
            </ToggleAllButton>
          </div>
          <div className="flex flex-row flex-wrap gap-2 pt-2">
            {defaultKinds.map(e => (
              <ToggleButton key={e} type={kindFilter} value={e} setter={setKindFilter}>
                {e}
              </ToggleButton>
            ))}
          </div>
        </div>
        <div className="py-1">
          <div className="flex flex-row gap-4 pt-2">
            Enemy type
            <ToggleAllButton type={typeFilter} value={defaultTypes} setter={setTypeFilter}>
              All
            </ToggleAllButton>
          </div>
          <div className="flex flex-row flex-wrap gap-2 pt-2">
            {defaultTypes.map(e => (
              <ToggleButton key={e} type={typeFilter} value={e} setter={setTypeFilter}>
                {e}
              </ToggleButton>
            ))}
          </div>
        </div>
      </div> : <div className="flex flex-row font-semibold justify-end">
        <ExclusiveButton type={filter} value={true} setter={setFilter}>
          Show filters
        </ExclusiveButton>
      </div>
      }

      <div className="flex flex-wrap justify-evenly text-center pt-2">
        {props.enemies
          .filter(m => typeFilter.some(e => m.type?.includes(e)) || m.type == undefined)
          .filter(m => kindFilter.some(e => m.kind?.includes(e)) || m.kind == undefined)
          .map(weapon => <SmallIcon key={weapon.name} thing={weapon} location={props.location} />)}
      </div>
    </Main>
  )
}


export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> {
  const data = await getEnemies()

  if (!data) {
    return {
      notFound: true,
      revalidate: 15 * 60
    }
  }

  return {
    props: {
      enemies: Object
        .values(data)
        .map(w => createSmallEnemy(w))
    },
    revalidate: 60 * 60 * 16
  }
}
