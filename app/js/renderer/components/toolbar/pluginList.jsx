import React from 'react'
import { observer } from 'mobx-react'

import ToolbarActions from './../../store/toolbarActions'
import PluginListItem from './pluginListItem'

@observer
export default class PluginList extends React.Component {
  onSelect = (key) => {
    ToolbarActions.select(key);
  }
  render() {
    const { list, mode, selected } = this.props;
    return (
      <ul className="pluginList">
        {list.map((plugin, i) => {
          const key = `list/${mode}/${plugin.name}/${i}`;
          return (
            <PluginListItem
              key={key} id={key}
              mode={mode}
              plugin={plugin}
              selected={selected}
              onSelect={this.onSelect}
            />
          )
        })}
      </ul>
    )
  }
}