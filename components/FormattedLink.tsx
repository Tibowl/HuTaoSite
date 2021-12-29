import Link from "next/link"
import { ForwardedRef, forwardRef } from "react"


const Wrapped = forwardRef(function FLink({ children, onClick, href, font = "semibold", size = "xl", className = "", location }: any, innerRef: ForwardedRef<HTMLAnchorElement>) {
    let colors = "text-blue-800 dark:text-blue-100 hover:text-blue-500 dark:hover:text-blue-400"
    if (href == location)
        colors = "text-blue-600 dark:text-blue-400 hover:text-blue-400 dark:hover:text-blue-500"
    else if (location?.startsWith(href) && href != "/")
        colors = "text-blue-700 dark:text-blue-300 hover:text-blue-400 dark:hover:text-blue-400"

    return (
        <a ref={innerRef} className={`${className} text-${size} font-${font} no-underline transition-all duration-200 ${colors}`} onClick={onClick} href={href} >
            {children}
        </a>
    )
})

function FormattedLink({ children, href, font = "semibold", size = "xl", className = "", location }: any) {
    return (
        <Link href={href} passHref><Wrapped font={font} size={size} location={location} className={className}>{children}</Wrapped></Link>
    )
}

export default FormattedLink
