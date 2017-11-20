import React from 'react'
import { observer } from 'mobx-react'
import { shell } from 'electron'

import Tooltips from './../../store/tooltips'
import { INSTALL_FOLDER } from './../../store/pluginActions'

import ThemeButtons from './themeButtons'

@observer
export default class Options extends React.Component {
  onClick = (e) => {
    e.stopPropagation();
  }

  onFolder = () => {
    shell.openItem(INSTALL_FOLDER);
  }

  render() {
    const { theme } = this.props;
    const { folder } = Tooltips
    return (
      <div className="options" onClick={this.onClick}>
        <div>Theme</div>
        <ThemeButtons theme={theme} />
        <a onClick={this.onFolder} title={folder}>
          Folder
        </a>
        <br />
      </div>
    )
  }
}