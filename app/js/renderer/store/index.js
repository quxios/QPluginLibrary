import { ipcRenderer } from 'electron'
import { observable, computed } from 'mobx'

class Store {
  @observable
  state = {
    theme: '',

    plugins: new Map(),
    projectPlugins: [],

    projectPath: '',
    loadingProject: false,

    selected: '',
    category: 'library',
    sort: 'default'
  }

  @computed
  get plugins() {
    let library = [...this.state.plugins.values()];
    let project = [...this.state.projectPlugins];
    let all = [...library, ...project].sort(this.sortByName);
    switch (this.state.sort) {
      // TODO: more sory modes?
      case 'name': {
        library.sort(this.sortByName);
        project.sort(this.sortByName);
        break;
      }
      case 'default':
      default: {
        library.sort(this.sortByName);
        project.sort(this.sortByIndex);
        break;
      }
    }
    let seen = {};
    all = all.filter((plugin) => {
      const { name, version } = plugin;
      if (seen[name]) {
        return !seen[name].includes(version);
      } else {
        seen[name] = [version];
        return true;
      }
    });
    return {
      all,
      library,
      project
    }
  }

  @computed
  get current() {
    const {
      selected
    } = this.state;
    if (selected === '') {
      return null;
    }
    let key = selected.split('/').splice(1);
    key[2] = Number(key[2]);
    const arr = this.plugins[key[0]];
    let current = arr.length >= key[2] ? arr[key[2]] : null;
    if (current && current.name === key[1]) {
      return current;
    } else {
      for (let i = 0; i < arr.length; i++) {
        current = arr[i];
        if (current && current.name === key[1]) {
          return current;
        }
      }
    }
    console.warn('Failed to find selected plugin');
    return null;
  }

  sortByIndex(a, b) {
    return a.index - b.index;
  }

  sortByName(a, b) {
    var nameA = a.name.toLowerCase();
    var nameB = b.name.toLowerCase();
    return nameA < nameB ? -1 : (nameA > nameB ? 1 : 0);
  }

  getUserData(prop) {
    return ipcRenderer.sendSync('getProp', prop);
  }

  setUserData(prop, value) {
    ipcRenderer.send('setProp', prop, value);
  }
}

let store = window.Store = new Store();

export default store;