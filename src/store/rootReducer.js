import tabsReducer from '@tabs/state/index';
import genericReducer from '@generic/state/index';

const rootReducer = {
  tabs : tabsReducer , 
  generic : genericReducer
};

export default rootReducer;