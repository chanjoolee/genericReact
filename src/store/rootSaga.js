import { all } from 'redux-saga/effects';
import { watchUnsplash as genericWatchUnsplash } from "../generic/state/saga";


// 기존
// const rootSaga = [
//   genericWatchUnsplash(),
//   // ...rootSagaBos
// ];
// export default rootSaga;

export default function* rootSaga() {
  yield all([
    genericWatchUnsplash(),
    // include other sagas here as needed
  ]);
}
