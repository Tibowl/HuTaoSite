import { ElementType } from "./utils"

export interface DiscordUser {
  id:            string
  username:      string
  avatar:        string
  discriminator: string
  public_flags:  number
  flags:         number
  locale:        string
  mfa_enabled:   boolean
  premium_type:  number
}

// Events
export interface Event {
    name:          string
    type:          EventType
    prediction?:   boolean
    link?:         string
    img?:          string
    start?:        string
    start_server?: boolean
    end?:          string
    end_server?:   boolean
    timezone?:     string
    reminder?:     EventReminderType
    remindtime?:   string
}

export enum EventType {
    Web = "Web",
    Quiz = "Quiz",
    InGame = "In-game",
    Maintenance = "Maintenance",
    Stream = "Stream",
    Unlock = "Unlock",
    Banner = "Banner"
}
export enum EventReminderType {
    Daily = "daily",
    End = "end"
}


// Reminders
export interface Reminder {
  id: number
  subject: string
  user: string
  timestamp: number
  duration: number
}

// Artifacts
export interface Artifact {
    name:    string
    levels?:  number[]
    bonuses?: Bonus[]
    artis?:   Arti[]
}

export interface Arti {
    type: ArtifactType
    name: string
    desc: string
    icon: string
}

export enum ArtifactType {
    Flower = "Flower",
    Plume = "Plume",
    Sands = "Sands",
    Goblet = "Goblet",
    Circlet = "Circlet",
}

export interface Bonus {
    count: number
    desc:  string
}

// Character
export type Character = CharacterFull | CharacterPlaceholder
export interface CharacterPlaceholder {
    name:            string
    desc:            string
    star?:           number
    weaponType?:     WeaponType
    icon?:           string
    media:           Media
    meta:            Meta
    skills?:         Skills[]
    ascensionCosts?: CostTemplate
}
export type CharacterFull = Required<CharacterPlaceholder> & {
    releasedOn:     string
    icon:           string
    baseStats:      CharacterBaseStats
    curves:         CurveElement[]
    ascensions:     CharacterAscension[]
}

export interface Media {
    videos?: Record<string, string>
    imgs?:   string[]
}

export interface CharacterBaseStats {
    hpBase:          number
    attackBase:      number
    defenseBase:     number
    criticalBase:    number
    criticalDmgBase: number
}

export interface CharacterAscension {
    level:    number
    maxLevel: number
    statsUp:  StatsUp[]
}

export interface Cost {
    items: Item[]
    mora?: number
}

export interface CostTemplate {
    template: string
    mapping: Record<string, string>
}

export interface Item {
    count: number
    name:  string
}

export interface StatsUp {
    stat:  StatsName
    value: number
}

export enum StatsName {
    AnemoDMGBonus = "Anemo DMG Bonus",
    Atk = "ATK%",
    BaseATK = "Base ATK",
    BaseDEF = "Base DEF",
    BaseHP = "Base HP",
    CritRate = "CRIT Rate",
    CritDmg = "CRIT DMG",
    CryoDMGBonus = "Cryo DMG Bonus",
    Def = "DEF%",
    ElectroDMGBonus = "Electro DMG Bonus",
    ElementalMastery = "Elemental Mastery",
    EnergyRecharge = "Energy Recharge",
    GeoDMGBonus = "Geo DMG Bonus",
    HP = "HP%",
    HealingBonus = "Healing Bonus",
    HydroDMGBonus = "Hydro DMG Bonus",
    PhysicalDMGBonus = "Physical DMG Bonus",
    PyroDMGBonus = "Pyro DMG Bonus",
}

export interface CurveElement {
    name:  StatsName
    curve: CurveEnum
}

export enum CurveEnum {
    RegularAtk4 = "Regular atk 4*",
    RegularAtk5 = "Regular atk 5*",
    RegularHpdef4 = "Regular hpdef 4*",
    RegularHpdef5 = "Regular hpdef 5*",
}

export interface Meta {
    birthMonth?:    number
    birthDay?:      number
    association?:   Association
    title:          string
    detail:         string
    affiliation?:   string
    element:        string
    constellation?: string
    cvChinese?:     string
    cvJapanese?:    string
    cvEnglish?:     string
    cvKorean?:      string
}

export enum Association {
    Fatui = "Fatui",
    Liyue = "Liyue",
    Mc = "MC",
    Mondstadt = "Mondstadt",
}

export interface Skills {
    talents?:        Skill[]
    ult?:            Skill
    passive?:        Passive[]
    constellations?: Constellation[]
}

export interface Constellation {
    name: string
    desc: string
    icon: string
}

export interface Passive {
    name:          string
    desc:          string
    minAscension?: number
    icon?:         string
}

export interface Skill {
    name:         string
    desc:         string
    charges?:     number
    talentTable?: (TalentTable | TalentValue)[]
    costs?:       CostTemplate
    type?:        string
    video?:       string
    videomp4?:    string
    icon?:        string
}

export interface TalentTable {
    name:   string
    values: string[]
}
export interface TalentValue {
    name:   string
    value:  string
}

export enum WeaponType {
    Bow = "Bow",
    Catalyst = "Catalyst",
    Claymore = "Claymore",
    Polearm = "Polearm",
    Sword = "Sword",
}

export interface Weapon {
    name:              string
    desc:              string
    placeholder?:      false
    placeholderStats?: PlaceHolderStats
    weaponType:        WeaponType
    stars:             number
    weaponCurve?:      WeaponCurve[]
    icon:              string
    awakenIcon?:       string
    ascensions?:       WeaponAscension[]
    ascensionCosts?:   CostTemplate
    lore?:             string
    refinements?:      Refinement[]
}

export interface WeaponAscension {
    level:    number
    maxLevel: number
    statsUp:  StatsUp[]
}

export interface Refinement {
    name: string
    desc: string
}

export interface WeaponCurve {
    stat: StatsName
    init: number
    curve: WeaponCurveName
}

export enum WeaponCurveName {
    Atk11 = "ATK 1.1",
    Atk12 = "ATK 1.2",
    Atk14 = "ATK 1.4",
    Atk21 = "ATK 2.1",
    Atk22 = "ATK 2.2",
    Atk23 = "ATK 2.3",
    Atk24 = "ATK 2.4",
    Atk31 = "ATK 3.1",
    Atk32 = "ATK 3.2",
    Atk34 = "ATK 3.4",
    C1 = "C1",
    C2 = "C2",
    C3 = "C3",
}


export interface PlaceHolderStats {
    level: number
    stats: Partial<Record<StatsName, number>>
}

export interface Enemy {
    name:         string
    placeholder?: true
    icon?:        string
    type?:        string
    kind?:        string
    desc?:        string
    notes?:       string
    resistance?:  string[][]
}

export interface Material {
    name:       string
    desc?:      string
    longDesc?:  string
    stars?:     number
    type?:      string
    category?:  string
    icon?:      string
    sources?:   string[]
    specialty?: { char: string, recipe: string }
    recipe?:    Item[]
    effect?:    string | Record<string, string>
}


// Guides
export interface Guide {
    name:  string
    pages: GuidePage[]
}
export interface GuidePage {
    name:    string
    img?:    string
    desc?:   string
    url?:    string
    credits: string
    links?:  {
        material?:  string[]
        weapon?:    string[]
        artifact?:  string[]
        enemy?:     string[]
        character?: string[]
    }
}

export interface SmallThing {
    name: string
    icon?: string
    stars?: number
    urlpath: unknown
}

export interface SmallChar extends SmallThing {
    element?: ElementType[]
    weapon?: WeaponType
    urlpath: "characters"
}

export interface SmallWeapon extends SmallThing {
    weapon?: WeaponType
    urlpath: "weapons"
}

export interface SmallArtifact extends SmallThing {
    urlpath: "artifacts"
}

export interface SmallEnemy extends SmallThing {
    type?: string
    kind?: string
    urlpath: "enemies"
}

export interface SmallMaterial extends SmallThing {
    urlpath: "materials"
}
