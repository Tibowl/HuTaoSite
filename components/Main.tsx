import { Component } from "react"
import ReactGA from "react-ga"

const gaTracking = "G-BCG8V6RVPL"
export default class Main extends Component<{className?: string, homePage?: true}> {

  componentDidMount() {
    if (!(window as {GA_INITIALIZED?: boolean}).GA_INITIALIZED) {
      ReactGA.initialize(gaTracking, { debug: false });
      (window as {GA_INITIALIZED?: boolean}).GA_INITIALIZED = true
    }

    ReactGA.set({ page: window.location.pathname })
    ReactGA.pageview(window.location.pathname)
  }

  render() {
    const classes =
      (!this.props.homePage ? "max-w-6xl w-full" : "") +
      (this.props.className ?? "")

    return (
      <main className={classes}>
        {this.props.children}
      </main>
    )
  }
}
