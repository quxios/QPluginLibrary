import "babel-polyfill"

import React from 'react'
import ReactDOM from 'react-dom'

import Store from './store'

import Style from './style'
import Layout from './components/layout'

ReactDOM.render(
  <Layout store={Store} />,
  document.getElementById('app')
)
