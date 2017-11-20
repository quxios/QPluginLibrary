import React from 'react'
import { observer } from 'mobx-react'
import { remote, ipcRenderer } from 'electron'

import Tooltips from './../../store/tooltips'
import PluginActions from './../../store/pluginActions'

import Icon from './../icon'
import Options from './options'

@observer
export default class MenuBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showOptions: false,
      updating: false
    }
  }

  onOpenProject = () => {
    remote.dialog.showOpenDialog({
      title: 'Open Project',
      defaultPath: this.props.projectPath,
      filters: [{
        name: 'RPG Maker MV Project',
        extensions: ['rpgproject']
      }]
    }, (filePaths) => {
      if (filePaths) {
        PluginActions.loadProjectPlugins(filePaths[0]);
      }
    });
  }

  onImportPlugin = () => {
    remote.dialog.showOpenDialog({
      title: 'Select plugins to import',
      buttonLabel: 'Import',
      defaultPath: this.props.projectPath,
      filters: [{
        name: 'RPG Maker MV Plugin',
        extensions: ['js']
      }],
      properties: ['openFile', 'multiSelections',]
    }, (filePaths) => {
      if (filePaths) {
        PluginActions.installPlugins(filePaths);
      }
    });
  }

  onHelp = () => {
    ipcRenderer.send('openHelp');
  }

  onOptions = () => {
    this.setState({
      showOptions: true
    })
  }

  onUpdate = () => {
    if (this.state.updating) return;
    this.setState({ updating: true });
    PluginActions.checkAllForUpdate()
      .then(() => {
        this.setState({ updating: false });
      })
  }

  hideOptions = () => {
    if (!this.state.showOptions) {
      return;
    }
    this.setState({
      showOptions: false
    })
  }

  render() {
    const {
      openProject,
      importPlugin,
      update,
      options,
      help
    } = Tooltips;
    const { updating } = this.state;
    return (
      <div className="menuBar">
        <div className="tab left" onClick={this.onOpenProject} title={openProject}>
          Open Project
        </div>
        <div className="tab left" onClick={this.onImportPlugin} title={importPlugin}>
          Import Plugin
        </div>
        <div className="tab right" onClick={this.onHelp} title={help}>
          <Icon icon="question" />
        </div>
        <div className="tab right" onClick={this.onOptions} title={options}>
          <Icon icon="cog" />
        </div>
        <div className="tab right" onClick={this.onUpdate} title={update}>
          <Icon icon={`refresh ${updating && 'fa-spin'}`} />
        </div>
        <div className="veil" onClick={this.hideOptions}>
          {this.state.showOptions && <Options theme={this.props.theme} />}
        </div>
      </div>
    )
  }
}