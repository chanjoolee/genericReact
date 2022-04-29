import React, { useEffect, useState, useRef } from 'react'; 
import { Card, Spin } from 'antd'; 
import { useDispatch, useSelector } from 'react-redux'; 
import { getState, actions } from '../state';
import { LayoutType1, LayoutType3 } from '@components/layout'; 
import TabContentHeader from '@components/layout/TabContentHeader';
import CommonModal from '@components/modal/CommonModal'; 
import { Button } from '@components/formItem'; 
import DataArea from './DataArea'; 
import SearchFilterContainer from './SearchFilterContainer';
import Detail from './Detail'; 
import DetailPage from "../../../container/DetailPage"; 
import SearchPage from '../../../container/SearchPage'; 
import { schemaBos } from '../../../schemaBos'; 
import moment from 'moment'; 
import _ from 'lodash';
import '../../generic.css';

const SearchList = (props) => {
    const dispatch = useDispatch(); 
    const [instanceId, setInstanceId] = useState(); 
    const detailRef = useRef();

    useEffect(() => {
        let vInstanceId = moment().format('YYYYMMDDHHmmssSSS') + _.uniqueId("_");


        setInstanceId(vInstanceId); 
        setTimeout(() => { 
            dispatch( 
                actions.fetchInitialInfo({
                    instanceId: vInstanceId, 
                    entityId: props.initParams.entityId, 
                    tableName: props.initParams.entityId, 
                    // tab, modal : default tab 
                    openType: props.initParams.openType ? props.initParams.openType : 'tab', 
                    uitype : props.initParams.uiType ?props.initParams.uiType : 'list',
                    callInstanceId: props.initParams.callInstanced 
                }),            
            ); 
        }, 0); 
        return () => {
            // dispatch(actions.initState());
            dispatch(actions.deleteInstance({instanceId: instanceId}));
        };
    },[dispatch]);
            
    // debug 모드에서 전근가능(디버그용) 
    const thisState = useSelector((state) =>getState(state)); 
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
                <LayoutType3 
                    header={(() => { 
                        if (thisInstance.openType === 'tab'){
                            return <TabContentHeader />; } 
                        else {
                            return null;
                        }
                    })()} 
                    searchFilter={
                        <SearchFilterContainer instanceId={instanceId} initParams={props.initParams} />
                    }
                    rowsections={[
                        {
                            cards: [<DataArea entityId={props.initParams.entityId} instanceId={instanceId} /> ]
                        },
                    ]}
                />
            )}
            {thisInstance && thisInstance.onload && thisInstance.openType === 'modal' && (
                <>
                    <div> 
                        <Spin spinning={false}>
                            <SearchFilterContainer instanceId={instanceId} initParams={props.initParams} />
                            <DataArea entityId={props.initParams.entityId} instanceId={instanceId} /> 
                        </Spin> 
                    </div> 
                </>
            )}
            {thisInstance && thisInstance.onload && thisInstance.openType === 'embeded' && (
                <div> 
                    <Spin spinning={false}>
                        <div style={{display: 'none'}}> 
                            <SearchFilterContainer instanceId={instanceId} initParams={props.initParams} /> 
                        </div>
                        <DataArea entityId={props.initParams.entityId} instanceId={instanceId} /> 
                    </Spin> 
                </div>            
            )} 
            {thisInstance && thisInstance.onload && thisInstance.openModal.visible &&  (
                <CommonModal
                    title={thisInstance.openModal.initParams.entityNm} 
                    width={(() => { 
                        if(thisInstance.openModal.uiType === 'list'){
                            return 1300; }
                        else{
                            return window.Modalwidth.sm;
                        }
                    })()} 
                    draggable={true} 
                    visible={thisInstance.openModal.visible} 
                    className="modalGrid" 
                    onCancel={() => { 
                        let values = [
                            { key: 'instances.' + instanceId + '.openModal.visible', value: false }, 
                            { key: 'instances.' + instanceId + '.openModal.initParams', value: {}},
                        ];            
                        dispatch(actions.setValues(values));
                    }}
                    onok={() => { 
                        let values = [
                            { key: 'instances.' + instanceId + '.openModal.visible', value: false }, 
                            { key: 'instances.' + instanceId + '.openModal.initParams', value: {} },
                        ];
                        dispatch(actions.setValues(values));
                    }}
                    footer={thisInstance.openModal.uiType ==='detail' && []}
                >
                    {thisInstance.openModal.uiType==='list' && (
                        <SearchPage 
                            initParams={(() => {
                                let param = _.cloneDeep(thisInstance.openModal.initParams); 
                                param.callInstanceId = instanceId;
                                return param; 
                            })()}
                        />
                    )}
                    {thisInstance.openModal.uiType=== 'detail' && (
                        <DetailPage initParams={(() => {
                            let param = _.cloneDeep(thisInstance.openModal.initParams); 
                                param.callinstanceId = instanceId;
                                return param; 
                            })()} 
                            ref={detailRef}
                        />
                    )}
                </CommonModal>
            )}
        </>
    );
};

export default SearchList;