import * as types from '../constants';

export function setTheme(value) {
  return {
    type: types.SET_THEME,
    payload: value
  }
}
