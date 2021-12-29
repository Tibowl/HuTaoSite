import { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import ReactMarkdown from "react-markdown"
import FormattedLink from "../../components/FormattedLink"
import Main from "../../components/Main"
import { getGuides, urlify } from "../../utils/data-cache"
import { Guide } from "../../utils/types"

interface Props {
  guide: Guide
}

export default function GuidePage({ guide, location }: Props & { location: string }) {
  return (
    <Main>
      <Head>
        <title>{guide.name} | Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content={`${guide.name} | Hu Tao`} />
        <meta property="og:description" content={`View ${guide.name} routes`} />
      </Head>
      <h1 className="text-3xl font-bold">
        {guide.name}
      </h1>
      <ul>
        {guide.pages.map(p => (<li key={p.name} id={urlify(p.name, true)}>
          <FormattedLink href={`#${urlify(p.name, true)}`} location={location} font="semibold" size="2xl">
            <h2 className="text-2xl font-semibold">{p.name}</h2>
          </FormattedLink>
          <ReactMarkdown>{(p.desc?.replace(/ ?\$\{.*?\}/g, "") ?? "")}</ReactMarkdown>

          {p.img && <ExternalImg src={p.img}/>}
        </li>))}
      </ul>
    </Main>
  )
}
function ExternalImg({ src }: {src: string}) {
  // eslint-disable-next-line @next/next/no-img-element
  return <FormattedLink href={src}><img className="p-1 relative max-w-2xl max-h-96" decoding="async" alt="Guide Image" src={src} /></FormattedLink>
  // return <div className="p-1 relative max-w-2xl">
  //   <Image alt="Guide Image" src={src} width={825} height={963}/>
  // </div>
}

export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> {
  const guideName = context.params?.guide
  const data = await getGuides()

  const guide = data?.find(g => urlify(g.name) == guideName)
  if (!data || !guide) {
    return {
      notFound: true,
      revalidate: 5 * 60
    }
  }

  return {
    props: {
      guide
    },
    revalidate: 60 * 60
  }
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const data = await getGuides()
  return {
    paths: data?.map(g => ({
      params: { guide: urlify(g.name) }
    })) ?? [],
    fallback: "blocking"
  }
}
