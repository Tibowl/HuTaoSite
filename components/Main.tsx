import { Component } from "react"

export default class Main extends Component<{className?: string, homePage?: true}> {
  render() {
    const classes =
      (!this.props.homePage ? "max-w-5xl w-full px-1" : "") +
      (this.props.className ?? "")

    return (
      <main className={classes}>
        {this.props.children}
      </main>
    )
  }
}
