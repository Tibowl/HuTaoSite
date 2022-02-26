import FormattedLink from "./FormattedLink"

export default function Footer({ location, marginBottom }: { location: string, marginBottom?: number }) {
    return <footer className="flex flex-col items-center justify-center w-full border-t text-center" style={({ marginBottom: marginBottom && `${marginBottom}px` })}>
        <div className="flex items-center justify-center">
            © All rights reserved by miHoYo. Other properties belong to their respective owners.
        </div>
        <div className="flex items-center justify-center gap-4">
            <FormattedLink href="/privacy-policy" location={location}>Privacy Policy</FormattedLink>
            <FormattedLink href="/changelog" location={location}>Changelog</FormattedLink>
            <FormattedLink href="https://discord.gg/BM3Srp8j8G" location={location} target="discord-invite"> Discord Support Server</FormattedLink>
        </div>
    </footer>
}
