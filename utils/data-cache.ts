import { Character, Cost, CurveEnum, Guide, Material } from "./types"

const baseURL = "https://raw.githubusercontent.com/Tibowl/HuTao/master/src/data"

type Guides = Guide[]
type Characters = Record<string, Character>
export type CharacterCurves = Record<CurveEnum, number[]>
type CharacterLevels = number[]
export type CostTemplates = Record<string, Cost[]>
type Materials = Record<string, Material>

type Cache = {
    guides: Cacher<Guides>
    characters: Cacher<Characters>
    characterCurves: Cacher<CharacterCurves>
    characterLevels: Cacher<CharacterLevels>
    costTemplates: Cacher<CostTemplates>
    materials: Cacher<Materials>
}

interface Cacher<T> {
    data?: Promise<T | undefined>
    time: number
}

const cached: Cache = {
    guides: {
        time: 0
    },
    characters: {
        time: 0
    },
    characterCurves: {
        time: 0
    },
    characterLevels: {
        time: 0
    },
    costTemplates: {
        time: 0
    },
    materials: {
        time: 0
    }
}

export const getGuides: (() => Promise<Guides | undefined>) = createGetCacheable("guides")
export const getCostTemplates: (() => Promise<CostTemplates | undefined>) = createGetCacheable("costTemplates", "gamedata/cost_templates")

export const getCharacters: (() => Promise<Characters | undefined>) = createGetCacheable("characters", "gamedata/characters")
export const getCharacterCurves: (() => Promise<CharacterCurves | undefined>) = createGetCacheable("characterCurves", "gamedata/character_curves")
export const getCharacterLevels: (() => Promise<CharacterLevels | undefined>) = createGetCacheable("characterLevels", "gamedata/character_levels")

export const getMaterials: (() => Promise<Materials | undefined>) = createGetCacheable("materials", "gamedata/materials")


function createGetCacheable(name: keyof Cache, path: string = name): () => Promise<any> {
    async function fetchNew(): Promise<any> {
        console.log(`[${new Date().toISOString()}] Fetching ${name}`)
        const res = await fetch(`${baseURL}/${path}.json`)
        const data = await res.json()

        if (!data) return undefined

        return data
    }

    return async () => {
            if (cached[name].time > Date.now() - 60 * 1000)
            return await cached[name].data

        if (cached[name].data && cached[name].time > Date.now() - 15 * 60 * 1000)
            return await cached[name].data

        cached[name].data = fetchNew()
        cached[name].time = Date.now()

        return await cached[name].data
    }
}
