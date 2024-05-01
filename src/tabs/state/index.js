import { createSlice, createAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { isDOMComponent } from "react-dom/test-utils";

const SLICE_NAME = "tabs";
const mainContent = <div style={{ height: "100vh" }}>Content of Main</div>;
const initialState = {
  activeKey: "Main",
  panes: [
    {
      label: "메인",
      key: "Main",
      children: mainContent,
      closable: false,
      initParams: {},
    },
  ],
  activeMenuData: [],
  tabsLimitCount: 10,
};

const reducers = {
  initState: () => initialState,
  setValue: {
    reducer: (state, { payload: { key, value } }) => {
      state[key] = value;
    },
    prepare: (key, value) => {
      return { payload: { key, value } };
    },
  },
  setValue2: {
    reducer: (state, { payload: { key, value } }) => {
      _.update(state, key, function () {
        return value;
      });
    },
    prepare: (key, value) => {
      return { payload: { key, value } };
    },
  },
  setValues: (state, { payload }) => {
    _.forEach(payload, (v, i) => {
      _.update(state, v.key, function () {
        return v.value;
      });
    });
  },
  add: (state, { payload }) => {
    let flag = true;
    state.activeKey = payload.activeKey;
    state.panes.forEach((item, idx) => {
      if (item.key == payload.activeKey) {
        if (payload.pane.initParams) {
          state.panes[idx] = item;
        }
        flag = false;
      }
    });

    if (flag) {
      state.panes.push(payload.pane);
    }
  },
  change: (state, action) => {
    state.activeKey = action.payload.activeKey;
    state.activeMenuData = action.payload.activeMenuData;
    if (action.payload.pane.initParams) {
      state.panes.forEach((item, idx) => {
        if (item.key == action.payload.activeKey) {
          state.panes[idx].initParams = action.payload.initParams;
        }
      });
    }
  },
  remove: (state, action) => {
    state.activeKey = action.payload.activeKey;
    state.panes = action.payload.panes;
    state.activeMenuData = action.payload.activeMenuData;
  },
};

const slice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers,
});

export const getState = (state) => state[SLICE_NAME];
export const actions = {
  ...slice.actions,
  // ...sagaAction
};

export default slice.reducer;
