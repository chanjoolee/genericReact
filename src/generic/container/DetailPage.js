import React, { useEffect, useState, forwardRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useMounted from "@hooks/useMounted";
import { getState, getAttr , actions } from '@generic/state/stateSearch';
// import { LayoutType1, LayoutType3 } from '@components/layout';
// import TabContentHeader from '@components/layout/TabContentHeader';
// import CommonModal from '@components/modal/CommonModal';
import Detail from '@generic/component/Details';
// import { schemaBos } from '../schemaBos';
import moment from 'moment';
import _ from 'lodash';
import '@generic/generic.css';

const DetailPage = forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const [instanceId, setInstanceId] = useState();
  // const thisState = useSelector((state) => getState(state));
  // const thisInstance = useSelector((state) => getState(state).instances[instanceId]);
  const onload = useSelector((state) => getAttr(state,instanceId,'onload'));
  // const onloadGlobal = useSelector((state) => getState(state).onload);
  useMounted(() => {
    // search(); 
  });
  const search = () => {
    // if (thisInstance && props.initParams && props.initParams.filters) 
    // dispatch(actions.setSearchFilter(props.initParams.filters)); 
    // }
  };

  useEffect(() => {
    // let vInstanceId = moment().format('YYYYMMDDHHmmssSSS');
    let vInstanceId = moment().format('YYYYMMDDHHmmssSSS') + _.uniqueId("_");
    // if (thisState.instances.vInstanceId == null) {
    //   vInstanceId += _.uniqueId(".");
    // }
    setInstanceId(vInstanceId);
    dispatch(
      actions.fetchInitialInfo({
        instanceId: vInstanceId,
        entityId: props.initParams.entityId,
        tableName: props.initParams.entityId,
        // tab, modal default tab 
        openType: props.initParams.openType ? props.initParams.openType : 'tab',
        uiType: props.initParams.uiType ? props.initParams.uiType : 'list',
        editType: props.initParams.editType ? props.initParams.editType : 'edit',
        callInstanceId: props.initParams.callInstanceId
      }),
    );
    return () => {
      // dispatch(actions.initState()); 
      dispatch(actions.deleteInstance({ instanceId: vInstanceId }));
    };
  }, [dispatch]);


  return (
    <>
      {onload && (
        <>
          <Detail 
            entityId={props.initParams.entityId} 
            instanceId={instanceId} 
            initParams={props.initParams} 
            ref={props.ref} 
          />
        </>
      )}
    </>
  );
});
// export default DetailPage;
const arePropsEqual = (prevProps, nextProps) => {
  return prevProps.list === nextProps.list;
}
const MemoizedMyDetailPage = React.memo(DetailPage);
export default MemoizedMyDetailPage;