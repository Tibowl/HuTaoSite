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
import { CostTemplates, getGuides } from "./data-cache"
import { Artifact, Character, CharacterFull, Cost, CostTemplate, CurveEnum, Enemy, Guide, GuidePage, SmallArtifact, SmallChar, SmallEnemy, SmallWeapon, TalentTable, TalentValue, Weapon, WeaponCurveName, WeaponType } from "./types"

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

export function getDate(timestamp: string, timezone = "+08:00"): Date {
    timestamp = timestamp.replace(" ", "T")
    if (!timestamp.includes("T")) timestamp += "T23:59:59"
    return new Date(`${timestamp}${timezone}`)
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

export function isInCosts(template: CostTemplate | Cost[], costTemplates: CostTemplates, name: string): boolean {
    const costs = Array.isArray(template) ? template : getCostsFromTemplate(template, costTemplates)

    for (const c of costs)
        if (c.items.some(i => i.name == name))
            return true

    return false
}


export function image(type: string, name: string, ext = "png"): string {
    return `/img/${type}/${name.replace(/[:\-,'"]/g, "").replace(/ +/g, "_")}.${ext}`
}

export function getIconPath(icon?: string) {
    return (icon?.startsWith("img/") ? ("/" + icon) : icon) ?? "/img/unknown.png"
}

export function getCostsFromTemplate(costTemplate: CostTemplate, costTemplates: Record<string, Cost[]>): Cost[] {
    const template = costTemplates[costTemplate.template]

    return template.map(c => ({
        mora: c.mora,
        items: c.items.map(i => ({
            count: i.count,
            name: i.name.replace(/<(.*?)>/g, (_, x) => costTemplate.mapping[x])
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
    return input.toLowerCase().replace(/[():"'-]/g, "").trim().replace(/ +/g, "-")
}

export function removeBrackets(input: string) {
    return input.replace(/\(.*\)/g, "").replace(/ +:/, ":")
}

export function clean(input: string) {
    return input.replace(/ ?\$\{.*?\}/g, "").replace(/ ?\(.*?\)/g, "").replace(/[*[\]]/g, "").split("\n")[0]
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

export function createSmallEnemy(enemy: Enemy): SmallEnemy {
    const e: SmallEnemy = { name: enemy.name, urlpath: "enemies" }
    if (enemy.kind) e.kind = enemy.kind
    if (enemy.type) e.type = enemy.type
    if (enemy.icon) e.icon = enemy.icon
    return e
}

export function joinMulti(input: string[]): string {
    if (input.length <= 1) return input[0]

    const last = input[input.length - 1]
    return `${input.slice(0, -1).join(", ")} and ${last}`
}

export async function send(api: string, object: unknown) {
    return await fetch(api, {
        body: JSON.stringify(object),
        headers: { "Content-Type": "application/json" },
        method: "POST"
    })
}

const minutes_per_resin = 8
export function parseDuration(time: string): number {
    let duration = 0
    const times = [...time.matchAll(/((\d+) ?(months?|mo|weeks?|w|days?|d|hours?|h|minutes?|min|m|seconds?|sec|s|resins?|r))/gi)]

    for (const time of times) {
        const name = time[3].toLowerCase(), amount = parseInt(time[2])
        if (name.startsWith("mo")) duration += amount * 30 * 24 * 60 * 60 * 1000
        else if (name.startsWith("w")) duration += amount * 7 * 24 * 60 * 60 * 1000
        else if (name.startsWith("d")) duration += amount * 24 * 60 * 60 * 1000
        else if (name.startsWith("h")) duration += amount * 60 * 60 * 1000
        else if (name.startsWith("m")) duration += amount * 60 * 1000
        else if (name.startsWith("s")) duration += amount * 1000
        else if (name.startsWith("r")) duration += amount * minutes_per_resin * 60 * 1000
    }

    return duration
}

export function timeLeft(diff: number, full = false, short = true): string {
    const ago = diff < 0
    if (ago) diff = -diff

    const result = [], originalTime = diff / 1000

    diff /= 1000 // convert to s
    if (diff >= 24 * 60 * 60) {
        const days = Math.floor(diff / 24 / 60 / 60)
        result.push(days + (short ? "d" : (days == 1 ? " day" : " days")))
        diff -= days * 24 * 60 * 60
    }

    if (diff >= 60 * 60) {
        const hours = Math.floor(diff / 60 / 60)
        result.push(hours + (short ? "h" : (hours == 1 ? " hour" : " hours")))
        diff -= hours * 60 * 60
    }

    if (diff >= 60 && (originalTime < 24 * 60 * 60 || full)) {
        const minutes = Math.floor(diff / 60)
        result.push(minutes + (short ? "m" : (minutes == 1 ? " minute" : " minutes")))
        diff -= minutes * 60
    }

    if (diff > 0 && (originalTime < 60 * 60 || full)) {
        const seconds = Math.floor(diff)
        result.push(seconds + (short ? "s" : (seconds == 1 ? " second" : " seconds")))
    }

    return (ago ? `${result.join(", ")} ago` : `in ${result.join(", ")}`)
}

export function formatTime(date: Date) {
    return date.toLocaleString(undefined, { day: "numeric", year: "numeric", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" })
}
