import Store from './index'

import { action } from 'mobx'

export default new class ToolbarActions {
  @action.bound
  select(key) {
    Store.state.selected = key;
  }

  @action.bound
  setCategory(category) {
    Store.state.category = category;
  }

  @action.bound
  setSort(sort) {
    Store.state.sort = sort;
  }
}