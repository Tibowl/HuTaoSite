import Head from "next/head"
import { useEffect, useState } from "react"
import FormattedLink from "../../components/FormattedLink"
import Main from "../../components/Main"
import styles from "../style.module.css"

function pityRate(baseRate: number, pityStart: number): (pity: number) => number {
  return (pity) => pity < pityStart ? baseRate : baseRate + baseRate * 10 * (pity - pityStart + 1)
}

const gachas: Record<string, Banner> = {
  char: {
    bannerName: "5* Banner character",
    banner: 0.5,
    guaranteed: 1,
    minConst: -1,
    maxConst: 6,
    constFormat: "C",
    constName: "Constellations",
    maxPity: 90,
    rate: pityRate(0.6, 74)
  },
  "4*char": {
    bannerName: "Specific 4* banner character",
    banner: 0.5,
    guaranteed: 1 / 3,
    minConst: -1,
    maxConst: 6,
    constFormat: "C",
    constName: "Constellations",
    maxPity: 10,
    rate: pityRate(5.1, 9)
  },
  weapon: {
    bannerName: "Specific 5* banner weapon",
    banner: 0.75,
    guaranteed: 1 / 2,
    guaranteedPity: 3,
    minConst: 0,
    maxConst: 5,
    constFormat: "R",
    constName: "Refinements",
    maxPity: 80,
    rate: pityRate(0.7, 63)
  }
}


type Banner = {
  bannerName: string
  banner: number
  guaranteed: number
  guaranteedPity?: number
  minConst: number
  maxConst: number
  maxPity: number
  constFormat: string
  constName: string
  rate: (pity: number) => number
}

type Sim = ReducedSim & {
  pity: number
  guaranteed: boolean
  guaranteedPity: number
}
type ReducedSim = {
  const: number
  rate: number
}

export default function GachaCalc({ location }: { location: string }) {
  const [current, setCurrent] = useState(-1)
  const [pity, setPity] = useState(0)
  const [pulls, setPulls] = useState(90)
  const [guaranteed, setGuaranteed] = useState(false)
  const [guaranteedPity, setGuaranteedPity] = useState(0)

  const [calculated, setCalculated] = useState([] as ReducedSim[])

  const [gachaName, setGacha] = useState(Object.values(gachas).map(g => g.bannerName)[0])

  const banner = Object.values(gachas).find(x => x.bannerName == gachaName) ?? Object.values(gachas)[0]

  if (pity >= banner.maxPity) setPity(banner.maxPity - 1)
  if (banner.guaranteedPity && guaranteedPity >= banner.guaranteedPity) setGuaranteedPity(banner.guaranteedPity)
  if (current > banner.maxConst) setCurrent(banner.maxConst)
  if (current < banner.minConst) setCurrent(banner.minConst)

  useEffect(
    () => setCalculated(calcSimsRegular(current, pity, pulls, guaranteed, guaranteedPity, banner)),
    [current, pity, pulls, guaranteed, guaranteedPity, banner]
  )

  const desc = "Gacha rate calculator for Genshin Impact."
  return (
    <Main>
      <Head>
        <title>Gacha Rate Calculator | Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Gacha Rate Calculator | Hu Tao" />
        <meta property="og:description" content={desc} />
        <meta property="description" content={desc} />
      </Head>

      <h2 className="font-semibold">
        <FormattedLink href="/tools/" location={location} className="font-semibold text-lg">
          Tools
        </FormattedLink>
      </h2>

      <h1 className="text-5xl font-bold pb-2">
        Gacha rate calculator
      </h1>

      <SelectInput label="Banner type" set={(g) => {
        if (current == banner.minConst)
          setCurrent(-5)
        setGacha(g)
      }} value={gachaName} options={Object.values(gachas).map(g => g.bannerName)} />
      <NumberInput label="Pulls" set={setPulls} value={pulls} min={0} max={1260} />
      <NumberInput label={`Current ${banner.constFormat}`} set={setCurrent} value={current} min={banner.minConst} max={banner.maxConst} />
      <NumberInput label="Current pity" set={setPity} value={pity} min={0} max={banner.maxPity - 1} />
      <CheckboxInput label="Next is guaranteed" set={setGuaranteed} value={guaranteed} />
      {banner.guaranteedPity && <NumberInput label="Epitomized Path" set={setGuaranteedPity} value={guaranteedPity} min={0} max={banner.guaranteedPity - 1} />}

      <h3 className="text-lg font-bold pt-1" id="resistance">Results:</h3>
      <table className={`table-auto w-64 ${styles.table} ${styles.stattable} mb-2 sm:text-base text-sm`}>
        <thead>
          <tr className="divide-x divide-gray-200 dark:divide-gray-500">
            <th>{banner.constName}</th>
            <th>Rate</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-500">
          {calculated
            .map((c) => <tr className={`pr-1 divide-x divide-gray-200 dark:divide-gray-500 ${c.rate < 0.0005 ? "opacity-60" : ""}`} key={c.const}>
              <td>{c.const == banner.minConst ? "Not owned" : `${banner.constFormat}${c.const}`}</td>
              <td>{(c.rate * 100).toFixed(3)}%</td>
            </tr>)}
        </tbody>
      </table>
    </Main>
  )
}

function NumberInput({ value, set, label, min, max }: { value: number, set: (newValue: number) => unknown, label: string, min?: number, max?: number }) {
  return <div><label>
    {label}
    <input
      className="bg-white dark:bg-slate-800 rounded-lg px-2 ml-2 mt-1 focus:ring-indigo-500 focus:border-indigo-500"
      value={value}
      onChange={(e) => {
        const value = +e.target.value
        set(min && value < min ? min : max && value > max ? max : value)
      }}
      min={min}
      max={max}
      type="number"
    />
  </label></div>
}


function CheckboxInput({ value, set, label }: { value: boolean, set: (newValue: boolean) => unknown, label: string }) {
  return <div><label>
    {label}
    <input
      className="bg-white dark:bg-slate-800 rounded-lg px-2 ml-2 mt-1 focus:ring-indigo-500 focus:border-indigo-500"
      checked={value}
      onChange={(e) => set(e.target.checked)}
      type="checkbox"
    />
  </label></div>
}


function SelectInput({ value, set, label, options }: { value: string, set: (newValue: string) => unknown, options: string[], label: string }) {
  return <div><label>
    {label}
    <select
      value={value}
      onChange={e => set(e.target.value)}
      className="mt-1 ml-2 mb-2 py-0.5 px-2 border border-gray-300 bg-white dark:bg-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    >
      {options.map(opt => <option key={opt}>{opt}</option>)}
    </select>
  </label></div>
}

function calcSimsRegular(current: number, pity: number, pulls: number, guaranteed: boolean, guaranteedPity: number, banner: Banner): ReducedSim[] {
  // Max pity / const
  if (banner.guaranteed >= 1 && pulls + pity >= banner.maxPity * ((banner.maxConst + 1) * 2 - (guaranteed ? 1 : 0)))
    return [{
      const: banner.maxConst,
      rate: 1
    }]

  if (banner.guaranteedPity && banner.guaranteedPity >= 1 && pulls + pity >= banner.maxPity * ((banner.maxConst + 1) * banner.guaranteedPity * 2 - (guaranteed ? 1 : 0)))
    return [{
      const: banner.maxConst,
      rate: 1
    }]

  return calcSimsInt({
    pity,
    guaranteed,
    guaranteedPity,
    const: current,
    rate: 1
  }, pulls, banner)
}

function calcSimsInt(starterSim: Sim, pulls: number, banner: Banner): ReducedSim[] {
  console.time("Start")
  const sims: Sim[] = calcSimsExact([starterSim], pulls, banner, 0)
  console.timeEnd("Start")

  // Reducing to simple sims with less information
  const reducedSims: ReducedSim[] = []
  sims.forEach((sim: Sim) => {
    if (sim.rate == 0) return

    const other = reducedSims[sim.const + 1]

    if (other)
      other.rate += sim.rate
    else
      reducedSims[sim.const + 1] = {
        const: sim.const,
        rate: sim.rate
      }
  })

  return reducedSims
}

function calcSimsExact(sims: Sim[], pulls: number, banner: Banner, prune = 1e-8) {
  for (let i = 0; i < pulls; i++) {
    const newSims: Sim[] = []

    const addOrMerge = (sim: Sim) => {
      if (sim.rate <= 0) return

      const v = (((sim.const + 1) * (banner.maxPity + 5) + sim.pity) * 2 + (+sim.guaranteed)) * (banner.guaranteedPity ?? 1) + sim.guaranteedPity
      const other = newSims[v]

      if (other) {
        other.rate += sim.rate
        return
      }

      newSims[v] = sim
    }

    for (const sim of sims) {
      if (!sim) continue
      if (sim.rate <= prune) continue // Pruning
      if (sim.const >= banner.maxConst) { // Limited to C6
        addOrMerge(sim)
        continue
      }
      const currentPity = sim.pity + 1
      let rate = banner.rate(currentPity) / 100
      if (rate > 1) rate = 1
      else if (rate < 0) rate = 0
      const bannerRate = (
        sim.guaranteed ||
        (banner.guaranteedPity && sim.guaranteedPity >= banner.guaranteedPity - 1)
      ) ? 1 : banner.banner

      // Failed
      if (rate < 1)
        addOrMerge({
          pity: currentPity,
          guaranteed: sim.guaranteed,
          guaranteedPity: sim.guaranteedPity,
          const: sim.const,
          rate: sim.rate * (1 - rate)
        })

      // Got wanted banner item
      addOrMerge({
        pity: 0,
        guaranteed: false,
        guaranteedPity: 0,
        const: sim.const + 1,
        rate: sim.rate * rate * bannerRate * banner.guaranteed
      })

      // Got banner item but not wanted (eg. wrong rate up 4* char/5* char)
      if (banner.guaranteed < 1)
        if (banner.guaranteedPity && sim.guaranteedPity >= banner.guaranteedPity - 1)
          // https://www.hoyolab.com/article/533196
          addOrMerge({
            pity: 0,
            guaranteed: false,
            guaranteedPity: 0,
            const: sim.const + 1,
            rate: sim.rate * rate * bannerRate * (1 - banner.guaranteed)
          })
        else
          addOrMerge({
            pity: 0,
            guaranteed: false,
            guaranteedPity: sim.guaranteedPity + 1,
            const: sim.const,
            rate: sim.rate * rate * bannerRate * (1 - banner.guaranteed)
          })

      // Failed banner items (eg. 4* char rate ups vs regular 4*)
      if (bannerRate < 1)
        addOrMerge({
          pity: 0,
          guaranteed: true,
          guaranteedPity: sim.guaranteedPity + 1,
          const: sim.const,
          rate: sim.rate * rate * (1 - bannerRate)
        })
    }

    sims = newSims
  }
  return sims
}
