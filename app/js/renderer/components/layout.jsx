import React from 'react'
import { observer, trackComponents, renderReporter } from 'mobx-react'

import MainActions from './../store/mainActions'

import MenuBar from './menubar'
import ToolBar from './toolbar'
import Viewer from './viewer'

@observer
export default class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dropable: false,
      dropFiles: [],
      dropType: ''
    }
  }

  componentWillMount() {
    MainActions.start();
    document.body.ondragenter = this.onDragEnter;
    document.body.ondrop = this.onDrop;
    document.body.ondragleave = this.onDragLeave;
  }

  onDragEnter = (event) => {
    const { dataTransfer } = event;
    const { files } = dataTransfer;
    let dropFiles = [];
    let dropType = '';
    for (let i = 0; i < files.length; i++) {
      const { name, path, type } = files[i];
      if (type === 'application/javascript') {
        dropType = 'plugin';
        dropFiles.push(path);
      } else if (name === 'Game.rpgproject') {
        dropFiles = [path];
        dropType = 'project';
        break;
      }
    }
    this.setState({
      dropable: dropFiles.length > 0,
      dropFiles,
      dropType
    })
    event.preventDefault();
    return false;
  }

  onDragLeave = () => {
    this.setState({
      dropable: false,
      dropFiles: [],
      dropType: ''
    })
    return false;
  }

  onDrop = (event) => {
    if (this.state.dropable) {
      // TODO: complete this
      console.log(this.state.dropFiles);
    }
    event.preventDefault();
    return false;
  }

  render() {
    const { store } = this.props;
    return (
      <div className="fill">
        <MenuBar
          projectPath={store.state.projectPath}
          theme={store.state.theme}
        />
        <ToolBar
          plugins={store.plugins}
          selected={store.state.selected}
          category={store.state.category}
          sort={store.state.sort}
        />
        <Viewer current={store.current} />
      </div>
    )
  }
}
