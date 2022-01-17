import { GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import { useState } from "react"
import { ExclusiveButton, ToggleAllButton, ToggleButton } from "../../components/Filters"
import FormattedLink from "../../components/FormattedLink"
import Icon from "../../components/Icon"
import Main from "../../components/Main"
import { getMaterials } from "../../utils/data-cache"
import { getStarColor, urlify } from "../../utils/utils"


interface SmallMaterial {
  name: string
  stars?: number
  icon?: string
  category?: string
  type?: string
}

interface Props {
  materials: SmallMaterial[]
}


export default function Materials(props: Props & { location: string }) {
  const [filter, setFilter] = useState(false)

  const defaultCategories = props.materials.map(m => m.category).filter((c, i, a) => c && a.indexOf(c) == i) as string[]
  const defaultTypes = [
    "Local Specialty (Mondstadt)",
    "Local Specialty (Liyue)",
    "Local Specialty (Inazuma)",
    "Material",
    "Forging Ore",
    "Cooking Ingredient",
    "Food",
    "Potion",
    "Character Level-Up Material",
    "Weapon Ascension Material",
    "Talent Level-Up Material",
    "Quest Item",
    "Adventure Item",
    "Consumable",
    "Gadget",
    ...props.materials.map(m => m.type)
  ].filter((c, i, a) => c && a.indexOf(c) == i) as string[]

  const [starFilter, setStarFilter] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState(defaultCategories)
  const [typeFilter, setTypeFilter] = useState(defaultTypes)

  return (
    <Main>
      <Head>
        <title>Materials | Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Materials | Hu Tao" />
        <meta property="og:description" content="View information about different Genshin Impact materials!" />
      </Head>

      <h1 className="text-5xl font-bold pb-2">
        Materials
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

          <div className="py-1">
            <div className="flex flex-row gap-4">
              Category filter
              <ToggleAllButton type={categoryFilter} value={defaultCategories} setter={setCategoryFilter}>
                All
              </ToggleAllButton>
            </div>
            <div className="flex flex-row flex-wrap gap-2 pt-2">
              {defaultCategories.map(e => (
                <ToggleButton key={e} type={categoryFilter} value={e} setter={setCategoryFilter}>
                  {e}
                </ToggleButton>
              ))}
            </div>
          </div>

          <div className="py-1">
            <div className="flex flex-row gap-4">
              Type filter
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
        </div>
      </div> : <div className="flex flex-row font-semibold justify-end">
        <ExclusiveButton type={filter} value={true} setter={setFilter}>
          Show filters
        </ExclusiveButton>
      </div>
      }

      <div className="flex flex-wrap justify-evenly text-center pt-2">
        {props.materials
          .filter(m => starFilter == 0 || starFilter == (m.stars ?? 1))
          .filter(m => categoryFilter.some(e => m.category?.includes(e)) || m.category == undefined)
          .filter(m => typeFilter.some(e => m.type?.includes(e)) || m.type == undefined)
          .map((mat, i) => {
            const color = getStarColor(mat.stars ?? 1)

            return <FormattedLink key={mat.name} prefetch={i < 21} location={props.location} href={`/materials/${urlify(mat.name, false)}`} className="bg-slate-300 dark:bg-slate-800 w-24 sm:w-28 lg:w-32 m-1 relative rounded-xl transition-all duration-100 hover:outline outline-slate-800 dark:outline-slate-300 text-bold text-sm" >
              <div className={`${color} rounded-t-xl h-24 sm:h-28 lg:h-32`}>
                <Icon icon={mat} loading={i < 21 ? "eager" : "lazy"} className="rounded-t-xl m-0 p-0" />
              </div>
              <div
                className={`flex justify-center items-center m-0 px-1 duration-200 md:text-base ${mat.name.length > 27 ? "text-xs md:text-xs" : mat.name.length > 20 ? "text-sm md:text-sm" : ""}`}
                style={({ minHeight: "3rem" })}
              >
                {mat.name}
              </div>
            </FormattedLink>
          })}
      </div>
    </Main>
  )
}

export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> {
  const data = await getMaterials()

  if (!data) {
    return {
      notFound: true,
      revalidate: 5 * 60
    }
  }

  return {
    props: {
      materials: Object
        .values(data)
        .map(c => {
          const char: SmallMaterial = { name: c.name }
          if (c.stars) char.stars = c.stars
          if (c.icon) char.icon = c.icon
          if (c.category) char.category = c.category
          if (c.type) char.type = c.type
          return char
        })
    },
    revalidate: 60 * 60
  }
}
