import React from 'react'
import { observer } from 'mobx-react'
import { shell } from 'electron'

import Tooltips from './../../store/tooltips'
import ToolbarActions from './../../store/toolbarActions'
import PluginActions from './../../store/pluginActions'
import Icon from './../icon'

@observer
export default class PluginListItem extends React.Component {
  onClick = (e) => {
    const { id, onSelect } = this.props;
    if (onSelect) {
      onSelect(id);
    }
  }

  openUpdate = (url) => {
    shell.openExternal(url);
  }

  onUninstall = (e) => {
    e.stopPropagation();
    const { plugin } = this.props;
    PluginActions.uninstallPlugin(plugin);
  }

  onInstall = (e) => {
    e.stopPropagation();
  }

  buttons() {
    const { mode } = this.props;
    const { installPlugin, uninstallPlugin } = Tooltips;
    let title, onClick, icon;
    if (mode === "library") {
      title = uninstallPlugin;
      onClick = this.onUninstall;
      icon = 'minus';
    } else if (mode === "project") {
      title = installPlugin;
      onClick = this.onInstall;
      icon = 'add';
      // TODO: finish this
      return;
    } else {
      return;
    }
    return (
      <div className={`pluginAddSub ${mode}`} title={title} onClick={onClick}>
        <Icon icon={icon} />
      </div>
    )
  }

  updateStatus(status) {
    const updateLoading = status === 'loading';
    const updateNeeded = /^outdated:(.*)/.exec(status);
    const updateTitle = updateNeeded ? Tooltips.updateNeeded : '';
    const onUpdate = (e) => {
      if (this.updateNeeded) {
        this.openUpdate(this.updateNeeded[0]);
      }
      e.stopPropagation();
    }
    return (
      <div className="updateStatus" title={updateTitle} onClick={onUpdate}>
        {updateLoading && <Icon icon="spinner fa-spin" />}
        {updateNeeded && <Icon icon="external-link-square" />}
      </div>
    )
  }

  render() {
    const { plugin, id, selected } = this.props;
    const { updateStatus } = plugin;
    const cls = 'item ' + (selected === id ? 'selected' : '');
    return (
      <li className={cls} onClick={this.onClick}>
        {plugin.name}
        {this.buttons()}
        {this.updateStatus(updateStatus)}
      </li>
    )
  }
}