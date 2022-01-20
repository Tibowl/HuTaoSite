import { GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import Image from "next/image"
import { useState } from "react"
import { ExclusiveButton, ToggleAllButton, ToggleButton } from "../../components/Filters"
import { SmallIcon } from "../../components/Icon"
import Main from "../../components/Main"
import { getCharacters } from "../../utils/data-cache"
import { SmallChar, WeaponType } from "../../utils/types"
import { createSmallChar, elements, ElementType, isFullCharacter, weapons } from "../../utils/utils"


interface Props {
  characters: SmallChar[]
}

const defaultElements: ElementType[] = Object.keys(elements) as ElementType[]
const defaultWeapons: WeaponType[] = Object.keys(weapons) as WeaponType[]

export default function Characters(props: Props & { location: string }) {
  const [filter, setFilter] = useState(false)

  const [starFilter, setStarFilter] = useState(0)
  const [elementFilter, setElementFilter] = useState(defaultElements)
  const [weaponFilter, setWeaponFilter] = useState(defaultWeapons)

  return (
    <Main>
      <Head>
        <title>Characters | Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Characters | Hu Tao" />
        <meta property="og:description" content={`View talent/ascension material, constellations and more of the ${props.characters.length} different characters in Genshin Impact.`} />
      </Head>

      <h1 className="text-5xl font-bold pb-2">
        Characters
      </h1>

      {filter ? <div className="bg-slate-100 dark:bg-slate-600 flex flex-col p-2 rounded-2xl font-semibold gap-2">
        <div className="pb-2">
          <div className="flex flex-row font-semibold float-right">
            <ExclusiveButton type={filter} value={false} setter={setFilter}>
              Hide filters
            </ExclusiveButton>
          </div>
          <div>
            Rarity filter
          </div>
          <div className="flex flex-row flex-wrap gap-2 pt-2">
            <ExclusiveButton type={starFilter} value={0} setter={setStarFilter}>
              All
            </ExclusiveButton>
            <ExclusiveButton type={starFilter} value={5} setter={setStarFilter}>
              5★ Only
            </ExclusiveButton>
            <ExclusiveButton type={starFilter} value={4} setter={setStarFilter}>
              4★ Only
            </ExclusiveButton>
          </div>
        </div>

        <div className="py-1">
          <div className="flex flex-row gap-4">
            Element filter
            <ToggleAllButton type={elementFilter} value={defaultElements} setter={setElementFilter}>
              All
            </ToggleAllButton>
          </div>
          <div className="flex flex-row flex-wrap gap-2 pt-2">
            {defaultElements.map(e => (
              <ToggleButton key={e} type={elementFilter} value={e} setter={setElementFilter}>
                <div className="w-4 inline-block pr-1">
                  <Image src={elements[e]} alt={`${e} Element`} />
                </div>
                {e}
              </ToggleButton>
            ))}
          </div>
        </div>

        <div className="py-1">
          <div className="flex flex-row gap-4 pt-2">
            Weapon filter
            <ToggleAllButton type={weaponFilter} value={defaultWeapons} setter={setWeaponFilter}>
              All
            </ToggleAllButton>
          </div>
          <div className="flex flex-row flex-wrap gap-2 pt-2">
            {defaultWeapons.map(e => (
              <ToggleButton key={e} type={weaponFilter} value={e} setter={setWeaponFilter}>
                <div className="w-4 inline-block pr-1">
                  <Image src={weapons[e]} alt={e} />
                </div>
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
        {props.characters
          .filter(c => starFilter == 0 || starFilter == c.stars)
          .filter(c => elementFilter.some(e => c.element?.includes(e)) || c.element == undefined)
          .filter(c => weaponFilter.some(e => c.weapon?.includes(e)) || c.weapon == undefined)
          .map(char => <SmallIcon key={char.name} thing={char} location={props.location} />)}
      </div>
    </Main>
  )
}


export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> {
  const data = await getCharacters()

  if (!data) {
    return {
      notFound: true,
      revalidate: 5 * 60
    }
  }

  return {
    props: {
      characters: Object
        .values(data)
        .sort((a, b) => {
          if (isFullCharacter(a) && isFullCharacter(b))
            return b.releasedOn.localeCompare(a.releasedOn) || b.star - a.star || a.name.localeCompare(b.name)
          else if (!isFullCharacter(b))
            return 1
          else if (!isFullCharacter(a))
            return -1
          else return a.name.localeCompare(b.name)
        })
        .map(c => createSmallChar(c))
    },
    revalidate: 60 * 60
  }
}
