import search from "./stateSearch";
import { configureStore, combineReducers } from '@reduxjs/toolkit';


const rootReducer = combineReducers({
    search
});


export default rootReducer;