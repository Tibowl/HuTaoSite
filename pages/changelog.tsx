import gitRawCommits from "git-raw-commits"
import { GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import FormattedLink from "../components/FormattedLink"
import Main from "../components/Main"

interface CommitData {
  hash: string
  timestamp: number
  message: string
  type: "Website" | "Bot/Data"
}

interface Props {
  commits: CommitData[]
}

export default function Changelog({ location, commits }: { location: string } & Props) {
  const desc = "Hu Tao's Changelog."

  return (
    <Main>
      <Head>
        <title>Changelog | Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Changelog | Hu Tao" />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
      </Head>

      <h1 className="text-5xl font-bold pb-2">
        Changelog
      </h1>

      <div>
        Check us out on GitHub! The Discord bot / game data can be found at <FormattedLink href="https://github.com/Tibowl/HuTao" location={location} target="_blank">HuTao</FormattedLink>, while the site can be found at <FormattedLink href="https://github.com/Tibowl/HuTaoSite" location={location} target="_blank">HuTaoSite</FormattedLink>.
      </div>

      <h2 className="text-3xl font-bold pb-2">
        Changes
      </h2>

      {commits.map((commit, i, arr) => <Commit key={commit.hash} commit={commit} prev={arr[i - 1]} />)}

    </Main>
  )
}

function Commit({ commit, prev }: { commit: CommitData, prev?: CommitData }) {
  const child = <span>{commit.message.split("\n").map((v, i, a) =>
    <span key={i} className={i == 0 ? "font-semibold" : "font-normal pl-4"}>
      {v}
      {i == a.length - 1 || <br />}
    </span>
  )}</span>

  const date = new Date(commit.timestamp)
  const formattedDate = date.toLocaleString("en-UK", {
    month: "long",
    day: "numeric",
  })
  const currentMonth = date.toLocaleString("en-UK", { month: "long", })

  const prevDate = prev && new Date(prev.timestamp).toLocaleString("en-UK", {
    month: "long",
    day: "numeric",
  })
  const prevMonth = prev && new Date(prev.timestamp).toLocaleString("en-UK", { month: "long", })

  return <>
    <div className="text-xl">
      {(prevMonth && prevMonth != currentMonth) && <hr className="mt-2"></hr>}
      {(prev == undefined || prevDate != formattedDate) && formattedDate}
    </div>

    <div className={`pl-4 ${commit.message.startsWith("Merge branch ") ? "opacity-50" : ""}`}>
      <span>
        [{date.toLocaleString("en-UK", { hour: "2-digit", minute: "2-digit" })}] <span className={commit.type == "Website" ? "text-blue-700 dark:text-blue-300" : "text-amber-700 dark:text-amber-300"}>{commit.type}</span>:{" "}
      </span>

      {commit.type == "Bot/Data" ? <FormattedLink href={`https://github.com/Tibowl/HuTao/commit/${commit.hash}`} target="_blank">{child}</FormattedLink> :
        commit.type == "Website" ? <FormattedLink href={`https://github.com/Tibowl/HuTaoSite/commit/${commit.hash}`} target="_blank">{child}</FormattedLink> : child}
    </div>
  </>
}

export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> {
  const res = await fetch("https://api.github.com/repos/Tibowl/HuTao/commits?per_page=100")
  const data = await res.json()

  for (let i = 2; i <= 5; i++) {
    const res2 = await fetch(`https://api.github.com/repos/Tibowl/HuTao/commits?per_page=100&sha=${data[0].sha}&page=${i}`)
    const data2 = await res2.json()
    data.push(...data2)
    if (data2.length < 100)
      break
  }

  const bot: CommitData[] = data.map((commit: any) => {
    return {
      hash: commit.sha,
      timestamp: new Date(commit.commit.committer.date).getTime(),
      message: commit.commit.message.replace(/\n\n/g, "\n").trim(),
      type: "Bot/Data"
    }
  })

  const firstCommit = new Date(Math.min(...bot.map(x => x.timestamp)))
  firstCommit.setUTCHours(0, 0, 0, 0)

  const site: CommitData[] = (await new Promise<string[]>((resolve, reject) => {
    const commits = gitRawCommits({ format: "%H|%ct|%B", since: firstCommit.toISOString() })
    const comms: string[] = []
    commits.on("data", (chunk) => comms.push(chunk.toString()))
    commits.on("close", () => resolve(comms))
    commits.on("error", () => reject())
  })).map(commit => {
    const split = commit.split("|")
    const hash = split.shift() ?? "unknown"
    const timestamp = (+(split.shift() ?? "0")) * 1000
    return {
      hash,
      timestamp,
      message: split.join("|").replace(/\n\n/g, "\n").trim(),
      type: "Website"
    }
  })


  return {
    props: {
      commits: [...bot, ...site].sort((a, b) => b.timestamp - a.timestamp)
    },
    revalidate: 60 * 60 * 2
  }
}
