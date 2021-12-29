import { GetStaticPropsContext, GetStaticPropsResult } from "next"
import FormattedLink from "../../components/FormattedLink"
import Main from "../../components/Main"
import { getGuides, urlify } from "../../utils/data-cache"
import { Guide } from "../../utils/types"

interface Props {
  guides: Guide[]
}

export default function Guides(props: Props & { location: string }) {
  return (
    <Main>
      <h1 className="text-5xl font-bold">
        Guides
      </h1>
      <ul>
        {props.guides.map(g => (
          <li key={g.name}>
            -{" "}
            <FormattedLink font="semibold" size="xl" location={props.location} href={`/guides/${urlify(g.name)}`} >
              {g.name}
            </FormattedLink>
          </li>
        ))}
      </ul>
    </Main>
  )
}

export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> {
  const data = await getGuides()

  if (!data) {
    return {
      notFound: true,
      revalidate: 5 * 60
    }
  }

  return {
    props: {
      guides: data
    },
    revalidate: 60 * 60
  }
}
