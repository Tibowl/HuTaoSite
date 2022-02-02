import { GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import Image from "next/image"
import { useState } from "react"
import { ExclusiveButton, ToggleAllButton, ToggleButton } from "../../components/Filters"
import { SmallIcon } from "../../components/Icon"
import Main from "../../components/Main"
import { getWeapons } from "../../utils/data-cache"
import { SmallWeapon, WeaponType } from "../../utils/types"
import { createSmallWeapon, weapons } from "../../utils/utils"


interface Props {
  weapons: SmallWeapon[]
}

const defaultWeapons: WeaponType[] = Object.keys(weapons) as WeaponType[]

export default function Weapons(props: Props & { location: string }) {
  const [filter, setFilter] = useState(false)

  const [starFilter, setStarFilter] = useState(0)
  const [weaponFilter, setWeaponFilter] = useState(defaultWeapons)

  const desc = `View stats, refinements and description of the ${props.weapons.length} different weapons in Genshin Impact.`
  return (
    <Main>
      <Head>
        <title>Weapons | Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Weapons | Hu Tao" />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
      </Head>

      <h1 className="text-5xl font-bold pb-2">
        Weapons
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
            <ExclusiveButton type={starFilter} value={3} setter={setStarFilter}>
              3★ Only
            </ExclusiveButton>
            <ExclusiveButton type={starFilter} value={2} setter={setStarFilter}>
              2★ Only
            </ExclusiveButton>
            <ExclusiveButton type={starFilter} value={1} setter={setStarFilter}>
              1★ Only
            </ExclusiveButton>
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
        {props.weapons
          .filter(w => starFilter == 0 || starFilter == w.stars)
          .filter(w => weaponFilter.some(e => w.weapon?.includes(e)) || w.weapon == undefined)
          .map(weapon => <SmallIcon key={weapon.name} thing={weapon} location={props.location} />)}
      </div>
    </Main>
  )
}


export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> {
  const data = await getWeapons()

  if (!data) {
    return {
      notFound: true,
      revalidate: 15 * 60
    }
  }

  return {
    props: {
      weapons: Object
        .values(data)
        .sort((a, b) => b.stars - a.stars || a.weaponType.localeCompare(b.weaponType) || a.name.localeCompare(b.name))
        .map(w => createSmallWeapon(w))
    },
    revalidate: 60 * 60 * 2
  }
}
