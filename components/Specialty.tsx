import { SmallChar, SmallMaterial } from "../utils/types"
import { SmallIcon } from "./Icon"

export interface SpecialtyItem {
    special: SmallMaterial,
    char: SmallChar,
    recipe: SmallMaterial
}

export function Specialty({ specialty, location }: { specialty: SpecialtyItem, location: string }) {
    return <div className="flex flex-wrap justify-start text-center items-center mt-2 gap-1">
        <SmallIcon thing={specialty.special} location={location} sizeSet="s">{specialty.special.name}</SmallIcon>
        <div>can be obtained by using</div>
        <SmallIcon thing={specialty.char} location={location} sizeSet="s">{specialty.char.name}</SmallIcon>
        <div>while cooking</div>
        <SmallIcon thing={specialty.recipe} location={location} sizeSet="s">{specialty.recipe.name}</SmallIcon>
    </div>
}
