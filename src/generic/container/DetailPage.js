import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useMounted from "@hooks/useMounted";
import { getState, actions } from '@generic/state/stateSearch';
// import { LayoutType1, LayoutType3 } from '@components/layout';
// import TabContentHeader from '@components/layout/TabContentHeader';
// import CommonModal from '@components/modal/CommonModal';
import Detail from '@generic/component/Details';
// import { schemaBos } from '../schemaBos';
import moment from 'moment';
import _ from 'lodash';
import '@generic/generic.css';

const DetailPage = (props) => {
  const dispatch = useDispatch();
  const [instanceId, setInstanceId] = useState();
  const thisState = useSelector((state) => getState(state));
  const thisInstance = useSelector((state) => getState(state).instances[instanceId]);
  useMounted(() => {
    // search(); 
  });
  const search = () => {
    // if (thisInstance && props.initParams && props.initParams.filters) 
    // dispatch(actions.setSearchFilter(props.initParams.filters)); 
    // }
  };

  useEffect(() => {
    let vInstanceId = moment().format('YYYYMMDDHHmmssSSS');
    if (thisState.instances.vInstanceId == null) {
      vInstanceId += _.uniqueId(".");
    }
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
        callInstanceId: props.initParams.callinstanceId
      }),
    );
    return () => {
      // dispatch(actions.initState()); 
      dispatch(actions.deleteInstance({ instanceId: vInstanceId }));
    };
  }, [dispatch]);


  return (
    <>
      {thisInstance && thisInstance.onload && (
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
};
export default DetailPage;