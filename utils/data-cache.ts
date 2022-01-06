import { Guide } from "./types"

const baseURL = "https://raw.githubusercontent.com/Tibowl/HuTao/master/src/data"

interface Cache {
    guides: Cacher<Guide[]>
}
interface Cacher<T> {
    data?: Promise<T | undefined>
    time: number
}

const cached: Cache = {
    guides: {
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

export async function getGuides(): Promise<Guide[] | undefined> {
    if (cached.guides.time > Date.now() - 60 * 1000)
        return await cached.guides.data

    if (cached.guides.data && cached.guides.time > Date.now() - 15 * 60 * 1000)
        return await cached.guides.data

    cached.guides.data = fetchGuides()
    cached.guides.time = Date.now()
    return await cached.guides.data
}

async function fetchGuides(): Promise<Guide[] | undefined> {
    console.log(`[${new Date().toISOString()}] Fetching guides `)
    const res = await fetch(`${baseURL}/guides.json`)
    const data = await res.json()

    if (!data) return undefined

    return data as Guide[]
}
