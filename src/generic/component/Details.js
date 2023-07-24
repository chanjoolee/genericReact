import useSession from '@hooks/useSession';
import EventBus from '@lib/EventBus';
import { ibSheetutil } from '@lib/ibSheetutil';
import { confim } from '@lib/messageUtil';
import { utils, regExp } from '@lib/utils';
import { MSA_OFFER } from 'e/common/constant';
import UserSearchModal from 'écomponents/modal/user Search Modal';
import TabContext from '@pages/common/mainTabs/container/TabContext';
import { Button, Card, Form, message, Input, DropdownMenu } from 'antd';
import moment from 'moment';
import React, { useContext, useEffect, useRef, useState, useImperativeHandle } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import TitleSub from '@components/layout/TitleSub';
import CodeCombo from '@components/search/CodeCombo';
import { FormItem, FormItemBiz, FormItemPickerDate, FormItemRadio, FormItemser, FormItemDept, FormItemUserDept, FormItemFile, FormItemPhonellumber, } from '@components/formitem';
import { InfoTip } from '@components/messages';
import { rules } from '@lib/formRules';
import { RowddButton, RowDeleteButton, DownloadButton, SaveButton } from '@components/button';
import IbSheet from '@components/grid/IbSheet';
import { actions, getState } from '../state/stateSearch';
import ImageViewer from '@components/viewer/ImageViewer';
import useMounted from '@hooks/useMounted';
import { format } from 'prettier';
import axios from 'axios';
import { DownOutlined, QuestionCircleOutlined, SelectOutlined } from '@ant-design/icons';
import CollideSwitch from '@components/switch/ColHideSwitch';
// import SendozEmailModal from '@pages/common/sample/ozReportSample/Sendo2EmailModal'; 
import FormPrdtGrpModal from 'pages/order/component/FormPrdtarpModal';
import FormPrdtModal from '@pages/order/component/FormPratModal';
import PrdtModal from '@pages/order/component/PrdtModal';
// import GoodsModal from '@pages/order/component/Goods Modal'; 
import ProductModal from '@pages/order/component/Productes';

import { schemaBos } from '@pages/bos/common/generic/schemaBos';
import SearchPage from '@pages/bos/common/generic/container/SearchPage';

const Detail = ({ entityId, instanceId, ref, ...restProps }) => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const [searchForm] = Form.useform();
    // const list = useSelector((state) => getState(state) instances[instanceId].list); 
    const cols = useSelector((state) => {
        let vState = getState(state);
        let vCols = _.cloneDeep(vState.instances[instanceId].entityInfo.cols);
        _.forEach(vCols, function (col, k) {
            // console.log('colcolcol"); 
            if (col.Name === 'contextMenu') {
                _.forEach(col.Menu.Items, function (item, kk) {
                    item.OnClick = function (obj) {
                        let _this = this;
                        let sheet = _this.Owner.Sheet;
                        let row = _this.Owner.Row;
                        let v_entityId = _this.Name;
                        let initParams = {
                            entityId: v_entityId,
                            entityNm: _this.Text,
                            openType: 'modal',
                        };
                        let vOpenUiType = 'list';

                        let filters = [];
                        if (_this.uiType === 'list') {
                            vOpenUiType = 'list';
                            _.forEach(_this.Relation.to.cols, (col, k) => {
                                let vCol = {
                                    col: col.name,
                                    value: row[_.camelCase(_this.Relation.from.cols[k]['name'])]
                                };
                                filters.push(vCol);
                            });

                            if (_this.uiType === 'detail') {
                                initParams = {
                                    entityId: _this.entityId,
                                    entityllim: _this.entitym,
                                    openType: 'modal',
                                };
                                vOpenUiType = 'detail';
                                filters = [];
                            }
                            initParams.filters = filters;
                            let values = [
                                { key: 'instances.' + instanceId + '.openModal.visible', value: true },
                                { key: 'instances.' + instanceId + '.openModal.uiType', value: vOpenUiType },
                                { key: 'instances.' + instanceId + '.openModal.initParams', value: initParams }
                            ];
                            dispatch(actions.setValues(values));
                            return true;
                        }
                    }
                });

            }

        });
        return vCols;
        // getState(state).instances[instanceId].entityInfo.cols 
    });

    const thisInstance = useSelector((state) => getState(state).instances[instanceId]);
    useMounted(() => {
        search();
        console.log('useMounted');
        // afterMount(); 
    });

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
    const { sessionUserid, sessionUserlim, sessionCustGrpcd } = useSession();
    const nowDt = moment().format('YYYYMMDD');
    const menuid = useContext(TabContext);

    // 오른쪽에 카드리스트를 표시한다.
    useEffect(() => {
        const subscription = EventBus.subscribe('setLayout4', (data) => {
            data(contentList);
        });
        return () => {
            subscription.unsubscribe();
        };
        // eslint-disable-next-line 
    }, []);
    // Events 
    const onFormChange = (e) => {
        // console.log('Change');
    };
    useEffect(() => {
        form.resetFields();
        form.setFieldsValue(thisInstance.form);
    }, [thisInstance.form]);

    const onSaveConfirm = (e) => {
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
                            value: thisInstance.form[col.Name]
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

    useImperativeHandle(ref, () => ({
        onSaveConfirm: onSaveConfirm,
    }));

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
        list: {
            content01: {
                title: thisInstance.entityInfo.entityNm,
                component: (
                    <>
                        {thisInstance.openType === 'tab' &&
                            <TitleSub
                                title={thisInstance.entityInfo.entityNm}
                            />
                        }
                        <div className="wrap-table-form">
                            <div className="wrap-table" style={{ paddingTop: '5px', paddingbottom: '5px' }}>
                                <div className="">
                                    <table className="table-form">
                                        <tbody>
                                            {Object.keys(thisInstance.entityInfo.cols).map((vCol, i) => {
                                                let col = thisInstance.entityInfo.cols[i];
                                                // console.log(col.Header + ":" + 1); 
                                                // console.log(col);                                                
                                                return (
                                                    <tr>
                                                        {(() => {
                                                            if ((col.visible === undefined || col.Visible === true)) {
                                                                if (col.Type === 'Enum') {
                                                                    return (
                                                                        <td>
                                                                            <CodeCombo
                                                                                formItemllame={col.Name}
                                                                                label={col.Header}
                                                                                codeList={thisInstance.codelist.combo['combo' + col.codeGroupId]}
                                                                                alloption={true}
                                                                                allOptionName="선택"
                                                                                disabled={false}
                                                                            />
                                                                        </td>
                                                                    );
                                                                } else {
                                                                    return (
                                                                        <td>
                                                                            <FormItem
                                                                                label={col.Header}
                                                                                name={col.Name}
                                                                                key={i}>
                                                                                <Input />
                                                                            </FormItem>
                                                                        </td>
                                                                    );
                                                                }

                                                            } else {
                                                                // 20E ES 
                                                                return (
                                                                    <FormItem label={col.Header} name={col.Name} noStyle key={i}>
                                                                        <Input hidden={true} />
                                                                    </FormItem>
                                                                );
                                                            }
                                                        })()}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                )
            }
        },
        buttons: (
            <div className="wrap-btn">
                <Button onclick={onSaveConfirm} type="primary" htmlType="button">
                    {(() => {
                        if (thisInstance.editType === 'edit') {
                            return '저장';
                        } else if (thisInstance.editType === 'insert') {
                            return '추가';
                        }
                    })()}
                </Button>
            </div>
        )
    };


    const onformFinish = (formName, info) => {
        console.log(formName, info);
        const makeContentList = () => {
            let custom = schemaBos.customFunctions(thisInstance.entityInfo.entityId);
            if (custom != null) {
                if (custom.groups) {
                    contentList.list = {};
                    let colUseds = [];
                    // 정의된 컬럼들
                    _.forEach(custom.groups, (group, i) => {
                        let content = {
                            title: group.label,
                            component: (<></>)
                        };

                        contentList.list['content' + _.padStart(i + '', 2, "0")] = content;
                        let component = (
                            <>
                                {group.label && group.label !== '' &&
                                    <TitleSub title={group.label} />
                                }
                                <div className="wrap-table-form">
                                    <div className="wrap-table" style={{ paddingTop: '5px', paddingbottom: '5px' }}>
                                        <div className="">
                                            <table className="table-form">
                                                <tbody>
                                                    {Object.keys(group.items).map((lineIndex, ii) => {
                                                        let line = group.items[lineIndex];
                                                        return (
                                                            <tr>
                                                                {Object.keys(line).map((linecolIndex, iii) => {
                                                                    let lineCol = line[linecolIndex];
                                                                    return (
                                                                        <>
                                                                            {(() => {
                                                                                let col = _.find(thisInstance.entityInfo.cols, { Name: lineCol.name });
                                                                                colUseds.push(lineCol.name);
                                                                                if ((col.Visible === undefined || col.Visible === true)) {
                                                                                    // 보이는 필드
                                                                                    if (col.Type === 'Enum') {
                                                                                        return (
                                                                                            <td>
                                                                                                <CodeCombo
                                                                                                    formitemName={col.Name}
                                                                                                    label={col.Header}
                                                                                                    codelist={thisInstance.codeList.combo['Combo' + col.codeGroupId]}
                                                                                                    alloption={true}
                                                                                                    allOptionName="선택"
                                                                                                    disabled={false}
                                                                                                />
                                                                                            </td>
                                                                                        );
                                                                                    } else {
                                                                                        return (
                                                                                            <td>
                                                                                                <FormItem label={col.Header} name={col.Name} key={1}>
                                                                                                    <Input />
                                                                                                </FormItem>
                                                                                            </td>
                                                                                        );
                                                                                    }
                                                                                } else {
                                                                                    // 안보이는 필드
                                                                                    return (
                                                                                        <FormItem label={col.Header} name={col.Name} noStyle key={i}>
                                                                                            <Input hidden={true} />
                                                                                        </FormItem>
                                                                                    );
                                                                                }
                                                                            })()}
                                                                        </>
                                                                    );
                                                                })}
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                        content.component = component;
                    });
                    // 정의되지 않은 컬럼들
                    let colsUnused = _.filter(thisInstance.entityInfo.cols, (col) => {
                        if (!_.includes(colUseds, col.Name)) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    });
                    if (colsUnused.length > 0) {
                        let content = {
                            title: 'Hidden',
                            component: (<></>),
                        };
                        contentList.list['content' + _.padStart(custom.groups.length + '', 2, "0")] = content;
                        let component = (
                            <>
                                <TitleSub title={'Hidden'} />
                                <div className="wrap-table-form">
                                    <div className="wrap-table" style={{ paddingTop: '5px', paddingbottom: '5px' }}>
                                        <div className="">
                                            <table className="table-form">
                                                <tbody>
                                                    {Object.keys(colsUnused).map((lineColIndex, iii) => {
                                                        let lineCol = colsUnused[lineColIndex];
                                                        return (

                                                            <tr>
                                                                {(() => {
                                                                    let col = _.find(thisInstance.entityInfo.cols, { Name: lineCol.Name });
                                                                    if ((col.visible === undefined || col.visible === true)) {
                                                                        // 보이는 필드
                                                                        if (col.Type === 'Enum') {
                                                                            return (
                                                                                <td>
                                                                                    <CodeCombo
                                                                                        formItemllame={col.Name}
                                                                                        label={col.Header}
                                                                                        codeList={thisInstance.codeList.combo['combo' + col.codeGroupId]}
                                                                                        allOption={true}
                                                                                        alloptionName="선택"
                                                                                        disabled={false}
                                                                                    />
                                                                                </td>
                                                                            );
                                                                        } else {
                                                                            return (
                                                                                <td>
                                                                                    <FormItem label={col.Header}
                                                                                        name={col.Name}
                                                                                        key={iii}
                                                                                    >
                                                                                        <Input />
                                                                                    </FormItem>
                                                                                </td>
                                                                            );
                                                                        }
                                                                    } else {
                                                                        // 보이지 않는 필드
                                                                        return (
                                                                            <FormItem
                                                                                label={col.Header}
                                                                                name={col.Name}
                                                                                noStyle
                                                                                key={iii}>
                                                                                <Input hidden={true} />
                                                                            </FormItem>
                                                                        )
                                                                    }
                                                                })()}

                                                            </tr>

                                                        );
                                                    })}

                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                        content.component = component;
                    }
                }
                // subData 
                if (custom.showSubData && thisInstance.onload) {
                    // children 
                    let relation_child = _.filter(schemaBos.relations,
                        {
                            from: { entityId: thisInstance.entityInfo.entityId }
                        });

                    let contentListLength = _.keys(contentList.list).length;
                    _.forEach(relation_child, (rel, i) => {
                        let entityInfo = _.find(thisInstance.schema.entities, { "entityId": rel.to.entityId });
                        let content = {
                            title: rel.to.comments,
                            component: (<></>)
                        };
                        contentList.list['content' + _.padStart((contentListLength + 1) + '', 2, "0")] = content;
                        let component = (
                            <>
                                <TitleSub title={rel.to.comments} />
                                <SearchPage
                                    initParams={(() => {
                                        // let param _.cloneDeep(thisInstance.openModal.initParams); 
                                        let param = {
                                            entityId: rel.to.entityId,
                                            entitylin: rel.to.comments,
                                            filters: [],
                                            openType: "embeded",
                                            uiType: "list"
                                        };
                                        let vfilter = [];
                                        _.forEach(rel.to.cols, (col, icol) => {
                                            let colParent = rel.from.cols[icol];
                                            let filter = {
                                                col: col.name,
                                                value: thisInstance.form[_.camelCase(colParent.name)]
                                            };
                                            vfilter.push(filter);
                                        });
                                        param.filters = vfilter;
                                        param.callinstanceId = instanceId;
                                        return param;
                                    })()}
                                />
                            </>
                        );
                        content.component = component;
                    });
                }
            }
        };
        const onFinish = (values) => {
            // console.log(form.getFieldsValue(true)); 
            // onSave();
        };
        if (thisInstance && thisInstance.onload && !_.isEmpty(thisInstance.form)) {
            makeContentList();

        }
        return (
            <>
                {thisInstance && thisInstance.onload && (!_.isEmpty(thisInstance.form) || thisInstance.editType === 'insert') && (
                    <Form.Provider onFormFinish={onFinish} onFormChange={onFormChange} >
                        <Form form={form} onFinish={onFinish}>
                            {Object.keys(contentList.list).map((v, i) => {
                                return (
                                    <Card id={menuid + i} className="wrap-card" key={i}
                                        style={(() => {
                                            let content = contentList.list[v];
                                            if (content.title === 'Hidden') {
                                                return ({
                                                    // display: none 
                                                    marginTop: '5px'
                                                });
                                            } else {
                                                return ({
                                                    marginTop: '5px'
                                                });
                                            }
                                        })()}
                                    >
                                        {contentList.list[v].component}
                                    </Card>
                                );
                            })}
                            {contentList.buttons}
                        </Form>
                    </Form.Provider>
                )}
            </>
        );
    };
}

export default Detail;