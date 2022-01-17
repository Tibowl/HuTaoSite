import { image, urlify } from "../utils/utils"
import FormattedLink from "./FormattedLink"

/* eslint-disable @next/next/no-img-element */
export function MaterialImage({ name }: { name: string }) {
  return <FormattedLink className="inline-block pr-1 w-6 h-6 md:h-8 md:w-8" href={`/materials/${urlify(name, false)}`}>
    <img src={image("material", name)} alt={name} width={256} height={256} />
  </FormattedLink>
}

export function MaterialCost({ name, count }: { name: string, count: number }) {
  return <div className="flex flex-row align-middle items-center">
    <div>{count}&times;</div>
    <FormattedLink href={`/materials/${urlify(name, false)}`} className="flex flex-row align-middle items-center">
      <div className="pr-1 w-8 h-8 sm:h-6 sm:w-6 md:h-8 md:w-8">
        <img src={image("material", name)} alt={name} width={256} height={256} />
      </div>
      <div className="md:text-sm lg:text-base sm:not-sr-only sr-only text-xs font-normal">{name}</div>
    </FormattedLink>
  </div>
}
