import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js"
import Head from "next/head"
import { EffectCallback, useEffect, useMemo, useState } from "react"
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

function pityRate(
  baseRate: number,
  pityStart: number,
  increaseRate?: number
): (pity: number) => number {
  return (pity) =>
    pity < pityStart
      ? baseRate
      : baseRate + (increaseRate ?? baseRate * 10) * (pity - pityStart + 1)
}

const gachas: Record<string, Banner> = {
  char: {
    bannerName: "5* banner character [Genshin Impact (5.0+, hypothese A)]",
    banner: [0.5, 0.5, 0.75, 1],
    guaranteed: 1,
    minConst: -1,
    maxConst: 6,
    constFormat: "C",
    constName: "Constellation",
    maxPity: 90,
    rate: pityRate(0.6, Math.ceil(44 / 0.6)),
  },
  charFlatRate: {
    bannerName: "5* banner character [Genshin Impact (5.0+, assumed flat 55/45)]",
    banner: 0.55,
    guaranteed: 1,
    minConst: -1,
    maxConst: 6,
    constFormat: "C",
    constName: "Constellation",
    maxPity: 90,
    rate: pityRate(0.6, Math.ceil(44 / 0.6)),
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
    rate: pityRate(0.7, Math.ceil(44 / 0.7)),
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
    rate: pityRate(5.1, Math.ceil(44 / 5.1)),
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
    rate: pityRate(6.0, Math.ceil(44 / 6.0)),
  },
  charOld: {
    bannerName: "5* banner character [Genshin Impact (PRE 5.0)]",
    banner: 0.5,
    guaranteed: 1,
    minConst: -1,
    maxConst: 6,
    constFormat: "C",
    constName: "Constellation",
    maxPity: 90,
    rate: pityRate(0.6, Math.ceil(44 / 0.6)),
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
    rate: pityRate(0.7, Math.ceil(44 / 0.7)),
  },
  charHSR: {
    bannerName: "5* banner character [Honkai: Star Rail]",
    banner: 0.5 + (0.5 * 1) / 8,
    guaranteed: 1,
    minConst: -1,
    maxConst: 6,
    constFormat: "E",
    constName: "Eidolon",
    maxPity: 90,
    rate: pityRate(0.6, Math.ceil(44 / 0.6)),
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
    rate: pityRate(0.8, 66, 7.0),
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
    rate: pityRate(6.6, Math.ceil(44 / 6.0)),
  },
}

type Banner = {
  bannerName: string
  banner: number | number[]
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
  lostPity: number
}
type ReducedSim = {
  gachaTargetIndex: number
  gachaTarget: GachaTarget
  const: number
  rate: number
}

type GachaTarget = {
  id: string
  banner: Banner
  current: number
  target: number
  pity: number
  guaranteed: boolean
  guaranteedPity: number
  lostPity: number
}

let gtCounter = 0
function createDefaultTarget(banner: Banner): GachaTarget {
  return {
    id: gtCounter++ + Math.random().toString(36).substring(2, 15),
    banner,
    current: banner.minConst,
    target: banner.maxConst,
    pity: 0,
    guaranteed: false,
    guaranteedPity: 0,
    lostPity: 0,
  }
}

export default function GachaCalc({ location }: { location: string }) {
  const [gachaTargets, setGachaTargets] = useState<GachaTarget[]>([createDefaultTarget(gachas.char)])
  const [pulls, setPulls] = useState(gachaTargets[0].banner.maxPity)

  const calculated = useMemo(() => calcSimsRegular(pulls, gachaTargets), [gachaTargets, pulls])

  const consts = []
  for (let index = 0; index < gachaTargets.length; index++) {
    const gachaTarget = gachaTargets[index]
    for (let i = gachaTarget.current + 1; i <= gachaTarget.target; i++)
      consts.push({
        gachaTargetIndex: index,
        gachaTarget,
        const: i,
      })
  }

  const constName = gachaTargets.map(gt => gt.banner.constName).filter((x, i, a) => a.indexOf(x) == i).join("/")
  const constFormat = gachaTargets.map(gt => gt.banner.constFormat).filter((x, i, a) => a.indexOf(x) == i).join("/")

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

      <h1 className="text-5xl font-bold pb-2">Gacha rate calculator</h1>

      <NumberInput label="Pulls" set={setPulls} value={pulls} min={0} max={1260 * gachaTargets.length}/>
      {gachaTargets.map((gachaTarget, index) => <div key={gachaTarget.id} className="bg-blend-multiply bg-slate-600 rounded-xl p-1 my-2">
        {gachaTargets.length > 1 &&
          <button className="bg-red-700 text-slate-50 cursor-pointer text-center rounded-lg px-2 py-1 my-2 float-right"
            onClick={() =>
              setGachaTargets(gachaTargets.filter((_, i) => i != index))
            }>
            Remove gacha target
          </button>
        }
        <GachaTargetInput value={gachaTarget} set={newGachaTarget => setGachaTargets(gachaTargets.map((gt, i) => i == index ? newGachaTarget : gt))} />
      </div>)}

      <button className="bg-green-700 text-slate-50 cursor-pointer text-center rounded-lg px-2 py-1 my-2"
          onClick={() =>
            setGachaTargets([...gachaTargets, createDefaultTarget(gachas.weapon)])
          }>
          Add next gacha target
      </button>

      <h3 className="text-lg font-bold pt-1" id="results">Results</h3>
      <div className="columns-1 md:columns-2 mr-2 mb-2">
        <div className="w-full bg-slate-800 rounded-xl p-1 my-2 md:my-0 text-white col-start-1">
          <Bar
            data={{
              labels: calculated[calculated.length - 1].filter((x) => x).map((c) => getName(c)),
              datasets: [{
                label: "Rate",
                backgroundColor: "rgb(75, 192, 192)",
                data: calculated[calculated.length - 1].filter(x => x).map(c => c.rate * 100),
                borderColor: "white",
                borderWidth: 2,
                xAxisID: "xAxes",
              }],
            }}
            options={{
              indexAxis: "y",
              color: "white",
              backgroundColor: "#333333",
              scales: {
                xAxes: {
                  min: 0,
                  ticks: {
                    color: "white",
                    callback: (v) => `${v}%`,
                  },
                },
                yAxes: {
                  ticks: {
                    color: "white",
                  },
                },
              },
          }}/>
        </div>
        <div className="w-full bg-slate-800 rounded-xl p-1 my-2 md:my-0 text-white col-start-2">
          <Line data={{
              labels: calculated[calculated.length - 1].filter(x => x).map(c => getName(c)),
              datasets: [{
                label: "Cumulative rate",
                borderColor: "rgb(255, 99, 132)",
                borderWidth: 2,
                fill: false,
                data: calculated[calculated.length - 1]
                  .filter((x) => x)
                  .map((c, i, a) => a.slice(i, a.length).reduce((p, c) => p + c.rate, 0) * 100),
              }],
            }}
            options={{
              indexAxis: "y",
              color: "white",
              backgroundColor: "#333333",
              scales: {
                xAxes: {
                  max: 100,
                  min: 0,
                  ticks: {
                    color: "white",
                    callback: (v) => `${v}%`,
                  },
                },
                yAxes: {
                  ticks: {
                    color: "white",
                  },
                },
              },
            }}
          />
        </div>
      </div>
      <div className="w-full bg-slate-800 rounded-xl p-1 my-2 md:my-0 text-white col-start-2">
        <Line
          data={{
            labels: calculated.map((_, i) => i),
            datasets: consts
              .map((gtc, x, arr) => ({
                label: getName(gtc),
                backgroundColor: getColor(gtc, gachaTargets, 1),
                borderColor: getColor(gtc, gachaTargets, 1),
                fill: {
                  above: getColor(gtc, gachaTargets, 0.15),
                  below: getColor(gtc, gachaTargets, 0.1),
                  target: arr.indexOf(gtc) == arr.length - 1 ? "start" : x + 1,
                },
                data: calculated.map(c => c
                  ?.filter(x => x.const >= gtc.const && x.gachaTargetIndex == gtc.gachaTargetIndex || gtc.gachaTargetIndex < x.gachaTargetIndex)
                  ?.reduce((p, c) => p + c.rate, 0) * 100
                ),
                borderWidth: 2,
                xAxisID: "xAxes",
              })),
          }}
          options={{
            color: "white",
            backgroundColor: "#333333",
            interaction: {
              mode: "index",
              intersect: false,
            },
            scales: {
              yAxes: {
                max: 100,
                min: 0,
                ticks: {
                  color: "white",
                  callback: (v) => `${v}%`,
                },
              },
              xAxes: {
                ticks: {
                  color: "white",
                },
              },
            },
          }}
        />
      </div>
      <h3 className="text-lg font-bold pt-1" id="table">Rate Table</h3>
      <table className={`table-auto w-80 ${styles.table} ${styles.stattable} my-2 sm:text-base text-sm`}>
        <thead>
          <tr className="divide-x divide-gray-200 dark:divide-gray-500">
            <th>{constName}</th>
            <th className="underline decoration-dotted" title={`Chance to get exactly a certain ${constName.toLowerCase()} (and NOT higher) within ${pulls} pulls (sums up to to 100%)`}>
              Rate
            </th>
            <th className="underline decoration-dotted" title={`Chance to get at least ${constName.toLowerCase()} (or higher) within ${pulls} pulls`}>
              Cumulative rate
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-500">
          {calculated[calculated.length - 1]
            .filter((x) => x)
            .map((c, i, a) => (
              <tr className={`pr-1 divide-x divide-gray-200 dark:divide-gray-500 ${c.rate < 0.0005 ? "opacity-60" : ""}`} key={i}>
                <td>{getName(c)}</td>
                <td title={getName(c) == "Not owned" ?
                  `Chance to NOT get any of the wanted item within ${pulls} pulls` :
                  `Chance to get exactly ${getName(c)} (and NOT higher) within ${pulls} pulls`
                }>{(c.rate * 100).toFixed(3)}%</td>
                <td title={getName(c) == "Not owned" ?
                  "Chance to get nothing or higher, so basically always 100%" :
                  `Chance to get ${getName(c)} or higher within ${pulls} pulls`
                }>{(a.slice(i, a.length).reduce((p, c) => p + c.rate, 0) * 100).toFixed(2)}%</td>
              </tr>
            ))}
        </tbody>
      </table>
      <h3 className="text-lg font-bold pt-1" id="disclaimer">Disclaimer</h3>
      <p>
        The calculator uses the statistical model for drop-rates of Cgg/<FormattedLink href="https://genshin-wishes.com/" target="_blank">genshin-wishes.com</FormattedLink>.
        For more information about drop rates, please refer to <FormattedLink href="https://www.hoyolab.com/article/497840" target="_blank"> their HoYoLAB post</FormattedLink>.
      </p>
      <p className="pt-2">
        Rates indicate the chance to get exactly {constFormat}x within Y pulls, cumulative rate chance to get {constFormat}x or higher within Y pulls.
        Big graph indicates cumulative rate at each pull (read: Z% to get {constFormat}x <i>within</i> Y pulls).
      </p>
      <p className="pt-2">
        Exact details of &apos;Capturing Radiance&apos; are not yet known.
        Hypothese A assumes a lost pity model where rate goes from 50%/50%, to 50%/50% to 75%/25% to 100%/0% and resets when you win the 50/50.
        The other version assumes a flat consolidated rate of 55% mentioned in the <a href="https://www.hoyolab.com/article/32168979">HoYoLAB article</a> which is what you can expect in the long term.
      </p>

      <p className="pt-2">
        <i>
          <b>NOTE</b>: To reduce the amount of calculations, the 4-star character banner calculator will assume there are no 5-stars being dropped.
          These can prevent a 4 star from dropping, but they still increase the pity counter.
          It is possible (in-game) to not get a 4-star within 10 pity, but the next pull is guaranteed to be a 4-star if it&apos;s not a 5-star.
        </i>
      </p>
    </Main>
  )
}

function delayed(f: EffectCallback) {
  const timeout = setTimeout(() => {
    f()
  }, 3000)

  return () => clearTimeout(timeout)
}

function getColor({ const: c, gachaTargetIndex }: { const: number, gachaTargetIndex: number }, gachaTargets: GachaTarget[], alpha: number) {
  const gt = gachaTargets[gachaTargetIndex]
  const previous = gachaTargets.slice(0, gachaTargetIndex).reduce((p, gt, ci) => p + gt.target - (ci == 0 ? 0 : gt.current), 0)
  let totalIndex = 1 + c
  if (gt.target - gt.current < 4 || previous < 3)
    totalIndex = totalIndex + previous - (gachaTargetIndex == 0 ? 0 : gt.current)

  const colors = [
    `rgba(201,201,201,${alpha})`,
    `rgba(255,99,99,${alpha})`,
    `rgba(255,216,99,${alpha})`,
    `rgba(177,255,99,${alpha})`,
    `rgba(99,255,138,${alpha})`,
    `rgba(99,255,255,${alpha})`,
    `rgba(99,138,255,${alpha})`,
    `rgba(177,99,255,${alpha})`,
    `rgba(255,99,216,${alpha})`,
  ]
  return colors[totalIndex % colors.length]
}

function getName({ const: c, gachaTarget }: { const: number, gachaTarget: GachaTarget }) {
  return c == gachaTarget.banner.minConst ? "Not owned" : `${gachaTarget.banner.constFormat}${c}`
}
function GachaTargetInput({
  value,
  set,
}: {
  value: GachaTarget;
  set: (newValue: GachaTarget) => unknown;
}) {
  const [current, setCurrent] = useState(value.current)
  const [target, setTarget] = useState(value.target)
  const [pity, setPity] = useState(value.pity)
  const [guaranteed, setGuaranteed] = useState(value.guaranteed)
  const [guaranteedPity, setGuaranteedPity] = useState(value.guaranteedPity)
  const [lostPity, setLostPity] = useState(value.lostPity)

  const [gachaName, setGacha] = useState(value.banner.bannerName)

  const banner = Object.values(gachas).find((x) => x.bannerName == gachaName) ?? Object.values(gachas)[0]
  useEffect(() => delayed(() => { if (pity >= banner.maxPity) setPity(banner.maxPity - 1) }), [banner, pity])
  useEffect(() => delayed(() => { if (banner.guaranteedPity && guaranteedPity >= banner.guaranteedPity) setGuaranteedPity(banner.guaranteedPity) }), [banner, guaranteedPity])
  useEffect(() => delayed(() => { if (Array.isArray(banner.banner) && lostPity >= banner.banner.length) setLostPity(banner.banner.length - 1) }), [banner, lostPity])
  useEffect(() => delayed(() => { if (current >= banner.maxConst) setCurrent(banner.maxConst - 1) }), [banner, current])
  useEffect(() => delayed(() => { if (current < banner.minConst) setCurrent(banner.minConst) }), [current, banner])
  useEffect(() => delayed(() => { if (target > banner.maxConst) setTarget(banner.maxConst) }), [banner, target])
  useEffect(() => delayed(() => { if (target <= banner.minConst) setTarget(banner.minConst + 1) }), [target, banner])
  useEffect(() => delayed(() => { if (current >= target) setCurrent(target - 1) }), [target, current])

  useEffect(() => {
    if (banner.bannerName != value.banner.bannerName) {}
    else if (current != value.current) {}
    else if (target != value.target) {}
    else if (pity != value.pity) {}
    else if (guaranteed != value.guaranteed) {}
    else if (guaranteedPity != value.guaranteedPity) {}
    else if (lostPity != value.lostPity) {}
    else return

    set({
      id: value.id,
      banner,
      current,
      target,
      pity,
      guaranteed,
      guaranteedPity,
      lostPity,
    })
  }, [set, value, banner, current, target, pity, guaranteed, guaranteedPity, lostPity])
  return (
    <>
      <SelectInput label="Banner type" set={(g) => {
          if (current == banner.minConst)
            setCurrent((Object.values(gachas).find((x) => x.bannerName == g) ?? Object.values(gachas)[0]).minConst)
          if (target == banner.maxConst)
            setTarget((Object.values(gachas).find((x) => x.bannerName == g) ?? Object.values(gachas)[0]).maxConst)
          setGacha(g)
        }}
        value={gachaName}
        options={Object.values(gachas).map((g) => g.bannerName)}
      />
      <NumberInput label={`Current ${banner.constName.toLowerCase()}`} set={setCurrent} value={current} min={banner.minConst} max={target - 1}/>
      <NumberInput label={`Target ${banner.constName.toLowerCase()}`} set={setTarget} value={target} min={current + 1} max={banner.maxConst}/>
      <NumberInput label="Current pity" set={setPity} value={pity} min={0} max={banner.maxPity - 1}/>
      <CheckboxInput label="Next is guaranteed" set={setGuaranteed} value={guaranteed}/>
      {banner.guaranteedPity && (
        <NumberInput label="Epitomized Path" set={setGuaranteedPity} value={guaranteedPity} min={0} max={banner.guaranteedPity - 1}/>
      )}
      {Array.isArray(banner.banner) && (
        <NumberInput label="Lost pity (Capturing Radiance)" set={setLostPity} value={lostPity} min={0} max={banner.banner.length - 1}/>
      )}
    </>
  )
}

function NumberInput({ value, set, label, min, max }: {
  value: number;
  set: (newValue: number) => unknown;
  label: string;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label>
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
        <button
          className={`${
            value == min
              ? "bg-slate-800 text-slate-50"
              : "bg-red-500 text-slate-50 cursor-pointer"
          } text-center rounded-lg px-1 inline-block ml-2 md:sr-only`}
          tabIndex={-1}
          onClick={() =>
            min == undefined || value > min ? set(value - 1) : void 0
          }
        >
          Subtract 1
        </button>
        <button
          className={`${
            value == max
              ? "bg-slate-800 text-slate-50"
              : "bg-green-500 text-slate-50 cursor-pointer"
          } text-center rounded-lg px-1 inline-block ml-2 md:sr-only`}
          tabIndex={-1}
          onClick={() =>
            max == undefined || value < max ? set(value + 1) : void 0
          }
        >
          Add 1
        </button>
      </label>
    </div>
  )
}

function CheckboxInput({ value, set, label }: {
  value: boolean;
  set: (newValue: boolean) => unknown;
  label: string;
}) {
  return (
    <div>
      <label>
        {label}
        <input
          className="bg-slate-200 dark:bg-slate-800 rounded-lg px-2 ml-2 mt-1 focus:ring-indigo-500 focus:border-indigo-500"
          checked={value}
          onChange={(e) => set(e.target.checked)}
          type="checkbox"
        />
      </label>
    </div>
  )
}

function SelectInput({ value, set, label, options }: {
  value: string;
  set: (newValue: string) => unknown;
  options: string[];
  label: string;
}) {
  return (
    <div>
      <label>
        {label}
        <select
          value={value}
          onChange={(e) => set(e.target.value)}
          className="mt-1 ml-2 mb-2 py-0.5 px-2 border border-gray-300 bg-slate-200 dark:bg-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        >
          {options.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      </label>
    </div>
  )
}


function createStarterSim(gachaTargets: GachaTarget[], gachaTargetIndex: number = 0, rate: number = 1): Sim {
  const init = gachaTargets[gachaTargetIndex]
  return {
    gachaTargetIndex,
    gachaTarget: init,
    const: init.current,
    pity: init.pity,
    guaranteed: init.guaranteed,
    guaranteedPity: init.guaranteedPity,
    lostPity: init.lostPity,
    rate: rate,
  }
}

function calcSimsRegular(
  pulls: number,
  gachaTargets: GachaTarget[],
): ReducedSim[][] {
  console.log("calcSimsRegular", pulls, gachaTargets)
  console.time("calc")
  const sims = calcSimsExact([createStarterSim(gachaTargets)], pulls, gachaTargets, 0, (sims) => {
    // Reducing to simple sims with less information
    const reducedSims: ReducedSim[] = []
    sims.forEach((sim: Sim) => {
      if (sim.rate == 0) return

      const key = sim.gachaTargetIndex * 10 + (sim.const + 1)
      const other = reducedSims[key]

      if (other) other.rate += sim.rate
      else
        reducedSims[key] = {
          gachaTargetIndex: sim.gachaTargetIndex,
          gachaTarget: sim.gachaTarget,
          const: sim.const,
          rate: sim.rate,
        }
    })
    return reducedSims
  })
  console.timeEnd("calc")
  // console.trace("calcSimsExact", sims)

  return sims
}


function calcSimsExact<T>(
  sims: Sim[],
  pulls: number,
  gachaTargets: GachaTarget[],
  prune = 1e-8,
  mapper: (sims: Sim[]) => T = (sims) => sims as unknown as T
): T[] {
  const mappedSims: T[] = [mapper(sims)]

  const pityKeySize = Math.max(...gachaTargets.map(gt => gt.banner.maxPity))
  const constKeySize = Math.max(...gachaTargets.map(gt => gt.banner.maxConst))
  const guaranteedPityKeySize = Math.max(...gachaTargets.map(gt => gt.banner.guaranteedPity ? gt.banner.guaranteedPity + 1 : 0))
  const lostPityKeySize = Math.max(...gachaTargets.map(gt => Array.isArray(gt.banner.banner) ? gt.banner.banner.length : 0))

  for (let i = 0; i < pulls; i++) {
    const newSims: Record<number, Sim> = {}

    const addOrMerge = (sim: Sim) => {
      if (sim.rate <= 0) return
      if (sim.const >= sim.gachaTarget.target && sim.gachaTargetIndex != gachaTargets.length - 1) {
        sim = createStarterSim(gachaTargets, sim.gachaTargetIndex + 1, sim.rate)
      }

      let key = sim.pity
      let keySize = pityKeySize + 1

      key += (sim.const + 1) * keySize
      keySize *= constKeySize + 2

      key += (+sim.guaranteed + 1) * keySize
      keySize *= 2

      if (guaranteedPityKeySize > 0) {
        key += (sim.guaranteedPity + 1) * keySize
        keySize *= guaranteedPityKeySize + 1
      }

      if (lostPityKeySize > 0) {
        key += (sim.lostPity + 1) * keySize
        keySize *= lostPityKeySize + 1
      }

      key += sim.gachaTargetIndex * keySize
      keySize *= gachaTargets.length

      const other = newSims[key]

      if (other) {
        // if (other.const != sim.const) console.error("const", key, sim, other)
        // else if (other.guaranteed != sim.guaranteed) console.error("guaranteed", key, sim, other)
        // else if (other.guaranteedPity != sim.guaranteedPity) console.error("guaranteedPity", key, sim, other)
        // else if (other.pity != sim.pity) console.error("pity", key, sim, other)
        // else if (other.lostPity != sim.lostPity) console.error("lostPity", key, sim, other)
        // else if (other.gachaTargetIndex != sim.gachaTargetIndex) console.error("gachaTargetIndex", key, sim, other)
        // else {
        other.rate += sim.rate
        return
        // }
        // throw new Error("Unexpected sim")
      }

      newSims[key] = sim
    }

    for (const sim of sims) {
      if (!sim) continue
      if (sim.rate <= prune) continue // Pruning
      const gachaTarget = gachaTargets[sim.gachaTargetIndex]
      if (sim.const >= gachaTarget.target) {
        // Limited to target
        // if (sim.gachaTargetIndex != gachaTargets.length - 1) {
        //   console.error("sim.gachaTargetIndex != gachaTargets.length - 1", sim, gachaTargets)
        //   throw new Error("Unexpected sim")
        // }
        addOrMerge({ ...sim })
        continue
      }

      const banner = gachaTarget.banner
      const currentPity = sim.pity + 1
      let rate = banner.rate(currentPity) / 100
      if (rate > 1) rate = 1
      else if (rate < 0) rate = 0
      const bannerRate = (
        sim.guaranteed ||
        (banner.guaranteedPity && sim.guaranteedPity >= banner.guaranteedPity - 1)
      ) ? 1 : (Array.isArray(banner.banner) ? banner.banner[sim.lostPity] : banner.banner)

      // Failed
      if (rate < 1)
        addOrMerge({
          gachaTargetIndex: sim.gachaTargetIndex,
          gachaTarget: sim.gachaTarget,
          pity: currentPity,
          guaranteed: sim.guaranteed,
          guaranteedPity: sim.guaranteedPity,
          lostPity: sim.lostPity,
          const: sim.const,
          rate: sim.rate * (1 - rate),
        })

      // Got wanted banner item
      addOrMerge({
        gachaTargetIndex: sim.gachaTargetIndex,
        gachaTarget: sim.gachaTarget,
        pity: 0,
        guaranteed: false,
        guaranteedPity: 0,
        lostPity: sim.guaranteed ? sim.lostPity : 0, // Keep lost pity if it was guaranteed, otherwise we won 50/50
        const: sim.const + 1,
        rate: sim.rate * rate * bannerRate * banner.guaranteed,
      })

      // Got banner item but not wanted (eg. wrong rate up 4* char/5* char)
      if (banner.guaranteed < 1)
        if (
          banner.guaranteedPity &&
          sim.guaranteedPity >= banner.guaranteedPity - 1
        )
          // https://www.hoyolab.com/article/533196
          addOrMerge({
            gachaTargetIndex: sim.gachaTargetIndex,
            gachaTarget: sim.gachaTarget,
            pity: 0,
            guaranteed: false,
            guaranteedPity: 0,
            lostPity: 0, // No idea what to do here as it isn't relevant (combination doesn't exist ingame)
            const: sim.const + 1,
            rate: sim.rate * rate * bannerRate * (1 - banner.guaranteed),
          })
        else
          addOrMerge({
            gachaTargetIndex: sim.gachaTargetIndex,
            gachaTarget: sim.gachaTarget,
            pity: 0,
            guaranteed: false,
            guaranteedPity: banner.guaranteedPity ? sim.guaranteedPity + 1 : 0,
            lostPity: 0, // No idea what to do here as it isn't relevant (combination doesn't exist ingame)
            const: sim.const,
            rate: sim.rate * rate * bannerRate * (1 - banner.guaranteed),
          })

      // Failed banner items (eg. 4* char rate ups vs regular 4*)
      if (bannerRate < 1)
        addOrMerge({
          gachaTargetIndex: sim.gachaTargetIndex,
          gachaTarget: sim.gachaTarget,
          pity: 0,
          guaranteed: true,
          guaranteedPity: banner.guaranteedPity ? sim.guaranteedPity + 1 : 0,
          lostPity: Array.isArray(banner.banner) ? sim.lostPity + 1 : 0, // increase lost pity if it was a lost 50/50
          const: sim.const,
          rate: sim.rate * rate * (1 - bannerRate),
        })
    }

    sims = Object.values(newSims)
    mappedSims.push(mapper(sims))
  }
  return mappedSims
}
