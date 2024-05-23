import { Button, Card, Form, message, Input, Col, Row, DropdownMenu } from 'antd';
import moment from 'moment';
import React, { forwardRef, useContext, useEffect, useRef, useState, useImperativeHandle } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { actions, getState, getAttr } from '../state/stateSearch';
import useMounted from '@hooks/useMounted';
import { DownOutlined, QuestionCircleOutlined, SelectOutlined } from '@ant-design/icons';

const Detail = forwardRef((props, ref) => {

    const { entityId, instanceId, ...restProps } = props;
    // 인스턴스 생성의 시차가 있을 수 있으므로 ref 객체는 사용하지 않는 것이 좋을 듯?
    useImperativeHandle(ref, () => ({
        onSaveConfirm,
        search,
    }));

    useEffect(() => {
        // Set up logic here

        return () => {
            // Cleanup logic here
            console.log("Detail Destory");
        };
    }, []);  // Ensure dependencies are correctly set if needed

    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const [searchForm] = Form.useForm();
    // const list = useSelector((state) => getState(state) instances[instanceId].list); 

    // const thisInstance = useSelector((state) => getState(state).instances[instanceId]);
    const searchCompleted = useSelector((state) => getState(state).searchCompleted);
    const onload = useSelector((state) => getAttr(state, instanceId, 'onload'));
    const cols = useSelector((state) => getAttr(state, instanceId, 'entityInfo.cols'));
    const list = useSelector((state) => getAttr(state, instanceId, 'list'));
    // useMounted(() => {
    //     // search();
    //     console.log('useMounted');
    //     // afterMount(); 
    // });

    const search = () => {
        if (onload && restProps.initParams.filters && restProps.initParams.filters.length > 0) {
            var payload = {
                instanceId: instanceId,
                filters: restProps.initParams.filters,
                entityId: entityId,
                tableName: entityId,
                editType: restProps.initParams.editType,
                uiType: restProps.initParams.uiType,
                cols: _.filter(cols, (col) => {
                    if (col.Name !== 'contextMenu') {
                        return true;
                    } else {
                        return false;
                    }
                }),
            };
            dispatch(actions.setSearchFilter(payload));
        } else if (restProps.initParams.editType === 'insert') {
            console.log('It will insert by empty form');
        }
    };
    // useEffect(() => { 
    // if (thisSheet.current) { 
    // thisSheet.current.loadSearchData([data:list, sync:true});
    // }, [list]);

    // 모달 Visible 
    // const { sessionUserid, sessionUserlim, sessionCustGrpcd } = useSession();
    const nowDt = moment().format('YYYYMMDD');
    // const menuid = useContext(TabContext);

    // 오른쪽에 카드리스트를 표시한다.
    useEffect(() => {
        search();
    }, [dispatch]);
    // Events 
    const onFormChange = (e) => {
        // console.log('Change');
    };
    useEffect(() => {
        form.resetFields();
        if (list.length > 0)
            form.setFieldsValue(list[0]);
    }, [list]);

    const onSaveConfirm = (e) => {
        // let validList = [];
        switch (restProps.initParams.editType) {
            case 'update':
            case 'insert': {
                // 공통 valid 체크 
                let validList = form.getFieldsError();
                for (var i = 0; i < validList.length; i++) {
                    console.log(validList[i].errors);
                    if (validList[i].errors.length > 0) {
                        message.warning(validList[i].errors[0]);
                        return false;
                    }
                }
                onSave(e);
                break;
            }
            default:
                onConfirm(e);

        }
        return true;
    }
    const onConfirm = (e) => {
        dispatch(actions.setValue2(
            'instances.' + restProps.initParams.callInstanceId + '.openModal.visible',
            false
        ));
    }

    const onSave = (e) => {
        Promise.all([form.validateFields()])
            .then(() => {
                let forms = form.getFieldsValue();
                var payload = {};
                _.merge(payload, {
                    instanceId: instanceId,
                    entityId: entityId,
                    tableName: entityId,
                    filters: restProps.initParams.filters,
                    // tableComment: restProps.initParams.entityNm,
                    // instanceId: instanceId ,
                    editType: restProps.initParams.editType,
                    uiType: restProps.initParams.uiType
                });

                let values = [];
                _.forEach(cols, (col, i) => {

                    let value = { ...col, value: forms[col.dataIndex] }
                    if (!col.isSystemColumn) {
                        values.push(value);
                    }
                    // if (col.iskey) {
                    //     values.push({
                    //         col: col.Name,
                    //         dbColumnName: col.dbColumnName,
                    //         dbColumnComment: col.dbColumnComment,
                    //         value: list[0][col.Name]
                    //     });
                    // }
                });

                payload.cols = cols;
                payload.values = values;
                dispatch(actions.save(payload));
            })
            .catch((error) => {
                console.log(error);
            });
    };



    const emailValidate = ({ getFieldValue }) => ({
        validator(_, value) {
            if (!value) {
                return Promise.resolve();
            }
            const emailArr = value.split(',');
            let resultValidation = false;
            if (emailArr.length > 0) {
                resultValidation = true;
                for (let idx in emailArr) {
                    if (!checkEmail(emailArr[idx])) {
                        resultValidation = false;
                        break;
                    }
                }
            }

            if (resultValidation) {
                return Promise.resolve();
            }

            return Promise.reject('형식에 맞지않는 이메일주소가 있습니다');
        }

    });

    const checkEmail = (address) => {
        const emailReg = /[0-9a-zA-Z][_0-9a-zA-Z-]*@[_0-9a-zA-Z-]+(\.[_0-9a-zA-Z-]+){1,2}$/;
        return emailReg.test(address);
    };

    // Content 
    let contentList = {
        list: [
            {
                title: restProps.initParams.entityNm,
                component: (
                    <>
                        {_.concat([], cols).map((vCol, i) => {
                            // let col = cols[i];
                            // console.log(col.Header + ":" + 1); 
                            // console.log(col); 
                            let _key = `detail_col_${instanceId}_${vCol.dataIndex}`;
                            return (
                                <Col span={12} key={_key} >
                                    <Form.Item
                                        type="Text"
                                        label={vCol.dbColumnComment}
                                        name={vCol.dataIndex}
                                    // key={_key}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                            );
                        })}
                    </>
                )
            }
        ],
        buttons: (
            <>
                <Button onClick={onSaveConfirm} type="primary" htmlType="button">
                    {(() => {
                        if (restProps.initParams.editType === 'update') {
                            return '저장';
                        } else if (restProps.initParams.editType === 'insert') {
                            return '추가';
                        } else {
                            return '확인'
                        }
                    })()}
                </Button>
                {/* <Button onClick={onConfirm} type="primary" htmlType="button">
                    확인
                </Button> */}
            </>
        )
    };

    const onFinish = (values) => {
        // console.log(form.getFieldsValue(true)); 
        // onSave();
    };
    if (onload && !_.isEmpty(list)) {
        // makeContentList();

    }

    const formItemLayout = {
        labelCol: {
            xs: {
                span: 24,
            },
            sm: {
                span: 8,
            },
        },
        wrapperCol: {
            xs: {
                span: 24,
            },
            sm: {
                span: 16,
            },
        },
    };
    return (
        <>
            {onload
                && searchCompleted
                // && (!_.isEmpty(thisInstance.list) || thisInstance.editType === 'insert') 
                && (
                    <Form.Provider onFormFinish={onFinish} onFormChange={onFormChange} >
                        <Form form={form} onFinish={onFinish} {...formItemLayout} key={`detailForm_${instanceId}`}>
                            <Row gutter={24} key={'detail_row_0'}>
                                {contentList.list.map((v, i) => {
                                    return (
                                        v.component
                                    );
                                })}
                            </Row>
                            <Row key={'detail_row_1'}>
                                <Col
                                    span={24}
                                    style={{
                                        textAlign: "right",
                                    }}
                                >
                                    {contentList.buttons}
                                </Col>

                            </Row>
                        </Form>
                    </Form.Provider>
                )}
        </>
    );
});



// export default Detail;

// const arePropsEqual = (prevProps, nextProps) => {
//     return prevProps.list === nextProps.list;
// }

const MemoizedDetail = React.memo(Detail);
export default MemoizedDetail;