import 'typeface-roboto';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import 'typeface-roboto';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import reducer from './reducer';
import * as firebase from 'firebase';
import config from 'firebase-config';
firebase.initializeApp(config);

const middlewares = [thunk];

if (process.env.NODE_ENV === `development`) {
  const { logger } = require(`redux-logger`);
  middlewares.push(logger);
}

const store = compose(applyMiddleware(...middlewares))(createStore)(reducer);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
registerServiceWorker();
