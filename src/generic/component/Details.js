import { Button, Card, Form, message, Input, Col,Row, DropdownMenu  } from 'antd';
import moment from 'moment';
import React, { forwardRef, useContext, useEffect, useRef, useState, useImperativeHandle } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { actions, getState } from '../state/stateSearch';
import useMounted from '@hooks/useMounted';
import { DownOutlined, QuestionCircleOutlined, SelectOutlined } from '@ant-design/icons';

const Detail = forwardRef((props, ref) => {
    
    const { entityId, instanceId, ...restProps } = props;
    // 인스턴스 생성의 시차가 있을 수 있으므로 ref 객체는 사용하지 않는 것이 좋을 듯?
    useImperativeHandle(ref, () => ({
        onSaveConfirm,
        search,
    }));

    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const [searchForm] = Form.useForm();
    // const list = useSelector((state) => getState(state) instances[instanceId].list); 

    const thisInstance = useSelector((state) => getState(state).instances[instanceId]);
    const searchCompleted = useSelector((state) => getState(state).searchCompleted);
    // useMounted(() => {
    //     // search();
    //     console.log('useMounted');
    //     // afterMount(); 
    // });

    const search = () => {
        if (thisInstance && restProps.initParams && restProps.initParams.filters) {
            var payload = {
                instanceId: instanceId,
                filters: restProps.initParams.filters,
                entityId: thisInstance.entityInfo.entityId,
                tableName: thisInstance.entityInfo.entityId,
                cols: _.filter(thisInstance.entityInfo.cols, (col) => {
                    if (col.Name !== 'contextMenu') {
                        return true;
                    } else {
                        return false;
                    }
                }),
            };
            dispatch(actions.setSearchFilter(payload));
        } else if (thisInstance && restProps.initParams && restProps.initParams.editType === 'insert') {
            console.log('this is insert detail type ');
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
        if(thisInstance.list.length > 0)
            form.setFieldsValue(thisInstance.list[0]);
    }, [thisInstance.list]);

    const onSaveConfirm = (e) => {
        if(thisInstance.editType == "view"){
            dispatch(actions.setValue2(
                'instances.' + thisInstance.callInstanceId + '.openModal.visible',
                false
            ));
            return;
        }
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
    }

    const onSave = (e) => {
        Promise.all([form.validateFields()])
            .then(() => {
                let forms = form.getFieldsValue();
                var payload = {};
                _.merge(payload, {
                    entityId: thisInstance.entityInfo.entityId,
                    tableName: thisInstance.entityInfo.entityId,
                    tableComment: thisInstance.entityInfo.entityNm,
                    instanceId: thisInstance.id,
                    editType: thisInstance.editType
                });

                let cols = []; let filters = [];
                _.forEach(thisInstance.entityInfo.cols, (col, i) => {
                    let v = {
                        col: col.Name,
                        dbcolumnName: col.dbColumnName,
                        dbColumnComment: col.dbcolumnComment,
                        value: forms[col.Name]
                    };
                    if (!col.isSystemColumn) {
                        cols.push(v);
                    }
                    if (col.iskey) {
                        filters.push({
                            col: col.Name,
                            dbColumnName: col.dbColumnName,
                            dbColumnComment: col.dbColumnComment,
                            value: thisInstance.list[0][col.Name]
                        });
                    }
                });

                payload.cols = cols;
                payload.filters = filters;
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
                title: thisInstance.entityInfo.entityNm,
                component: (
                    <>
                        {thisInstance.entityInfo.cols.map((vCol, i) => {
                            let col = thisInstance.entityInfo.cols[i];
                            // console.log(col.Header + ":" + 1); 
                            // console.log(col); 
                            let _key = `detail_col_${instanceId}_${vCol.dataIndex}`;
                            return (
                                <Col span={12} key={_key} >
                                    <Form.Item
                                        type="Text"
                                        label={col.dbColumnComment}
                                        name={col.dataIndex}
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
            <Button onClick={onSaveConfirm} type="primary" htmlType="button">
                {(() => {
                    if (thisInstance.editType === 'edit') {
                        return '저장';
                    } else if (thisInstance.editType === 'insert') {
                        return '추가';
                    } else {
                        return '확인'
                    }
                })()}
            </Button>
        )
    };
    const onFinish = (values) => {
        // console.log(form.getFieldsValue(true)); 
        // onSave();
    };
    if (thisInstance && thisInstance.onload && !_.isEmpty(thisInstance.list)) {
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
            {thisInstance && thisInstance.onload && searchCompleted 
                // && (!_.isEmpty(thisInstance.list) || thisInstance.editType === 'insert') 
                && (
                <Form.Provider onFormFinish={onFinish} onFormChange={onFormChange} >
                    <Form form={form} onFinish={onFinish} {...formItemLayout}  key={`detailForm_${instanceId}`}>
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



export default Detail;