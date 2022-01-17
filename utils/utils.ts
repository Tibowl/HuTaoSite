import Anemo from "../public/img/element/Anemo.png"
import Cryo from "../public/img/element/Cryo.png"
import Dendro from "../public/img/element/Dendro.png"
import Electro from "../public/img/element/Electro.png"
import Geo from "../public/img/element/Geo.png"
import Hydro from "../public/img/element/Hydro.png"
import Pyro from "../public/img/element/Pyro.png"
import Bow from "../public/img/weapon_types/Bow.png"
import Catalyst from "../public/img/weapon_types/Catalyst.png"
import Claymore from "../public/img/weapon_types/Claymore.png"
import Polearm from "../public/img/weapon_types/Polearm.png"
import Sword from "../public/img/weapon_types/Sword.png"
import { getGuides } from "./data-cache"
import { Artifact, Character, CharacterFull, Cost, CostTemplate, CurveEnum, Guide, GuidePage, SmallArtifact, SmallChar, SmallWeapon, TalentTable, TalentValue, Weapon, WeaponCurveName, WeaponType } from "./types"

export const elements = {
    Pyro, Electro, Cryo, Hydro, Anemo, Geo, Dendro
}
export const weapons: Record<WeaponType, StaticImageData> = {
    Polearm, Sword, Claymore, Bow, Catalyst
}

export type ElementType = (keyof (typeof elements))

export function isFullCharacter(char: Character): char is CharacterFull {
    return typeof (char as CharacterFull).releasedOn == "string"
}


export function getCharStatsAt(char: CharacterFull, level: number, ascension: number, characterCurves: Record<CurveEnum, number[]>): Record<string, number> {
    const stats: Record<string, number> = {
        "Base HP": char.baseStats.hpBase,
        "Base ATK": char.baseStats.attackBase,
        "Base DEF": char.baseStats.defenseBase,
        "CRIT Rate": char.baseStats.criticalBase,
        "CRIT DMG": char.baseStats.criticalDmgBase,
    }

    for (const curve of char.curves) {
        stats[curve.name] = stats[curve.name] * characterCurves[curve.curve][level - 1]
    }

    const asc = char.ascensions.find(a => a.level == ascension)

    for (const statup of asc?.statsUp ?? []) {
        stats[statup.stat] = (stats[statup.stat] ?? 0) + statup.value
    }

    return stats
}

export function getWeaponStatsAt(weapon: Weapon, level: number, ascension: number, weaponCurves: Record<WeaponCurveName, number[]>): Record<string, number> {
    const stats: Record<string, number> = {}

    for (const curve of weapon.weaponCurve ?? []) {
        stats[curve.stat] = curve.init * weaponCurves[curve.curve][level - 1]
    }

    const asc = (weapon.ascensions ?? []).find(a => a.level == ascension)

    for (const statup of asc?.statsUp ?? []) {
        stats[statup.stat] = (stats[statup.stat] ?? 0) + statup.value
    }

    return stats
}

export function stat(name: string, value: number): string {
    switch (name) {
        case "HP%":
        case "DEF%":
        case "ATK%":
        case "Anemo DMG Bonus":
        case "Cryo DMG Bonus":
        case "Dendro DMG Bonus":
        case "Electro DMG Bonus":
        case "Geo DMG Bonus":
        case "Hydro DMG Bonus":
        case "Physical DMG Bonus":
        case "Pyro DMG Bonus":
        case "Healing Bonus":
        case "Energy Recharge":
        case "CRIT Rate":
        case "CRIT DMG":
            return (value * 100).toFixed(1) + "%"

        case "HP":
        case "ATK":
        case "DEF":
        case "Base HP":
        case "Base ATK":
        case "Base DEF":
        case "Elemental Mastery":
            return value.toFixed(0)

        default:
            console.error(`Unknown stat '${name}', defaulting to formatting by value`)
            return value < 2 ? ((value * 100).toFixed(1) + "%") : value.toFixed(0)
    }
}

export function image(type: string, name: string, ext="png"): string {
    return `/img/${type}/${name.replace(/[:\-,'"]/g, "").replace(/ +/g, "_")}.${ext}`
}

export function getCostsFromTemplate(costTemplate: CostTemplate, costTemplates: Record<string, Cost[]>): Cost[] {
    const template = costTemplates[costTemplate.template]

    return template.map(c => ({
        mora: c.mora,
        items: c.items.map(i => ({
            count: i.count,
            name:  i.name.replace(/<(.*?)>/g, (_, x) => costTemplate.mapping[x])
        }))
    }))
}

export async function getGuidesFor(type: "enemy" | "character" | "material" | "weapon" | "artifact", name: string): Promise<{ guide: Guide, page: GuidePage }[]> {
    return (await getGuides())?.flatMap(guide => guide.pages
            .filter(page => page.links?.[type]?.includes(name))
            .map(page => ({
                guide, page
            }))
        ) ?? []
}

export function isValueTable(talent: TalentTable | TalentValue): talent is TalentTable {
    return (talent as TalentTable).values != undefined
}

export function getLinkToGuide(guide: Guide, page: GuidePage): string {
    return `/guides/${urlify(guide.name, false)}/${urlify(page.name, true)}`
}

export function urlify(input: string, shouldRemoveBrackets: boolean): string {
    if (shouldRemoveBrackets)
        input = removeBrackets(input)
    return input.toLowerCase().replace(/[():"']/g, "").trim().replace(/ +/g, "-")
}

export function removeBrackets(input: string) {
    return input.replace(/\(.*\)/g, "").replace(/ +:/, ":")
}

export function getStarColor(star: number): string {
    if (star == 5) return "fivestar"
    if (star == 4) return "fourstar"
    if (star == 3) return "threestar"
    if (star == 2) return "twostar"
    if (star == 1) return "onestar"
    return ""
}

export function createSmallChar(char: Character): SmallChar {
    const c: SmallChar = { name: char.name, urlpath: "characters" }
    if (char.star) c.stars = char.star
    if (char.meta.element) c.element = [char.meta.element as ElementType]
    if (char.skills) c.element = char.skills.map(skill => skill.ult?.type).filter(x => x) as ElementType[]
    if (char.weaponType) c.weapon = char.weaponType
    if (char.icon) c.icon = char.icon
    return c
}

export function createSmallWeapon(weapon: Weapon): SmallWeapon {
    const w: SmallWeapon = { name: weapon.name, urlpath: "weapons" }
    if (weapon.stars) w.stars = weapon.stars
    if (weapon.weaponType) w.weapon = weapon.weaponType
    if (weapon.icon) w.icon = weapon.icon
    return w
}

export function createSmallArtifact(arti: Artifact): SmallArtifact {
    const a: SmallArtifact = { name: arti.name, urlpath: "artifacts" }
    if (arti.levels) a.stars = Math.max(...arti.levels)
    if (arti.artis?.[0]?.icon) a.icon = arti.artis[0].icon
    return a
}

export function joinMulti(input: string[]): string {
    if (input.length == 0) return input[0]

    const last = input[input.length-1]
    return `${input.slice(0, -1).join(", ")} and ${last}`
}
