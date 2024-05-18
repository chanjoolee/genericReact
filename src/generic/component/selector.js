// selectors.js
import { createSelector } from 'reselect';

const getState = (state) => state.generic;

export const getSearchEvent = createSelector(
  [getState],
  (state) => state.searchEvent
);

export const getCodelist = createSelector(
  [getState],
  (state) => state.codelist
);

export const getThisInstance = (state, instanceId) => createSelector(
  [getState],
  (state) => state.instances[instanceId]
);
