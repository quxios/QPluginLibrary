import React from 'react'
import { observer } from 'mobx-react'

import themes from './../../style/themes'
import MainActions from './../../store/mainActions'

@observer
export default class ThemeButtons extends React.Component {
  onTheme = (e) => {
    const { id } = e.target;
    MainActions.changeTheme(id);
  }

  render() {
    const { theme } = this.props;
    const title = 'Switch to this color theme';
    return (
      <div className="themeButtons">
        {
          themes.map((name) => {
            const text = name.replace('style', '');
            const cls = name === theme ? 'active' : '';
            return (
              <button key={`theme-${name}`} id={name} className={cls} onClick={this.onTheme} title={title}>
                {text}
              </button>
            )
          })
        }
      </div>
    )
  }
}