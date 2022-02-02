import { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import FormattedLink from "../../components/FormattedLink"
import Main from "../../components/Main"
import { getGuides } from "../../utils/data-cache"
import { Guide } from "../../utils/types"
import { urlify } from "../../utils/utils"

interface Props {
  guide: Guide
}

export default function CategoryWebpage({ guide, location }: Props & { location: string }) {
  const desc = `View ${guide.pages.length} ${guide.name} guides`
  return (
    <Main>
      <Head>
        <title>{guide.name} | Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content={`${guide.name} | Hu Tao`} />
        <meta property="og:description" content={desc} />
        <meta property="description" content={desc} />
      </Head>
      <h2 className="font-semibold">
        <FormattedLink href="/guides/" location={location} className="font-semibold text-lg">
          Guides
        </FormattedLink>
      </h2>

      <h1 className="text-4xl font-bold pb-2">
        {guide.name}
      </h1>

      <ul>
        {guide.pages.map(p => (<li key={p.name}>
          -{" "}
          <FormattedLink href={`/guides/${urlify(guide.name, false)}/${urlify(p.name, true)}`} location={location} className="font-semibold text-xl">
            {p.name}
          </FormattedLink>
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
      revalidate: 15 * 60
    }
  }

  return {
    props: {
      guide: category // TODO optimize
    },
    revalidate: 60 * 60 * 1
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
