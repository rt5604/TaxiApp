import React from 'react';

import createStore from './store/createStore';
import AppContainer from './AppContainer';

//import Icon from 'react-native-vector-icons/FontAwesome';

//Icon.loadFont();

export default class Root extends React.Component {
  renderApp() {
    const initialState = window.___INTITIAL_STATE__;
    const store = createStore(initialState);

    return <AppContainer store={store} />;
  }

  render() {
    return this.renderApp();
  }
}
