import tabsReducer from '@tabs/state';
import genericReducer from '@generic/state';

const rootReducer = {
  tabs : tabsReducer , 
  // generic : genericReducer
};

export default rootReducer;