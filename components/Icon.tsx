/* eslint-disable @next/next/no-img-element */
import Image from "next/image"
import { SmallChar } from "../utils/types"
import { elements, getStarColor, image, urlify, weapons } from "../utils/utils"
import FormattedLink from "./FormattedLink"

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


export function CharIcon({ char, location }: { char: SmallChar, location: string }) {
  const color = getStarColor(char.stars ?? 0)

  return <FormattedLink key={char.name} location={location} href={`/characters/${urlify(char.name, false)}`} className="bg-slate-300 dark:bg-slate-800 w-24 sm:w-28 lg:w-32 m-1 relative rounded-xl transition-all duration-100 hover:outline outline-slate-800 dark:outline-slate-300 font-bold text-sm" >
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
}
