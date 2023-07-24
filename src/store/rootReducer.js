import tabsReducer from '@tabs/state/index';
import genericReducer from '@generic/state/rootReducer';

const rootReducer = {
  tabs: tabsReducer,
  generic: genericReducer
};

export default rootReducer;
