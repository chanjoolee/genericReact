import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Card, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getState, getAttr , actions } from '../state/stateSearch';
import LayoutSearchRows from '@generic/component/layout/LayoutSearchRows';
// import CommonModal from '@components/modal/CommonModal'; 
import { Button , Modal } from 'antd';
import DataArea from '@generic/component/DataArea';
import GenericModal from '@generic/component/GenericModal';
import SearchFilterContainer from './SearchFilterContainer';
// import Detail from '@generic/component/Detail'; 
import DetailPage from "@generic/container/DetailPage"; 
import SearchPage from '@generic/container/SearchPage';
import { schemaGeneric } from '@generic/schemaGeneric.js';
import moment from 'moment';
import _ from 'lodash';
import '@generic/generic.css';
import ErrorBoundary from '@generic/component/layout/ErrorBoundary'


const SearchList = (props) => {
    // console.log("SearchList was rendered at", new Date().toLocaleTimeString());
    const modalwidth = {
        sm: 300, // Example width for 'sm'
        md: 500, // Example width for 'md'
        lg: 800  // Example width for 'lg'
    };
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
        // dispatch(
        //     // backend 가 설정 될때 까지 saga 보류
        //     actions.fetchInitialInfo({
        //     // actions.setInitialInfo({
        //         instanceId: vInstanceId,
        //         entityId: props.initParams.entityId,
        //         tableName: props.initParams.entityId,
        //         // tab, modal : default tab 
        //         openType: props.initParams.openType ? props.initParams.openType : 'tab',
        //         uiType: props.initParams.uiType ? props.initParams.uiType : 'list',
        //         callInstanceId: props.initParams.callInstanced
        //     }),
        // );
        return () => {
            // dispatch(actions.initState());
            dispatch(actions.deleteInstance({ instanceId: instanceId }));
        };
    }, [dispatch]);

    // debug 모드에서 전근가능(디버그용) 
    const thisState = useSelector((state) => getState(state));
    // const thisInstance = useSelector((state) => getState(state).instances[instanceId]);
    // const searchCompleted = useSelector((state) => getState(state).searchCompleted);
    const onload = useSelector((state) => getAttr(state,instanceId,'onload'));
    const openType = useSelector((state) => getAttr(state,instanceId,'openType'));
    
    // const searchFilterMemo = useMemo(() => {
    //     if (thisInstance && thisInstance.searchFilter) {
    //       return thisInstance.searchFilter;
    //     }
    //     return null;
    //   }, [thisInstance]);

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
            {/*
            {thisInstance && thisInstance.onload && thisInstance.openType === 'tab' && (
                <LayoutSearchRows
                    key={`LayoutSearchRows_${instanceId}`}
                    searchFilter={
                        <SearchFilterContainer instanceId={instanceId} />
                    }
                    rowsections={
                        <DataArea entityId={props.initParams.entityId} instanceId={instanceId}/>
                    }
                />
            )}
            {thisInstance && thisInstance.onload && thisInstance.openType === 'modal' && (
                <>
                    <div>
                        <Spin spinning={false}>
                            <SearchFilterContainer instanceId={instanceId}  />
                        </Spin>
                    </div>
                </>
            )}
            {thisInstance && thisInstance.onload && thisInstance.openType === 'embeded' && (
                <div>
                    <Spin spinning={false}>
                        <div style={{ display: 'none' }}>
                            <SearchFilterContainer instanceId={instanceId} />
                        </div>
                        
                    </Spin>
                </div>
            )}
            */}
             {onload && openType === 'tab' && (
                <ErrorBoundary>
                    <LayoutSearchRows
                        key={`LayoutSearchRows_${instanceId}`}
                        searchFilter={
                            <SearchFilterContainer instanceId={instanceId} />
                        }
                        rowsections={
                            <DataArea entityId={props.initParams.entityId} instanceId={instanceId}/>
                        }
                    />
                    </ErrorBoundary>
            )}
            {onload && openType === 'modal' && (
                <>
                    <div>
                        <Spin spinning={false}>
                            <SearchFilterContainer instanceId={instanceId}  />
                        </Spin>
                    </div>
                </>
            )}
            {onload && openType === 'embeded' && (
                <div>
                    <Spin spinning={false}>
                        <div style={{ display: 'none' }}>
                            <SearchFilterContainer instanceId={instanceId} />
                        </div>
                        
                    </Spin>
                </div>
            )}
            <GenericModal instanceId={instanceId} />

        </>
    );
};


// export default SearchList;
const SearchListMemo = React.memo(SearchList);
export default SearchListMemo;