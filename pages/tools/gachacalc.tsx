import {
  BarElement, CategoryScale, Chart as ChartJS, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip
} from "chart.js"
import Head from "next/head"
import { EffectCallback, useEffect, useState, useMemo } from "react"
import { Bar, Line } from "react-chartjs-2"
import FormattedLink from "../../components/FormattedLink"
import Main from "../../components/Main"
import styles from "../style.module.css"

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Legend,
  Tooltip
)

function pityRate(baseRate: number, pityStart: number, increaseRate?: number): (pity: number) => number {
  return (pity) => pity < pityStart ? baseRate : baseRate + (increaseRate ?? baseRate * 10) * (pity - pityStart + 1)
}

const gachas: Record<string, Banner> = {
  char: {
    bannerName: "5* banner character [Genshin Impact (5.0+)]",
    banner: 0.55,
    guaranteed: 1,
    minConst: -1,
    maxConst: 6,
    constFormat: "C",
    constName: "Constellation",
    maxPity: 90,
    rate: pityRate(0.6, Math.ceil(44 / 0.6))
  },
  weapon: {
    bannerName: "Specific 5* banner weapon [Genshin Impact (5.0+)]",
    banner: 0.75,
    guaranteed: 1 / 2,
    guaranteedPity: 2,
    minConst: 0,
    maxConst: 5,
    constFormat: "R",
    constName: "Refinement",
    maxPity: 80,
    rate: pityRate(0.7, Math.ceil(44 / 0.7))
  },
  "4*char": {
    bannerName: "Specific 4* banner character [Genshin Impact/Honkai: Star Rail]",
    banner: 0.5,
    guaranteed: 1 / 3,
    minConst: -1,
    maxConst: 6,
    constFormat: "C",
    constName: "Constellation",
    maxPity: 10,
    rate: pityRate(5.1, Math.ceil(44 / 5.1))
  },
  "4*weapon": {
    bannerName: "Specific 4* banner weapon [Genshin Impact]",
    banner: 0.75,
    guaranteed: 1 / 5,
    minConst: 0,
    maxConst: 5,
    constFormat: "R",
    constName: "Refinement",
    maxPity: 10,
    rate: pityRate(6.0, Math.ceil(44 / 6.0))
  },
  charOld: {
    bannerName: "5* banner character [Genshin Impact (PRE 5.0)/Honkai: Star Rail]",
    banner: 0.5,
    guaranteed: 1,
    minConst: -1,
    maxConst: 6,
    constFormat: "C",
    constName: "Constellation",
    maxPity: 90,
    rate: pityRate(0.6, Math.ceil(44 / 0.6))
  },
  weaponOld: {
    bannerName: "Specific 5* banner weapon [Genshin Impact (PRE 5.0)]",
    banner: 0.75,
    guaranteed: 1 / 2,
    guaranteedPity: 3,
    minConst: 0,
    maxConst: 5,
    constFormat: "R",
    constName: "Refinement",
    maxPity: 80,
    rate: pityRate(0.7, Math.ceil(44 / 0.7))
  },
  weaponHSR: {
    bannerName: "5* banner weapon [Honkai: Star Rail]",
    banner: 0.75,
    guaranteed: 1,
    minConst: 0,
    maxConst: 5,
    constFormat: "S",
    constName: "Superimposition",
    maxPity: 80,
    rate: pityRate(0.8, 66, 7.0)
  },
  "HSR4*weapon": {
    bannerName: "Specific 4* banner weapon [Honkai: Star Rail]",
    banner: 0.75,
    guaranteed: 1 / 3,
    minConst: 0,
    maxConst: 5,
    constFormat: "S",
    constName: "Superimposition",
    maxPity: 10,
    rate: pityRate(6.6, Math.ceil(44 / 6.0))
  },
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

  const [gachaName, setGacha] = useState(Object.values(gachas).map(g => g.bannerName)[0])

  const banner = Object.values(gachas).find(x => x.bannerName == gachaName) ?? Object.values(gachas)[0]

  const calculated = useMemo(
    () => calcSimsRegular(current, pity, pulls, guaranteed, guaranteedPity, banner),
    [current, pity, pulls, guaranteed, guaranteedPity, banner]
  )

  function delayed(f: EffectCallback) {
    const timeout = setTimeout(() => {
      f()
    }, 3000)

    return () => clearTimeout(timeout)
  }

  useEffect(() => delayed(() => { if (pity >= banner.maxPity) setPity(banner.maxPity - 1) }), [banner, pity])
  useEffect(() => delayed(() => { if (banner.guaranteedPity && guaranteedPity >= banner.guaranteedPity) setGuaranteedPity(banner.guaranteedPity) }), [banner, guaranteedPity])
  useEffect(() => delayed(() => { if (current > banner.maxConst) setCurrent(banner.maxConst) }), [banner, current])
  useEffect(() => delayed(() => { if (current < banner.minConst) setCurrent(banner.minConst) }), [current, banner])

  const consts = []
  for (let i = current; i <= banner.maxConst; i++) consts.push(i)

  const desc = "Gacha rate calculator for Genshin Impact."
  return (
    <Main>
      <Head>
        <title>Gacha Rate Calculator | Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Gacha Rate Calculator | Hu Tao" />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
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
          setCurrent((Object.values(gachas).find(x => x.bannerName == g) ?? Object.values(gachas)[0]).minConst)
        setGacha(g)
      }} value={gachaName} options={Object.values(gachas).map(g => g.bannerName)} />
      <NumberInput label="Pulls" set={setPulls} value={pulls} min={0} max={1260} />
      <NumberInput label={`Current ${banner.constName.toLowerCase()}`} set={setCurrent} value={current} min={banner.minConst} max={banner.maxConst} />
      <NumberInput label="Current pity" set={setPity} value={pity} min={0} max={banner.maxPity - 1} />
      <CheckboxInput label="Next is guaranteed" set={setGuaranteed} value={guaranteed} />
      {banner.guaranteedPity && <NumberInput label="Epitomized Path" set={setGuaranteedPity} value={guaranteedPity} min={0} max={banner.guaranteedPity - 1} />}

      <h3 className="text-lg font-bold pt-1" id="results">Results</h3>
      <div className="columns-1 md:columns-2 mr-2 mb-2">
        <div className="w-full bg-slate-800 rounded-xl p-1 my-2 md:my-0 text-white col-start-1">
          <Bar data={({
            labels: calculated[calculated.length - 1].filter(x => x).map(c => getName(c.const, banner)),
            datasets: [
              {
                label: "Rate",
                backgroundColor: "rgb(75, 192, 192)",
                data: calculated[calculated.length - 1].filter(x => x).map((c, i, a) => c.rate * 100),
                borderColor: "white",
                borderWidth: 2,
                xAxisID: "xAxes"
              },
            ],
          })} options={({
            indexAxis: "y",
            color: "white",
            backgroundColor: "#333333",
            scales: {
              xAxes: {
                min: 0,
                ticks: {
                  color: "white",
                  callback: (v) => `${v}%`
                }
              },
              yAxes: {
                ticks: {
                  color: "white"
                }
              }
            }
          })} /></div>
        <div className="w-full bg-slate-800 rounded-xl p-1 my-2 md:my-0 text-white col-start-2">
          <Line data={({
            labels: calculated[calculated.length - 1].filter(x => x).map(c => getName(c.const, banner)),
            datasets: [
              {
                label: "Cumulative rate",
                borderColor: "rgb(255, 99, 132)",
                borderWidth: 2,
                fill: false,
                data: calculated[calculated.length - 1].filter(x => x).map((c, i, a) => a.slice(i, a.length).reduce((p, c) => p + c.rate, 0) * 100),
              },
            ],
          })} options={({
            indexAxis: "y",
            color: "white",
            backgroundColor: "#333333",
            scales: {
              xAxes: {
                max: 100,
                min: 0,
                ticks: {
                  color: "white",
                  callback: (v) => `${v}%`
                }
              },
              yAxes: {
                ticks: {
                  color: "white"
                }
              }
            }
          })} />
        </div>
      </div>
      <div className="w-full bg-slate-800 rounded-xl p-1 my-2 md:my-0 text-white col-start-2">
        <Line data={({
          labels: calculated.map((_, i) => i),
          datasets: consts.filter(i => i > current).map((i, x) => ({
            label: getName(i, banner),
            backgroundColor: getColor(i, 1),
            borderColor: getColor(i, 1),
            fill: {
              above: getColor(i, 0.15),
              below: getColor(i, 0.1),
              target: (i == banner.maxConst ? "start" : x + 1)
            },
            data: calculated.map((c) => (c?.filter(x => x.const >= i)?.reduce((p, c) => p + c.rate, 0) * 100)),
            borderWidth: 2,
            xAxisID: "xAxes"
          })),
        })} options={({
          color: "white",
          backgroundColor: "#333333",
          interaction: {
            mode: "index",
            intersect: false
          },
          scales: {
            yAxes: {
              max: 100,
              min: 0,
              ticks: {
                color: "white",
                callback: (v) => `${v}%`
              }
            },
            xAxes: {
              ticks: {
                color: "white"
              }
            }
          }
        })} />
      </div>
      <h3 className="text-lg font-bold pt-1" id="table">Rate Table</h3>
      <table className={`table-auto w-80 ${styles.table} ${styles.stattable} my-2 sm:text-base text-sm`}>
        <thead>
          <tr className="divide-x divide-gray-200 dark:divide-gray-500">
            <th>{banner.constName}</th>
            <th className="underline decoration-dotted" title={`Chance to get exactly a certain ${banner.constName.toLowerCase()} (and NOT higher) within ${pulls} pulls (sums up to to 100%)`}>Rate</th>
            <th className="underline decoration-dotted" title={`Chance to get at least ${banner.constName.toLowerCase()} (or higher) within ${pulls} pulls`}>Cumulative rate</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-500">
          {calculated[calculated.length - 1].filter(x => x)
            .map((c, i, a) => <tr className={`pr-1 divide-x divide-gray-200 dark:divide-gray-500 ${c.rate < 0.0005 ? "opacity-60" : ""}`} key={c.const}>
              <td>{getName(c.const, banner)}</td>
              <td title={getName(c.const, banner) == "Not owned" ? `Chance to NOT get any of the wanted item within ${pulls} pulls` : `Chance to get exactly ${getName(c.const, banner)} (and NOT higher) within ${pulls} pulls`}>{(c.rate * 100).toFixed(3)}%</td>
              <td title={getName(c.const, banner) == "Not owned" ? "Chance to get nothing or higher, so basically always 100%" : `Chance to get ${getName(c.const, banner)} or higher within ${pulls} pulls`}>{(a.slice(i, a.length).reduce((p, c) => p + c.rate, 0) * 100).toFixed(2)}%</td>
            </tr>)}
        </tbody>
      </table>
      <h3 className="text-lg font-bold pt-1" id="disclaimer">Disclaimer</h3>
      <p>The calculator uses the statistical model for drop-rates of Cgg/<FormattedLink href="https://genshin-wishes.com/" target="_blank">genshin-wishes.com</FormattedLink>.
        For more information about drop rates, please refer to <FormattedLink href="https://www.hoyolab.com/article/497840" target="_blank"> their HoYoLAB post</FormattedLink>.</p>
      <p>Rates indicate the chance to get exactly {banner.constFormat}x within Y pulls, cumulative rate chance to get {banner.constFormat}x or higher within Y pulls. Big graph indicates cumulative rate at each pull (read: Z% to get {banner.constFormat}x <i>within</i> Y pulls).</p>
      <p>Exact details of &apos;Capturing Radiance&apos; are not yet known. The calculator assumes the consolidated rate of 55% mentioned in the <a href="https://www.hoyolab.com/article/32168979">HoYoLAB article</a>.</p>
      <p><i><b>NOTE</b>: To reduce the amount of calculations, the 4-star character banner calculator will assume there are no 5-stars being dropped.
        These can prevent a 4 star from dropping, but they still increase the pity counter. It is possible (in-game) to not get a 4-star within 10 pity,
        but the next pull is guaranteed to be a 4-star if it&apos;s not a 5-star.</i></p>
    </Main>
  )
}
function getColor(i: number, alpha: number) {
  return [
    `rgba(201,201,201,${alpha})`,
    `rgba(255,99,99,${alpha})`,
    `rgba(255,216,99,${alpha})`,
    `rgba(177,255,99,${alpha})`,
    `rgba(99,255,138,${alpha})`,
    `rgba(99,255,255,${alpha})`,
    `rgba(99,138,255,${alpha})`,
    `rgba(177,99,255,${alpha})`,
    `rgba(255,99,216,${alpha})`
  ][i + 1]
}

function getName(c: number, banner: Banner) {
  return c == banner.minConst ? "Not owned" : `${banner.constFormat}${c}`
}

function NumberInput({ value, set, label, min, max }: { value: number, set: (newValue: number) => unknown, label: string, min?: number, max?: number }) {
  return <div><label>
    {label}
    <input
      className="bg-slate-200 sm:w-32 w-24 dark:bg-slate-800 rounded-lg px-2 ml-2 mt-1 focus:ring-indigo-500 focus:border-indigo-500"
      value={value}
      onChange={(e) => {
        const value = +e.target.value
        set(min && value < min ? min : max && value > max ? max : value)
      }}
      min={min}
      max={max}
      type="number"
    />
    <button className={`${value == min ? "bg-slate-800 text-slate-50": "bg-red-500 text-slate-50 cursor-pointer"} text-center rounded-lg px-1 inline-block ml-2 md:sr-only`} tabIndex={-1}  onClick={() => (min == undefined || value > min) ? set(value - 1) : void 0}>Subtract 1</button>
    <button className={`${value == max ? "bg-slate-800 text-slate-50": "bg-green-500 text-slate-50 cursor-pointer"} text-center rounded-lg px-1 inline-block ml-2 md:sr-only`}  tabIndex={-1}  onClick={() => (max == undefined || value < max) ? set(value + 1) : void 0}>Add 1</button>

  </label></div>
}


function CheckboxInput({ value, set, label }: { value: boolean, set: (newValue: boolean) => unknown, label: string }) {
  return <div><label>
    {label}
    <input
      className="bg-slate-200 dark:bg-slate-800 rounded-lg px-2 ml-2 mt-1 focus:ring-indigo-500 focus:border-indigo-500"
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
      className="mt-1 ml-2 mb-2 py-0.5 px-2 border border-gray-300 bg-slate-200 dark:bg-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
    >
      {options.map(opt => <option key={opt}>{opt}</option>)}
    </select>
  </label></div>
}

function calcSimsRegular(current: number, pity: number, pulls: number, guaranteed: boolean, guaranteedPity: number, banner: Banner): ReducedSim[][] {
  return calcSimsInt({
    pity,
    guaranteed,
    guaranteedPity,
    const: current,
    rate: 1
  }, pulls, banner)
}

function calcSimsInt(starterSim: Sim, pulls: number, banner: Banner): ReducedSim[][] {
  console.time("calc")
  const sims = calcSimsExact([starterSim], pulls, banner, 0, sims => {
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
  })
  console.timeEnd("calc")

  return sims
}

function calcSimsExact<T>(sims: Sim[], pulls: number, banner: Banner, prune = 1e-8, mapper: (sims: Sim[]) => T = (sims => sims as T)): T[] {
  const mappedSims: T[] = [mapper(sims)]
  for (let i = 0; i < pulls; i++) {
    const newSims: Record<number, Sim> = {}

    const addOrMerge = (sim: Sim) => {
      if (sim.rate <= 0) return

      const v = sim.pity + (banner.maxPity + 1) * ((sim.const + 1) + ((banner.maxConst + 2) * (+sim.guaranteed + (2 * sim.guaranteedPity))))
      const other = newSims[v]

      if (other) {
        // if (other.const != sim.const) console.error("const", v, sim, other)
        // if (other.guaranteed != sim.guaranteed) console.error("guaranteed", v, sim, other)
        // if (other.guaranteedPity != sim.guaranteedPity) console.error("guaranteedPity", v, sim, other)
        // if (other.pity != sim.pity) console.error("pity", v, sim, other)

        other.rate += sim.rate
        return
      }

      newSims[v] = sim
    }

    for (const sim of sims) {
      if (!sim) continue
      if (sim.rate <= prune) continue // Pruning
      if (sim.const >= banner.maxConst) { // Limited to C6
        addOrMerge({ ...sim })
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
            guaranteedPity: banner.guaranteedPity ? sim.guaranteedPity + 1 : 0,
            const: sim.const,
            rate: sim.rate * rate * bannerRate * (1 - banner.guaranteed)
          })

      // Failed banner items (eg. 4* char rate ups vs regular 4*)
      if (bannerRate < 1)
        addOrMerge({
          pity: 0,
          guaranteed: true,
          guaranteedPity: banner.guaranteedPity ? sim.guaranteedPity + 1 : 0,
          const: sim.const,
          rate: sim.rate * rate * (1 - bannerRate)
        })
    }

    sims = Object.values(newSims)
    mappedSims.push(mapper(sims))
  }
  return mappedSims
}
