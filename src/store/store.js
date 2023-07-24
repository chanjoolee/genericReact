// store.js
import { createStore } from 'redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

const store = configureStore({ reducer: combineReducers(rootReducer) }); // pass your root reducer function here
export default store;
