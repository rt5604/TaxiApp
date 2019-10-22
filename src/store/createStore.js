import {createStore, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import makeRootReducer from './reducers';
import {createLogger} from 'redux-logger';

import createSocketIoMiddleware from 'redux-socket.io';

import io from 'socket.io-client/dist/socket.io';

let socket = io('http://localhost:3000', {jsonp: false});
let socketIoMiddleware = createSocketIoMiddleware(socket, 'server/');

const log = createLogger({diff: true, collapsed: true});

// a function which can create our store and auto-persist the data
export default (initialState = {}) => {
  // ======================================================
  // Middleware Configuration
  // ======================================================
  const middleware = [thunk, log, socketIoMiddleware];

  // ======================================================
  // Store Enhancers
  // ======================================================
  const enhancers = [];
  const composeEnhancers = (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

  // ======================================================
  // Store Instantiation
  // ======================================================
  const store = createStore(
    makeRootReducer(),
    composeEnhancers(
      applyMiddleware(...middleware),
      // other store enhancers if any
    )
  );
  return store;
};
