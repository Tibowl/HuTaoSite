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
import { GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import { EffectCallback, useEffect, useMemo, useState } from "react"
import { Bar, Line } from "react-chartjs-2"
import FormattedLink from "../../components/FormattedLink"
import Main from "../../components/Main"
import { getCharacters } from "../../utils/data-cache"
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
    canGuarantee: true,
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
    canGuarantee: true,
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
    canGuarantee: true,
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
    canGuarantee: true,
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
    canGuarantee: true,
    minConst: 0,
    maxConst: 5,
    constFormat: "R",
    constName: "Refinement",
    maxPity: 10,
    rate: pityRate(6.0, Math.ceil(44 / 6.0)),
  },
  "4*charOffBanner": {
    bannerName: "Specific 4* off-banner character on Character Banner [Genshin Impact]",
    banner: 0.5,
    guaranteed: 1 / 0, // This needs to be filled in by user!
    canGuarantee: true,
    minConst: -1,
    maxConst: 6,
    constFormat: "C",
    constName: "Constellation",
    maxPity: 10,
    rate: pityRate(5.1, Math.ceil(44 / 5.1)),
  },
  "4*charOffBannerStandard": {
    bannerName: "Specific 4* character/weapon on Standard Banner [Genshin Impact] [INACCURATE: see note!]",
    banner: 0.5,
    guaranteed: 1 / 0, // This needs to be filled in by user!
    canGuarantee: false, // STANDARD BANNER HAS DIFFERENT PITY SYSTEM FOR KEEPING 50/50
    minConst: -1,
    maxConst: 6,
    constFormat: "C",
    constName: "Constellation",
    maxPity: 10,
    rate: pityRate(5.1, Math.ceil(44 / 5.1)),
  },
  charOld: {
    bannerName: "5* banner [Genshin Impact (Chronicled Wish / Character before 5.0)]",
    banner: 0.5,
    guaranteed: 1,
    canGuarantee: true,
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
    canGuarantee: true,
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
    canGuarantee: true,
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
    canGuarantee: true,
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
    canGuarantee: true,
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
  canGuarantee: boolean
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
  name: string | null
  enabled: boolean
  banner: Banner
  current: number
  target: number
  pity: number
  guaranteed: boolean
  guaranteedPity: number
  lostPity: number
  guaranteedRate: number
}

let gtCounter = 0
function createDefaultTarget(banner: Banner, fourStarCount: number): GachaTarget {
  return {
    id: gtCounter++ + Math.random().toString(36).substring(2, 15),
    name: null,
    enabled: true,
    banner,
    current: banner.minConst,
    target: banner.maxConst,
    pity: 0,
    guaranteed: false,
    guaranteedPity: 0,
    lostPity: 0,
    guaranteedRate: fourStarCount
  }
}

interface Props {
  fourStarCount: number
}
export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> {
  const data = await getCharacters()
  if (!data)
    return {
      props: {
        fourStarCount: 10
      }
    }
  return {
    props: {
      fourStarCount: Object.values(data).filter(c => c.star == 4).length
    },
  }
}

export default function GachaCalc({ location, fourStarCount }: Props & { location: string }) {
  const [gachaTargets, setGachaTargets] = useState<GachaTarget[]>([createDefaultTarget(gachas.char, fourStarCount)])
  const [pulls, setPulls] = useState(gachaTargets[0].banner.maxPity)

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("gachaTargets") ?? "[]")
    if (items.length > 0) {
      // Force low amount as calculations could have exploded
      if (items.filter((x: any) => x.enabled).length > 5) setPulls(1)
      else if (items.filter((x: any) => x.enabled).length > 2) setPulls(10)

      setGachaTargets(items.map((gt: any) => ({
        ...gt,
        banner: gachas[gt.banner] ?? Object.values(gachas)[0],
      })))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("gachaTargets", JSON.stringify(gachaTargets.map(gt => ({
      ...gt,
      banner: Object.entries(gachas).find(([_, v]) => v.bannerName == gt.banner.bannerName)?.[0],
    }))))
  }, [gachaTargets])

  const enabledTargets = useMemo(() => gachaTargets.filter(gt => gt.enabled), [gachaTargets])
  const calculated = useMemo(() => calcSimsRegular(pulls, enabledTargets), [enabledTargets, pulls])
  const lastEntry = calculated[calculated.length - 1] ?? []

  const consts = []
  for (let index = 0; index < enabledTargets.length; index++) {
    const gachaTarget = enabledTargets[index]
    for (let i = gachaTarget.current + 1; i <= gachaTarget.target; i++)
      consts.push({
        gachaTargetIndex: index,
        gachaTarget,
        const: i,
      })
  }

  const constName = enabledTargets.map(gt => gt.banner.constName).filter((x, i, a) => a.indexOf(x) == i).join("/")
  const constFormat = enabledTargets.map(gt => gt.banner.constFormat).filter((x, i, a) => a.indexOf(x) == i).join("/")

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
      {gachaTargets.map((gachaTarget, index) => <div key={gachaTarget.id} className={`${gachaTarget.enabled ? " bg-slate-300 dark:bg-slate-600" : "bg-opacity-25 bg-red-600  "} rounded-xl p-1 my-2 flex flex-row gap-2`}>
        <div className="flex flex-col items-center justify-center gap-2">
          <div>
            <button className="bg-slate-900 text-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center rounded-lg px-2 py-1"
              disabled={!(gachaTargets.length > 1 && index > 0)}
              onClick={() => {
                // Move index up
                const newGachaTargets = [...gachaTargets]
                newGachaTargets[index] = gachaTargets[index - 1]
                newGachaTargets[index - 1] = gachaTargets[index]
                setGachaTargets(newGachaTargets)
              }}>
              &uarr;
            </button>
          </div>
          <div>
            <button className="bg-red-700 text-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center rounded-lg px-2 py-1"
              disabled={!(gachaTargets.length > 1)}
              onClick={() => setGachaTargets(gachaTargets.filter((_, i) => i != index))}>
              &times;
            </button>
          </div>
          <div>
            <button className="bg-slate-900 text-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center rounded-lg px-2 py-1"
              disabled={!(gachaTargets.length > 1 && index < gachaTargets.length - 1)}
              onClick={() => {
                // Move index down
                const newGachaTargets = [...gachaTargets]
                newGachaTargets[index] = gachaTargets[index + 1]
                newGachaTargets[index + 1] = gachaTargets[index]
                setGachaTargets(newGachaTargets)
              }}>
              &darr;
            </button>
          </div>
        </div>
        <GachaTargetInput value={gachaTarget} set={newGachaTarget => setGachaTargets(gachaTargets.map((gt, i) => i == index ? newGachaTarget : gt))} fallbackName={`${index + 1}`} />
      </div>)}

      <button className="bg-green-700 text-slate-50 cursor-pointer text-center rounded-lg px-2 py-1 my-2"
          onClick={() =>
            setGachaTargets([...gachaTargets, createDefaultTarget(gachas.weapon, fourStarCount)])
          }>
          Add next gacha target
      </button>

      <h3 className="text-lg font-bold pt-1" id="results">Results</h3>
      <div className="columns-1 md:columns-2 mr-2 mb-2">
        <div className="w-full bg-slate-800 rounded-xl p-1 my-2 md:my-0 text-white col-start-1">
          <Bar
            data={{
              labels: lastEntry.filter((x) => x).map((c) => getName(c, gachaTargets)),
              datasets: [{
                label: "Rate",
                backgroundColor: "rgb(75, 192, 192)",
                data: lastEntry.filter(x => x).map(c => c.rate * 100),
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
              labels: lastEntry.filter(x => x).map(c => getName(c, gachaTargets)),
              datasets: [{
                label: "Cumulative rate",
                borderColor: "rgb(255, 99, 132)",
                borderWidth: 2,
                fill: false,
                data: lastEntry
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
                label: getName(gtc, gachaTargets),
                backgroundColor: getColor(gtc, enabledTargets, 1),
                borderColor: getColor(gtc, enabledTargets, 1),
                fill: {
                  above: getColor(gtc, enabledTargets, 0.15),
                  below: getColor(gtc, enabledTargets, 0.1),
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
      <table className={`table-auto w-96 ${styles.table} ${styles.stattable} my-2 sm:text-base text-sm`}>
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
          {lastEntry
            .filter((x) => x)
            .map((c, i, a) => (
              <tr className={`pr-1 divide-x divide-gray-200 dark:divide-gray-500 ${c.rate < 0.0005 ? "opacity-60" : ""}`} key={i}>
                <td>{getName(c, gachaTargets)}</td>
                <td title={getName(c, gachaTargets) == "Not owned" ?
                  `Chance to NOT get any of the wanted item within ${pulls} pulls` :
                  `Chance to get exactly ${getName(c, gachaTargets)} (and NOT higher) within ${pulls} pulls`
                }>{(c.rate * 100).toFixed(3)}%</td>
                <td title={getName(c, gachaTargets) == "Not owned" ?
                  "Chance to get nothing or higher, so basically always 100%" :
                  `Chance to get ${getName(c, gachaTargets)} or higher within ${pulls} pulls`
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
      <p className="pt-2">
        <i>
          <b>NOTE</b>: The 4* off-banner calculator is <b>not</b> accurate for the standard banner. In-game there&apos;s a pity system for keeping amount of 4* weapons and characters balanced. Here we assume a flat 50/50 rate between characters and weapons.
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

function getName(gt: { const: number, gachaTarget: GachaTarget }, gachaTargets: GachaTarget[]) {
  const gachaTarget = gt.gachaTarget
  if (gt.const == gachaTarget.target) {
    const nextTarget = gachaTargets.slice(gachaTargets.findIndex(gt => gt.id == gachaTarget.id) + 1).find(gt => gt.enabled)
    if (!nextTarget) return getRawName(gt, gachaTargets)
    return `${getRawName(gt, gachaTargets)} / ${getRawName({ const: nextTarget.current, gachaTarget: nextTarget }, gachaTargets)}`
  }

  if (gt.const == gachaTarget.current) {
    const prevTarget = gachaTargets.slice(0, gachaTargets.findIndex(gt => gt.id == gachaTarget.id)).reverse().find(gt => gt.enabled)
    if (!prevTarget) return getRawName(gt, gachaTargets)
    return `${getRawName({ const: prevTarget.target, gachaTarget: prevTarget }, gachaTargets)} / ${getRawName(gt, gachaTargets)}`
  }

  return getRawName(gt, gachaTargets)
}

function getRawName({ const: c, gachaTarget }: { const: number, gachaTarget: GachaTarget }, gachaTargets: GachaTarget[]) {
  const name = c == gachaTarget.banner.minConst ? "Not owned" : `${gachaTarget.banner.constFormat}${c}`
  if (gachaTargets.length == 1) return name
  const index = gachaTargets.findIndex(gt => gt.id == gachaTarget.id)
  const banner = `${gachaTarget.name ?? (index + 1)}. `
  return `${banner}${name}`
}

function GachaTargetInput({
  value,
  fallbackName,
  set,
}: {
  value: GachaTarget;
  fallbackName: string;
  set: (newValue: GachaTarget) => unknown;
}) {
  const [enabled, setEnabled] = useState(value.enabled)
  const [name, setName] = useState(value.name)
  const [current, setCurrent] = useState(value.current)
  const [target, setTarget] = useState(value.target)
  const [pity, setPity] = useState(value.pity)
  const [guaranteed, setGuaranteed] = useState(value.guaranteed)
  const [guaranteedPity, setGuaranteedPity] = useState(value.guaranteedPity)
  const [lostPity, setLostPity] = useState(value.lostPity)
  const [guaranteedRate, setGuaranteedRate] = useState(value.guaranteedRate)

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
    else if (enabled != value.enabled) {}
    else if (name != value.name) {}
    else if (current != value.current) {}
    else if (target != value.target) {}
    else if (pity != value.pity) {}
    else if (guaranteed != value.guaranteed) {}
    else if (guaranteedPity != value.guaranteedPity) {}
    else if (lostPity != value.lostPity) {}
    else if (guaranteedRate != value.guaranteedRate) {}
    else return

    set({
      id: value.id,
      name,
      enabled,
      banner,
      current,
      target,
      pity,
      guaranteed,
      guaranteedPity,
      lostPity,
      guaranteedRate
    })
  }, [set, value, enabled, name, banner, current, target, pity, guaranteed, guaranteedPity, lostPity, guaranteedRate])
  return <div>
    <CheckboxInput label="Enabled" set={setEnabled} value={enabled} />
    <TextInput label="Name" set={setName} value={name ?? ""} placeholder={fallbackName} />
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
    {!Number.isFinite(banner.guaranteed) && (
      <NumberInput label="Available 4* star count in banner" set={setGuaranteedRate} value={guaranteedRate} min={0} max={banner.guaranteed}/>
    )}
  </div>
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

function TextInput({ value, set, label, placeholder }: {
  value: string;
  set: (newValue: string) => unknown;
  label: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label>
        {label}
        <input
          className="bg-slate-200 dark:bg-slate-800 rounded-lg px-2 ml-2 mt-1 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={placeholder}
          value={value}
          onChange={(e) => set(e.target.value)}
          type="text"
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
    rate,
  }
}

function calcSimsRegular(
  pulls: number,
  gachaTargets: GachaTarget[],
): ReducedSim[][] {
  console.log("calcSimsRegular", pulls, gachaTargets)
  if (gachaTargets.length == 0) return []

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
        (sim.guaranteed ||
        (banner.guaranteedPity && sim.guaranteedPity >= banner.guaranteedPity - 1)) && banner.canGuarantee
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

      const bannerGuaranteedRate = Number.isFinite(banner.guaranteed) ? banner.guaranteed : (1 / gachaTarget.guaranteedRate)
      // Got wanted banner item
      addOrMerge({
        gachaTargetIndex: sim.gachaTargetIndex,
        gachaTarget: sim.gachaTarget,
        pity: 0,
        guaranteed: false,
        guaranteedPity: 0,
        lostPity: sim.guaranteed ? sim.lostPity : 0, // Keep lost pity if it was guaranteed, otherwise we won 50/50
        const: sim.const + 1,
        rate: sim.rate * rate * bannerRate * bannerGuaranteedRate,
      })

      // Got banner item but not wanted (eg. wrong rate up 4* char/5* char)
      if (bannerGuaranteedRate < 1)
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
            rate: sim.rate * rate * bannerRate * (1 - bannerGuaranteedRate),
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
            rate: sim.rate * rate * bannerRate * (1 - bannerGuaranteedRate),
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
