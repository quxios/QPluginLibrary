import Store from './index'
import PluginActions from './pluginActions'

import { action } from 'mobx'
import fs from 'fs'
import path from 'path'

import themes from './../style/themes'
import { themeElements } from './../style'

export default new class MainActions {
  @action.bound
  start() {
    PluginActions.loadInstalled();
    const theme = Store.getUserData('theme');
    this.changeTheme(theme);
    this.removeDropEvents();
    if (process.env.PRODUCTION === 'false') {
      this.startDev();
    }
  }

  @action.bound
  startDev() {
    fs.watch(path.join(__dirname, './../../../css'), (eventType, filename) => {
      if (eventType === 'change') {
        themeElements.forEach((theme) => {
          if (theme.rel === 'stylesheet') {
            const time = `?${Date.now()}`
            theme.href = theme.href.replace(/\?.*$/, time);
          }
        })
      }
    })
  }

  @action.bound
  removeDropEvents() {
    document.body.ondragover = document.body.ondrop = (event) => {
      event.preventDefault();
      return false;
    }
    document.body.ondragleave = document.body.ondragend = () => {
      return false;
    }
  }

  @action.bound
  changeTheme(theme) {
    // TODO: find a smoother way to change style
    let disabled = 0;
    themeElements.forEach((element) => {
      element.disabled = theme !== element.id;
      if (element.disabled) {
        disabled++;
      }
    })
    if (themeElements.length === disabled) {
      console.warn(`Attempted to apply a theme that isn't registered: ${theme}`);
      themeElements[0].disabled = false;
    }
    Store.setUserData('theme', theme);
    Store.state.theme = theme;
  }
}