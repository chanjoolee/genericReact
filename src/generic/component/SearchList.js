import React, { useEffect, useState, useRef } from 'react';
import { Card, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getState, actions } from '../state/stateSearch';
import LayoutSearchRows from '@generic/component/layout/LayoutSearchRows';
// import CommonModal from '@components/modal/CommonModal'; 
import { Button } from 'antd';
import DataArea from '@generic/component/DataArea';
import SearchFilterContainer from './SearchFilterContainer';
// import Detail from '@generic/component/Detail'; 
// import DetailPage from "@generic/container/DetailPage"; 
import SearchPage from '@generic/container/SearchPage';
import { schemaGeneric } from '@generic/schemaGeneric.js';
import moment from 'moment';
import _ from 'lodash';
import '@generic/generic.css';

const SearchList = (props) => {
    const dispatch = useDispatch();
    const [instanceId, setInstanceId] = useState();
    const detailRef = useRef();

    useEffect(() => {
        let vInstanceId = moment().format('YYYYMMDDHHmmssSSS') + _.uniqueId("_");

        setInstanceId(vInstanceId);
        setTimeout(() => {
            dispatch(
                // backend 가 설정 될때 까지 saga 보류
                actions.fetchInitialInfo({
                // actions.setInitialInfo({
                    instanceId: vInstanceId,
                    entityId: props.initParams.entityId,
                    tableName: props.initParams.entityId,
                    // tab, modal : default tab 
                    openType: props.initParams.openType ? props.initParams.openType : 'tab',
                    uiType: props.initParams.uiType ? props.initParams.uiType : 'list',
                    callInstanceId: props.initParams.callInstanced
                }),
            );
        }, 0);
        return () => {
            // dispatch(actions.initState());
            dispatch(actions.deleteInstance({ instanceId: instanceId }));
        };
    }, [dispatch]);

    // debug 모드에서 전근가능(디버그용) 
    const thisState = useSelector((state) => getState(state));
    const thisInstance = useSelector((state) => getState(state).instances[instanceId]);
    window.state_search = {
        state: thisState,
        dispatch: dispatch,
        actions: actions
    };
    const saveDetail = () => {
        detailRef.current.onSaveConfirm();
    };

    return (
        <>
            {thisInstance && thisInstance.onload && thisInstance.openType === 'tab' && (
                <LayoutSearchRows
                    searchFilter={
                        <SearchFilterContainer instanceId={instanceId} initParams={props.initParams} />
                    }
                    rowsections={
                        <DataArea entityId={props.initParams.entityId} instanceId={instanceId} />
                    }
                // rowsections={[
                //     {
                //         cards: [<DataArea entityId={props.initParams.entityId} instanceId={instanceId} /> ]
                //     },
                // ]}
                />
            )}
            {thisInstance && thisInstance.onload && thisInstance.openType === 'modal' && (
                <>
                    <div>
                        <Spin spinning={false}>
                            <SearchFilterContainer instanceId={instanceId} initParams={props.initParams} />
                            {/* <DataArea entityId={props.initParams.entityId} instanceId={instanceId} />  */}
                        </Spin>
                    </div>
                </>
            )}
            {thisInstance && thisInstance.onload && thisInstance.openType === 'embeded' && (
                <div>
                    <Spin spinning={false}>
                        <div style={{ display: 'none' }}>
                            <SearchFilterContainer instanceId={instanceId} initParams={props.initParams} />
                        </div>
                        {/* <DataArea entityId={props.initParams.entityId} instanceId={instanceId} />  */}
                    </Spin>
                </div>
            )}
            {thisInstance && thisInstance.onload && thisInstance.openModal.visible && (
                <>
                </>
                // <CommonModal
                //     title={thisInstance.openModal.initParams.entityNm} 
                //     width={(() => { 
                //         if(thisInstance.openModal.uiType === 'list'){
                //             return 1300; }
                //         else{
                //             return window.Modalwidth.sm;
                //         }
                //     })()} 
                //     draggable={true} 
                //     visible={thisInstance.openModal.visible} 
                //     className="modalGrid" 
                //     onCancel={() => { 
                //         let values = [
                //             { key: 'instances.' + instanceId + '.openModal.visible', value: false }, 
                //             { key: 'instances.' + instanceId + '.openModal.initParams', value: {}},
                //         ];            
                //         dispatch(actions.setValues(values));
                //     }}
                //     onok={() => { 
                //         let values = [
                //             { key: 'instances.' + instanceId + '.openModal.visible', value: false }, 
                //             { key: 'instances.' + instanceId + '.openModal.initParams', value: {} },
                //         ];
                //         dispatch(actions.setValues(values));
                //     }}
                //     footer={thisInstance.openModal.uiType ==='detail' && []}
                // >
                //     {thisInstance.openModal.uiType==='list' && (
                //         <SearchPage 
                //             initParams={(() => {
                //                 let param = _.cloneDeep(thisInstance.openModal.initParams); 
                //                 param.callInstanceId = instanceId;
                //                 return param; 
                //             })()}
                //         />
                //     )}
                //     {thisInstance.openModal.uiType=== 'detail' && (
                //         <DetailPage initParams={(() => {
                //             let param = _.cloneDeep(thisInstance.openModal.initParams); 
                //                 param.callinstanceId = instanceId;
                //                 return param; 
                //             })()} 
                //             ref={detailRef}
                //         />
                //     )}
                // </CommonModal>
            )}
        </>
    );
};

export default SearchList;