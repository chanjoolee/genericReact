import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Card, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getState,getAttr, actions } from '../state/stateSearch';
import LayoutSearchRows from '@generic/component/layout/LayoutSearchRows';
// import CommonModal from '@components/modal/CommonModal'; 
import { Button , Modal } from 'antd';
import DataArea from '@generic/component/DataArea';
import SearchFilterContainer from './SearchFilterContainer';
// import Detail from '@generic/component/Detail'; 
import DetailPage from "@generic/container/DetailPage"; 
import SearchPage from '@generic/container/SearchPage';
import { schemaGeneric } from '@generic/schemaGeneric.js';
import moment from 'moment';
import _ from 'lodash';
import '@generic/generic.css';


const GenericModal = ({instanceId}) => {
    // console.log("SearchList was rendered at", new Date().toLocaleTimeString());
    const modalwidth = {
        sm: 300, // Example width for 'sm'
        md: 500, // Example width for 'md'
        lg: 800  // Example width for 'lg'
    };
    const dispatch = useDispatch();
    const detailRef = useRef();

    // useEffect(() => {
        
    // }, [dispatch]);

    // const thisInstance = useSelector((state) => getState(state).instances[instanceId]);
    // const searchCompleted = useSelector((state) => getState(state).searchCompleted);
    const onload = useSelector((state) => getAttr(state,instanceId,'onload'));
    const uiType = useSelector((state) => getAttr(state,instanceId,'openModal.uiType'));
    const initParams = useSelector((state) => getAttr(state,instanceId,'openModal.initParams'));
    // const openModal = useSelector((state) => getAttr(state,instanceId,'openModal'));
    const visible = useSelector((state) => getAttr(state,instanceId,'openModal.visible'));
    const entityNm = useSelector((state) => getAttr(state,instanceId,'openModal.initParams.entityNm'));

    return (
        <>
            {onload && visible && (

                <Modal
                    title={entityNm}
                    width={(() => {
                        if (uiType === 'list') {
                            return 1300;
                        }
                        else {
                            return modalwidth.lg;
                        }
                    })()}
                    // draggable={true}
                    open={visible}
                    className="modalGrid"
                    onCancel={() => {
                        let values = [
                            { key: 'instances.' + instanceId + '.openModal.visible', value: false },
                            { key: 'instances.' + instanceId + '.openModal.initParams', value: {} },
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
                    footer={uiType === 'detail' && []}
                >
                    {uiType === 'list' && (
                        <SearchPage
                            initParams={(() => {
                                let param = { ...initParams };
                                param.callInstanceId = instanceId;
                                return param;
                            })()} 
                        />
                    )}
                    {uiType === 'detail' && (
                        <DetailPage
                            initParams={(() => {
                                let param = { ...initParams };
                                param.callinstanceId = instanceId;
                                return param;
                            })()}
                            ref={detailRef} 
                        />
                    )}
                </Modal>
                
            )}
        </>
    );
};


// export default GenericModal;
const GenericModalMemo = React.memo(GenericModal);
export default GenericModalMemo;