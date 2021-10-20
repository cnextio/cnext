import * as types from '../constants';

export default function reducer(state={ currentTheme: 0 }, actions) {
  switch (actions.type) {

    case types.SET_THEME:
      return {
        ...state,
        currentTheme: actions.payload
      }

    default:
      return state
  }
}
