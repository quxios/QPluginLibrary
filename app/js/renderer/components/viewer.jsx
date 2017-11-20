import React from 'react'
import { observer } from 'mobx-react'
import Marked from 'marked'
import Axios from 'axios'

import Tooltips from './../store/tooltips'
import PluginActions from './../store/pluginActions'

let URL_CACHE = {};

@observer
export default class Viewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formatted: true
    }
  }

  makeBody(plugin) {
    if (!plugin) {
      return '';
    }
    const {
      name,
      author,
      site,
      version,
      help,
      parsedHelp,
      updateStatus
    } = plugin;
    let update = '';
    const outdated = /^outdated:(.*)/.exec(updateStatus)
    if (outdated) {
      update = `| [New version available](${outdated})`
    }
    if (updateStatus === 'error') {
      update = '| Failed to connect to update server';
    }
    let string = `# ${name}\n`;
    if (site) {
      string += `## [Author: ${author}](${site} "Visit authors site")\n`;
    } else {
      string += `## Author: ${author}\n`;
    }
    string += `## Version: ${version} ${update}\n\n`;
    if (this.state.formatted) {
      string += parsedHelp;
      return Marked(string);
    } else {
      string += help;
      string = string.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
      return `<pre>${string}</pre>`;
    }
  }

  toggleFormat = () => {
    this.setState({
      formatted: !this.state.formatted
    })
  }

  render() {
    const { current } = this.props;
    const { formatted } = this.state;
    const cls = formatted ? 'formatted' : '';
    const title = formatted ? Tooltips.viewUnformatted : Tooltips.viewFormat;
    return (
      <div className="viewer">
        <button className={cls} onClick={this.toggleFormat} title={title}>
          Format
        </button>
        <div className="help" dangerouslySetInnerHTML={{ __html: this.makeBody(current) }} />
      </div>
    )
  }
}
