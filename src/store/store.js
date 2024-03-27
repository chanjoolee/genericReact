import { createStore } from 'redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './rootReducer';
import rootSaga from './rootSaga'; // Make sure to import your root saga

// Create the saga middleware
const sagaMiddleware = createSagaMiddleware();

// Configure store with rootReducer and saga middleware
const store = configureStore({ 
    reducer: combineReducers(rootReducer) ,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware), // Add saga middleware to the default middleware
});

// Then run the root saga
sagaMiddleware.run(rootSaga);

export default store;
