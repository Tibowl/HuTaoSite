import { GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import Image from "next/image"
import { useState } from "react"
import { ExclusiveButton, ToggleAllButton, ToggleButton } from "../../components/Filters"
import FormattedLink from "../../components/FormattedLink"
import Icon from "../../components/Icon"
import Main from "../../components/Main"
import { getCharacters } from "../../utils/data-cache"
import { WeaponType } from "../../utils/types"
import { elements, ElementType, getStarColor, isFullCharacter, urlify, weapons } from "../../utils/utils"


interface SmallChar {
  name: string
  stars?: number
  element?: ElementType[]
  weapon?: WeaponType
  icon?: string
}

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
        <meta property="og:description" content="View information about different Genshin Impact characters!" />
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
          .map(char => {
            const color = getStarColor(char.stars ?? 0)

            return <FormattedLink key={char.name} location={props.location} href={`/characters/${urlify(char.name, false)}`} className="bg-slate-300 dark:bg-slate-800 w-24 sm:w-28 lg:w-32 m-1 relative rounded-xl transition-all duration-100 hover:outline outline-slate-800 dark:outline-slate-300 font-bold text-sm" >
              <div className={`${color} rounded-t-xl h-24 sm:h-28 lg:h-32`}>
                <Icon icon={char} className="rounded-t-xl m-0 p-0" />
                <span className="absolute block p-0.5 top-0 w-full">
                  <div className="flex flex-col">
                    {char.element && char.element.map(e => <div key={e} className="w-6 md:w-8">
                      <Image src={elements[e]} alt={`${e} Element`} loading="eager" />
                    </div>)}
                  </div>
                </span>
                <span className="absolute block p-0.5 top-0 w-full">
                  <div className="flex flex-col float-right">
                    {char.weapon && <div className="w-6 md:w-8">
                      <Image src={weapons[char.weapon]} alt={char.weapon} loading="eager" />
                    </div>}
                  </div>
                </span>
              </div>
              <span className="flex justify-center items-center h-10 md:h-12 m-0 p-0 duration-200 md:text-base">
                {char.name}
              </span>
            </FormattedLink>
          })}
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
        .map(c => {
          const char: SmallChar = { name: c.name }
          if (c.star) char.stars = c.star
          if (c.meta.element) char.element = [c.meta.element as ElementType]
          if (c.skills) char.element = c.skills.map(skill => skill.ult?.type).filter(x => x) as ElementType[]
          if (c.weaponType) char.weapon = c.weaponType
          if (c.icon) char.icon = c.icon
          return char
        })
    },
    revalidate: 60 * 60
  }
}
