import { configureStore , combineReducers } from '@reduxjs/toolkit';
import { all } from 'redux-saga/effects'

import createSagaMiddleware  from 'redux-saga';
import logger from 'redux-logger';

import tabsReducer from '@tabs/state/index';
// import genericReducer from '../generic/state/index';
import genericReducer from '@generic/state/index';

// 20220714 : combine  reducer는 현재로서는 사용안함.

const devMode = process.env.NODE_ENV === 'development';
const sagaMiddleware = createSagaMiddleware();


const middleware = [sagaMiddleware];
devMode && middleware.push(logger);

const createStore = async () => {
  const urlStr = window.location.href; // URL

  let reReducers = null;
  let reSagas = null;
  let isEx = false; // 모바일 여부

  reReducers = await import(
    './rootReducer'
  ).then((value) => {
    return combineReducers(value.default)
  })

  // reSagas = await import(
  //   './rootSaga'
  // ).then((value) => all(value.default));

  function* rootSaga(){
    yield reSagas;
  }

  const store = configureStore({
    // devTools : devMode , 
    // middleware : !isEx ? middleware : [] ,
    reducer : reReducers
  });

  // !isEx && sagaMiddleware.run(rootSaga);
  return store;
}

export default createStore;

// export default configureStore({
//   reducer: {
//     tabs: tabsReducer,
//     generic: genericReducer, 
//   },
// });