import { Character, Guide } from "./types"

const baseURL = "https://raw.githubusercontent.com/Tibowl/HuTao/master/src/data"

type Guides = Guide[]
type Characters = Record<string, Character>

type Cache = {
    guides: Cacher<Guides>
    character: Cacher<Characters>
}

interface Cacher<T> {
    data?: Promise<T | undefined>
    time: number
}

const cached: Cache = {
    guides: {
        time: 0
    },
     character: {
         time: 0
     }
}
export function urlify(input: string, shouldYeetBrackets: boolean): string {
    if (shouldYeetBrackets)
        input = yeetBrackets(input)
    return input.toLowerCase().replace(/\(|\)|:/g, "").trim().replace(/ +/g, "-")
}

export function yeetBrackets(input: string) {
    return input.replace(/\(.*\)/g, "").replace(/ +:/, ":")
}

export const getGuides: (() => Promise<Guides | undefined>) = createGetCacheable("guides")
export const getCharacters: (() => Promise<Characters | undefined>) = createGetCacheable("character", "gamedata/characters")


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
