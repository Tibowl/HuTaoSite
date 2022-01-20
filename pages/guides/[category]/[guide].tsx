import { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import ReactMarkdown from "react-markdown"
import FormattedLink from "../../../components/FormattedLink"
import Main from "../../../components/Main"
import YouTube from "../../../components/YouTube"
import { getGuides } from "../../../utils/data-cache"
import { Guide } from "../../../utils/types"
import { clean, removeBrackets, urlify } from "../../../utils/utils"
import styles from "../../style.module.css"

interface Props {
  guide: Guide
  pageNumber: number
}

export default function GuideWebpage({ guide, pageNumber, location }: Props & { location: string }) {
  const page = guide.pages[pageNumber]
  const nextPage = guide.pages[pageNumber + 1]
  const prevPage = guide.pages[pageNumber - 1]

  return (
    <Main>
      <Head>
        <title>{page.name} | Hu Tao</title>
        <meta name="twitter:card" content={page.img ? "summary_large_image" : "summary"} />
        <meta property="og:title" content={`${page.name} | Hu Tao`} />
        <meta property="og:description" content={`View ${page.name} guide by ${page.credits}${page.url && page.url.startsWith("https://youtu.be/") ? " (video available!)" : ""}. ${page.desc ? clean(page.desc) : ""}`} />
        {page.img && <meta property="og:image" content={page.img} />}
      </Head>
      <h2 className="font-semibold">
        <FormattedLink href={`/guides/${urlify(guide.name, false)}`} location={location} className="font-semibold text-lg">
          {guide.name}
        </FormattedLink>
      </h2>

      <h1 className="text-3xl font-bold">
        {page.name}
      </h1>

      <div className="flex justify-between text-base">
        <div className="px-1">
          {prevPage && <FormattedLink href={`/guides/${urlify(guide.name, false)}/${urlify(prevPage.name, true)}`} location={location} className="font-bold text-lg">
            &larr; {removeBrackets(prevPage.name)}
          </FormattedLink>}
        </div>

        <div>
          {nextPage &&
            <FormattedLink href={`/guides/${urlify(guide.name, false)}/${urlify(nextPage.name, true)}`} location={location} className="font-bold text-lg">
              {removeBrackets(nextPage.name)} &rarr;
            </FormattedLink>}
        </div>
      </div>

      <div>
        <ReactMarkdown>{(page.desc?.replace(/ ?\$\{.*?\}/g, "") ?? "")}</ReactMarkdown>
        {page.img && <ExternalImg src={page.img} />}
        <div className="float-right text-sm">By {page.credits}</div>
        {page.url && page.url.startsWith("https://youtu.be/") && <div>
          <h2 className="text-xl font-semibold py-1">Video:</h2>
          <YouTube vidID={page.url.replace("https://youtu.be/", "")} />
        </div>
        }
      </div>
    </Main>
  )
}
function ExternalImg({ src }: { src: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <FormattedLink href={src} target="_blank"><img className={`p-1 relative ${styles.autosize}`} decoding="async" alt="Guide Image" src={src} /></FormattedLink>
  // return <div className="p-1 relative max-w-2xl">
  //   <Image alt="Guide Image" src={src} width={825} height={963}/>
  // </div>
}

export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> {
  const guideName = context.params?.guide
  const categoryName = context.params?.category
  const data = await getGuides()

  const guide = data?.find(g => urlify(g.name, false) == categoryName)
  const pageNumber = guide?.pages?.findIndex(g => urlify(g.name, true) == guideName)

  if (!data || !guide || pageNumber === undefined || pageNumber === -1) {
    return {
      notFound: true,
      revalidate: 5 * 60
    }
  }

  return {
    props: {
      guide, // TODO optimize
      pageNumber
    },
    revalidate: 60 * 60
  }
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const data = await getGuides()
  return {
    paths: data?.flatMap(category => category.pages.map(p => ({
      params: { guide: urlify(p.name, true), category: urlify(category.name, false) }
    }))) ?? [],
    fallback: "blocking"
  }
}
