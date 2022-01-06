import { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import ReactMarkdown from "react-markdown"
import FormattedLink from "../../../components/FormattedLink"
import Main from "../../../components/Main"
import { getGuides, urlify, yeetBrackets } from "../../../utils/data-cache"
import { Guide, GuidePage } from "../../../utils/types"
import YouTube from "react-youtube"

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
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content={`${page.name} | Hu Tao`} />
        <meta property="og:description" content={`View ${page.name} guide`} />
      </Head>
      <h2 className="font-semibold">
        <FormattedLink href={`/guides/${urlify(guide.name, false)}`} location={location} font="semibold" size="lg">
          {guide.name}
        </FormattedLink>
      </h2>

      <h1 className="text-3xl font-bold">
        {page.name}
      </h1>

      <div className="flex justify-between text-base">
        <div className="px-1">
          {prevPage && <FormattedLink href={`/guides/${urlify(guide.name, false)}/${urlify(prevPage.name, true)}`} location={location} font="bold" size="lg">
            &larr; {yeetBrackets(prevPage.name)}
          </FormattedLink>}
        </div>

        <div>
          {nextPage &&
            <FormattedLink href={`/guides/${urlify(guide.name, false)}/${urlify(nextPage.name, true)}`} location={location} font="bold" size="lg">
              {yeetBrackets(nextPage.name)} &rarr;
            </FormattedLink>}
        </div>
      </div>

      <ul>
        <ReactMarkdown>{(page.desc?.replace(/ ?\$\{.*?\}/g, "") ?? "")}</ReactMarkdown>
        {page.img && <ExternalImg src={page.img} />}
        {page.url && page.url.startsWith("https://youtu.be/") && <div>
          <h2 className="text-xl font-semibold pt-1">Video:</h2>
          <YouTube videoId={page.url.replace("https://youtu.be/", "")} containerClassName="w-xl" className="w-xl" />
        </div>
        }
      </ul>
    </Main>
  )
}
function ExternalImg({ src }: { src: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <FormattedLink href={src} target="_blank"><img className="p-1 relative max-w-4xl" style={{ maxHeight: "56rem" }} decoding="async" alt="Guide Image" src={src} /></FormattedLink>
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
      guide,
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
