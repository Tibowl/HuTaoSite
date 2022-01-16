import { Dispatch, SetStateAction } from "react"

export
    function ExclusiveButton<T>({ type, value, setter, children }: { type: T, value: T, setter: Dispatch<SetStateAction<T>>, children: any }) {
    return <div
        onClick={() => setter(value)}
        className={`${type == value ? "bg-slate-400 dark:bg-slate-700 outline-slate-400 outline" : "bg-slate-300 dark:bg-slate-800"} px-2 py-0.5 rounded-lg cursor-pointer selection:bg-transparent`}
    >
        {children}
    </div>
}

export function ToggleAllButton<T>({ type, value, setter, children }: { type: T[], value: T[], setter: Dispatch<SetStateAction<T[]>>, children: any }) {
    const equal = type.length == value.length && type.every(e => value.includes(e))

    return <div
        onClick={() => equal ? setter([]) : setter(value)}
        className={`${equal ? "bg-slate-400 dark:bg-slate-700 outline-slate-400 outline" : "bg-slate-300 dark:bg-slate-800"} px-2 py-0.5 rounded-lg cursor-pointer selection:bg-transparent`}
    >
        {children}
    </div>
}

export function ToggleButton<T>({ type, value, setter, children }: { type: T[], value: T, setter: Dispatch<SetStateAction<T[]>>, children: any }) {
    const has = type.includes(value)
    return <div
        onClick={() => {
            if (has) setter(type.filter(x => x != value))
            else setter([value, ...type])
        }}
        className={`${has ? "bg-slate-400 dark:bg-slate-700 outline-slate-400 outline" : "bg-slate-300 dark:bg-slate-800"
            } px-2 py-0.5 rounded-lg cursor-pointer selection:bg-transparent`}
    >
        {children}
    </div>
}
