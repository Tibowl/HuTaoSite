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

// Reminders
export interface Reminder {
  id: number
  subject: string
  user: string
  timestamp: number
  duration: number
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
        enemy?:     string[]
        character?: string[]
    }
}
