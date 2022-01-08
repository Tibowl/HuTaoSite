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
import { Character, CharacterFull, Cost, CostTemplate, CurveEnum, WeaponType } from "./types"

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
