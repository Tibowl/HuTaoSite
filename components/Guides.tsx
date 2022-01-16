import FormattedLink from "./FormattedLink"

export default function Guides({ guides }: { guides: string[][] }) {
    const multiple = guides.length > 1

    return <>
        <h3 className="text-lg font-bold pt-1" id="guides">{multiple ? "Guides" : "Guide"}:</h3>
        {guides.map(([name, link]) => <div key={name}>
            <FormattedLink href={link}>{name}</FormattedLink>
        </div>)}
    </>
}
