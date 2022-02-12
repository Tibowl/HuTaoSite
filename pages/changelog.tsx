import Head from "next/head"
import Main from "../components/Main"
import FormattedLink from "../components/FormattedLink"
import { GetStaticPropsContext, GetStaticPropsResult } from "next"
import gitRawCommits from "git-raw-commits"

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
        Check out the full <FormattedLink href="https://github.com/Tibowl/HuTao/commits/master" location={location}>commit history on GitHub</FormattedLink> for the Discord bot / game data.
        This page shows 100 most recent bot / game data commits and fills in website commits since the oldest one.
      </div>

      <h2 className="text-3xl font-bold pb-2">
        Commits
      </h2>

      {commits.map((commit, i, arr) => <Commit key={commit.hash} commit={commit} prev={arr[i - 1]} />)}

    </Main>
  )
}

function Commit({ commit, prev }: { commit: CommitData, prev?: CommitData }) {
  const child = <span>{commit.message}</span>
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

    <div className="pl-4">
      <span>
        [{date.toLocaleString("en-UK", { hour: "2-digit", minute: "2-digit" })}] {commit.type}:{" "}
      </span>

      {commit.type == "Bot/Data" ? <FormattedLink href={`https://github.com/Tibowl/HuTao/commit/${commit.hash}`} target="_blank">{child}</FormattedLink> : child}
    </div>
  </>
}

export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> {
  const res = await fetch("https://api.github.com/repos/Tibowl/HuTao/commits?per_page=100")
  const data = await res.json()
  const bot: CommitData[] = data.map((commit: any) => {
    return {
      hash: commit.sha,
      timestamp: new Date(commit.commit.committer.date).getTime(),
      message: commit.commit.message.split("\n")[0].trim(),
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
      message: split.join("|").split("\n")[0].trim(),
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
