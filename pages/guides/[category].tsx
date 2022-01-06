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

export default function CategoryWebpage({ guide, location }: Props & { location: string }) {
  return (
    <Main>
      <Head>
        <title>{guide.name} | Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content={`${guide.name} | Hu Tao`} />
        <meta property="og:description" content={`View ${guide.name} guides`} />
      </Head>
      <h1 className="text-3xl font-bold">
        {guide.name}
      </h1>
      <ul>
        {guide.pages.map(p => (<li key={p.name} id={urlify(p.name, false)}>
          <h2 className="text-2xl font-semibold">
            <FormattedLink href={`${urlify(guide.name, false)}/${urlify(p.name, true)}`} location={location} font="semibold" size="2xl">
              {p.name}
            </FormattedLink>
          </h2>
        </li>))}
      </ul>
    </Main>
  )
}

export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> {
  const categoryName = context.params?.category
  const data = await getGuides()

  const category = data?.find(g => urlify(g.name, false) == categoryName)
  if (!data || !category) {
    return {
      notFound: true,
      revalidate: 5 * 60
    }
  }

  return {
    props: {
      guide: category
    },
    revalidate: 60 * 60
  }
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const data = await getGuides()
  return {
    paths: data?.map(g => ({
      params: { category: urlify(g.name, false) }
    })) ?? [],
    fallback: "blocking"
  }
}
