/* eslint-disable @next/next/no-img-element */
import Image from "next/image"
import { SmallArtifact, SmallChar, SmallEnemy, SmallThing, SmallWeapon } from "../utils/types"
import { elements, getStarColor, image, urlify, weapons } from "../utils/utils"
import FormattedLink from "./FormattedLink"
import styles from "../pages/style.module.css"

export default function Icon({ icon, className, loading = "lazy" }: { icon: { name: string, icon?: string }, className?: string, loading?: "eager" | "lazy" }) {
  const src = (icon.icon?.startsWith("img/") ? ("/" + icon.icon) : icon.icon) ?? "img/unknown.png"

  // if (src.startsWith("img"))
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={icon.name} loading={loading} src={src} className={className} width={256} height={256} onError={(e) => (e.target as HTMLImageElement).src = "/img/unknown.png"} />

  // return <Image alt={icon.name} loading={loading} src={src} className={className} width={256} height={256} onError={(e) => (e.target as HTMLImageElement).src = "/img/unknown.png"} />
}

export function IconName({ name, type, urltype, loading = "lazy" }: { name: string, type: string, urltype: string, loading: "eager" | "lazy" }) {
  return <FormattedLink href={`/${urltype}/${urlify(name, false)}`} className="flex flex-row align-middle items-center">
    <div className="pr-1 w-12 h-12 md:h-16 md:w-16">
      <img src={image(type, name)} loading={loading} alt={name} width={256} height={256} />
    </div>
    <div className="font-semibold md:text-xl">{name}</div>
  </FormattedLink>
}

export function SmallIcon({ thing, location }: { thing: SmallThing, location: string }) {
  const color = getStarColor((hasStars(thing) ? thing.stars : 0) ?? 0)

  return <FormattedLink key={thing.name} location={location} href={`/${thing.urlpath}/${urlify(thing.name, false)}`} className="bg-slate-300 dark:bg-slate-800 w-24 sm:w-28 lg:w-32 m-1 relative rounded-xl transition-all duration-100 hover:outline outline-slate-800 dark:outline-slate-300 font-bold text-sm" >
    <div className={`${color} rounded-t-xl h-24 sm:h-28 lg:h-32`}>
      <Icon icon={thing} className="rounded-t-xl m-0 p-0" />
      <span className="absolute block p-0.5 top-0 w-full">
        <div className="flex flex-col">
          {hasElement(thing) && thing.element && thing.element.map(e => <div key={e} className="w-6 md:w-8">
            <Image src={elements[e]} alt={`${e} Element`} loading="eager" />
          </div>)}
        </div>
      </span>
      <span className="absolute block p-0.5 top-0 w-full">
        <div className="flex flex-col float-right">
          {hasWeapon(thing) && thing.weapon && <div className="w-6 md:w-8">
            <Image src={weapons[thing.weapon]} alt={thing.weapon} loading="eager" />
          </div>}
        </div>
      </span>
    </div>
    <span className={`flex justify-center items-center m-0 p-0 px-1 ${thing.name.length > 27 ? "text-xs md:text-xs" : thing.name.length > 20 ? "text-sm md:text-sm" : ""} duration-200 md:text-base ${styles.iconHeight}`}>
      {thing.name}
    </span>
  </FormattedLink>
}

function hasElement(char: SmallThing): char is SmallChar {
  return (char as SmallChar).element != undefined
}

function hasWeapon(char: SmallThing): char is (SmallChar | SmallWeapon) {
  return (char as SmallChar).weapon != undefined
}

function hasStars(char: SmallThing): char is (SmallChar | SmallWeapon | SmallArtifact) {
  return (char as SmallChar).stars != undefined
}
