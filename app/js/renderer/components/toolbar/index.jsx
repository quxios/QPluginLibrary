import React from 'react'
import { observer } from 'mobx-react'

import Tooltips from './../../store/tooltips'
import ToolbarActions from './../../store/toolbarActions'

import PluginList from './pluginList'

@observer
export default class ToolBar extends React.Component {
  setCategory = (event) => {
    let clicked = event.target.textContent.toLowerCase().trim();
    ToolbarActions.setCategory(clicked);
  }

  render() {
    const { plugins, selected, category, sort } = this.props;
    const categoryA = category === 'library';
    const categoryB = category === 'project';
    const categoryC = category === 'all';
    const clsLibrary = 'left tab ' + (categoryA ? 'selected' : '');
    const clsProject = 'left tab ' + (categoryB ? 'selected' : '');
    const clsAll = 'left tab ' + (categoryC ? 'selected' : '');
    const {
      libraryList,
      projectList,
      allList
    } = Tooltips;
    return (
      <div className="toolBar">
        <div className="categories">
          <div className={clsLibrary} onClick={this.setCategory} title={libraryList}>
            Library
          </div>
          <div className={clsProject} onClick={this.setCategory} title={projectList}>
            Project
          </div>
          <div className={clsAll} onClick={this.setCategory} title={allList}>
            All
          </div>
        </div>
        <div className="listContainer">
          {categoryA && <PluginList mode="library" list={plugins.library} selected={selected} />}
          {categoryB && <PluginList mode="project" list={plugins.project} selected={selected} />}
          {categoryC && <PluginList mode="all" list={plugins.all} selected={selected} />}
        </div>
      </div>
    )
  }
}