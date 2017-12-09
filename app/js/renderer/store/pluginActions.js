import Store from './index'

import { remote } from 'electron'
import { action } from 'mobx'
import Axios from 'axios'
import fs from 'fs'
import path from 'path'
import chokidar from 'chokidar'

import { getPluginData } from './pluginData'

const INSTALL_FOLDER = path.join(remote.app.getPath('userData'), 'plugins');
export { INSTALL_FOLDER }

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

export default new class PluginActions {
  watcher;
  urlCache = {};
  cacheExpire = 60000; // 1min

  @action.bound
  loadInstalled() {
    if (!fs.existsSync(INSTALL_FOLDER)) {
      fs.mkdir(INSTALL_FOLDER);
      return;
    }
    fs.readdir(INSTALL_FOLDER, (err, files) => {
      if (!err) {
        const { plugins } = Store.state;
        files.map((filePath) => {
          return path.join(INSTALL_FOLDER, filePath);
        }).forEach((pluginPath) => {
          getPluginData(pluginPath, (err, plugin, pluginFile) => {
            if (err) {
              console.error(err);
            } else {
              plugins.set(plugin.name, plugin);
              this.checkForUpdate(plugins.get(plugin.name));
            }
          })
        })
      }
    });
  }

  @action.bound
  uninstallPlugin(plugin) {
    if (Store.state.plugins.delete(plugin.name)) {
      const filePath = path.join(INSTALL_FOLDER, `${plugin.name}.js`);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(err);
        }
      })
    } else {
      console.error(`Failed to uninstall "${plugin.name}"`);
    }
  }

  @action.bound
  installPlugins(paths) {
    const { plugins } = Store.state;
    paths.forEach((pluginPath) => {
      getPluginData(pluginPath, (err, plugin, pluginFile) => {
        if (err) {
          console.error(err);
        } else if (plugins.has(plugin.name)) {
          console.warn('This plugin is already installed, replace?');
        } else {
          plugins.set(plugin.name, plugin);
          this.checkForUpdate(plugins.get(plugin.name));
          const savePath = path.join(INSTALL_FOLDER, `${plugin.name}.js`);
          fs.writeFile(savePath, pluginFile, (writeErr) => {
            if (writeErr) {
              console.error(writeErr);
            }
          })
        }
      })
    })
  }

  @action.bound
  loadProjectPlugins(filePath) {
    if (Store.state.loadingProject) {
      return;
    }
    this.clearWatcher();
    const projectPath = path.dirname(filePath);
    const pluginsFolder = path.join(projectPath, './js/plugins');
    const plugins = path.join(projectPath, './js/plugins.js');
    Store.state.loadingProject = true;
    let pluginList;
    try {
      pluginList = fs.readFileSync(plugins, 'utf8').split('\n');
      pluginList.splice(0, 3);
      pluginList = pluginList.join('\n').replace('];', ']');
      pluginList = JSON.parse(pluginList).map((plugin) => {
        return path.join(pluginsFolder, `${plugin.name}.js`);
      })
    } catch (error) {
      console.error(error);
      return;
    }
    this.startWatching(plugins);
    if (Store.state.projectPath !== projectPath && Store.state.category === 'project') {
      Store.state.selected = '';
    }
    Store.state.projectPath = projectPath;
    let loaded = 0;
    let newProjectPlugins = new Map();
    pluginList.forEach((pluginPath, i) => {
      getPluginData(pluginPath, function(i, err, pluginData) {
        if (!err) {
          let key = pluginData.name;
          let ui = 0;
          while (newProjectPlugins.get(key + ui)) {
            ui++;
          }
          key += ui;
          pluginData.index = i;
          newProjectPlugins.set(key, pluginData);
          this.startWatching(pluginData.path);
        }
        if (++loaded === pluginList.length) {
          Store.state.projectPlugins.replace(newProjectPlugins);
          Store.state.loadingProject = false;
          this.checkAllForUpdate();
        }
      }.bind(this, i))
    })
  }

  @action.bound
  reloadProjectPlugin(filePath) {
    let projectPlugins = Store.state.projectPlugins;
    const key = path.basename(filePath, '.js');
    getPluginData(filePath, function(err, pluginData) {
      if (err) {
        console.error(`Failed to get plugin data from: ${pluginData.name}`);
        return;
      }
      let key = pluginData.name;
      let ui = 0;
      let current = projectPlugins.get(key + ui);
      while (current) {
        pluginData.index = current.index;
        projectPlugins.set(key + ui, pluginData);
        ui++;
        current = projectPlugins.get(key + ui);
      }
    })
  }

  clearWatcher() {
    if (this.watcher) {
      this.watcher.close();
    }
    this.watcher = null;
  }

  setupWatcher() {
    this.watcher = chokidar.watch([], {
      disableGlobbing: true
    })
    this.watcher.on('change', (filePath) => {
      if (/\js(\/|\\)plugins\.js$/.test(filePath)) {
        this.loadProjectPlugins(path.join(Store.state.projectPath, 'Game.rpgproject'));
      } else {
        this.reloadProjectPlugin(filePath);
      }
    })
  }

  startWatching(files) {
    if (!this.watcher) {
      this.setupWatcher();
    }
    this.watcher.add(files);
  }

  stopWatching(files) {
    if (!this.watcher) {
      return;
    }
    this.watcher.unwatch(files);
  }

  @action.bound
  async checkAllForUpdate() {
    this.urlCache = {};
    let allPlugins = [
      ...Store.state.plugins,
      ...Store.state.projectPlugins
    ]
    allPlugins.forEach((plugin) => {
      this.checkForUpdate(plugin, true);
    })
    while (true) {
      await wait(100);
      let completed = true;
      for (let i = 0; i < allPlugins.length; i++) {
        if (allPlugins[i].updateStatus === 'loading') {
          completed = false;
          break;
        }
      }
      if (completed) break;
    }
  }

  @action.bound
  checkForUpdate(plugin) {
    // Pass in the oberservable plugin data, not the raw plugin data
    const { updateurl, updateStatus } = plugin;
    if (!updateurl || updateStatus === 'loading') {
      return;
    }
    const ext = path.extname(updateurl);
    if (ext !== '.json') {
      console.warn(`Invalid updateurl in ${plugin.name}`);
      return;
    }
    const cache = this.urlCache[updateurl];
    plugin.updateStatus = 'loading';
    if (!cache || Date.now() - cache.time > this.expire) {
      this.urlCache[updateurl] = {
        isReady: false,
        time: Date.now(),
        queue: cache ? [...cache.queue, plugin] : [plugin]
      }
      Axios.get(updateurl)
        .then((res) => {
          this.urlCache[updateurl].data = res.data;
          this.urlCache[updateurl].isReady = true;
          this.urlCache[updateurl].queue.forEach((plugin) => {
            this.compareVersion(plugin, res.data);
          })
          this.urlCache[updateurl].queue = [];
        })
        .catch((err) => {
          console.error(err);
          this.urlCache[updateurl].isReady = true;
          this.urlCache[updateurl].queue.forEach((plugin) => {
            plugin.updateStatus = 'error';
          })
          this.urlCache[updateurl].queue = [];
        })
    } else if (!cache.isReady) {
      cache.queue.push(plugin);
    } else if (cache.data) {
      this.compareVersion(plugin, cache.data);
    }
  }

  @action.bound
  compareVersion(plugin, data) {
    plugin.updateStatus = 'ok';
    const target = this.findTarget(plugin, data);
    if (!target) {
      return;
    }
    const a = plugin.version.split('.').map(Number);
    const b = String(target.version).split('.').map(Number);
    const l = Math.min(a.length, b.length);
    let value = 0;
    for (let i = 0; i < l; i++) {
      if (a[i] < b[i]) {
        value = -1;
        break;
      }
      if (a[i] > b[i]) {
        value = 1;
        break;
      }
    }
    if (a.length < b.length) {
      value = -1;
    }
    if (a.length > b.length) {
      value = 1;
    }
    if (value === -1) {
      plugin.updateStatus = `outdated:${target.download}`;
    }
  }

  findTarget(plugin, data) {
    let target;
    if (data.constructor === Array) {
      for (let i = 0; i < data.length; i++) {
        if (data[i] && data[i].name === plugin.name) {
          target = data[i];
          break;
        }
      }
    } else if (data.constructor === Object) {
      target = data[plugin.name];
    }
    return target;
  }
}