// @flow
//https://github.com/hlomzik/react-blinking-title

import * as React from 'react'

type Props = {
  title: string,
  interval?: number,
}

class BlinkingTitle extends React.Component<Props> {
  static defaultProps = {
    interval: 500,
  }

  componentDidMount() {
    this.changeTitle()
  }

  componentWillUnmount() {
    if (document.title === this.props.title) {
      document.title = this.title
    }
    if (this.id) window.clearTimeout(this.id)
  }

  id: number = 0
  title: string = document.title

  changeTitle = () => {
    if (document.title !== this.props.title) {
      this.title = document.title
      document.title = this.props.title
    } else {
      document.title = this.title
    }
    this.id = window.setTimeout(this.changeTitle, this.props.interval)
  }

  render() {
    return null
  }
}

export default BlinkingTitle