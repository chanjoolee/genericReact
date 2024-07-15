import _ from 'lodash';
import callApi from 'src/common/lib/callApi';
import { Button, Checkbox, Form, Input, Col, Row } from "antd";

export const schemaGeneric = {
    entities: [],
    relations: [
        {
            from: {
                entityId: 'INVENTORY_ITEM_MASTER',
                cols: [
                    {
                        column_name: 'ITEM_CD'
                    }
                ]
            },
            to: {
                entityId: 'INVENTORY_IN_OUT',
                cols: [
                    {
                        column_name: 'ITEM_CD',
                    }
                ],
            },
            selectType: 'multi-select'
        },
        {
            from: {
                entityId: 'INVENTORY_WARE_HOUSE',
                cols: [
                    {
                        column_name: 'WARE_HOUSE_CD',
                    }
                ],
            },
            to: {
                entityId: 'INVENTORY_IN_OUT',
                cols: [
                    {
                        column_name: 'WARE_HOUSE_CD',
                    }
                ],
            },
            selectType: 'multi-select'
        },
    ],
    nameColumns: [
        {
            entityId: 'INVENTORY_WARE_HOUSE',
            cols: [
                {
                    column_name: 'WARE_HOUSE_CD',
                    name_column: 'WARE_HOUSE_NM',
                },
            ],
        },
        {
            entityId: 'INVENTORY_ITEM_MASTER',
            cols: [
                {
                    column_name: 'ITEM_CD',
                    name_column: 'ITEM_NAME',
                },
            ],
        },
    ],
    // Db에서 가져오기로 했으므로 사용안함. 
    // commonCodeList : [],
    customFunctions: {
        sm_anpl_dspl_ask_n: {
            entityId: 'sm_anpl_dspl_ask_n',
            entityNm: '타소전시신청내역',
            showSubData: true,
            afterOnload: (payload) => {
                let { uiType, openType, editType, form } = payload;

                const getSequence = async () => {
                    const { isSuccess, data } = await callApi({
                        url: `/generic/getSequence`,
                        method: 'post',
                        data: { sequenceName: 'somSequence' },
                        isLoding: false
                    });
                    if (isSuccess && data) {
                        let dispatch = window.state_search.dispatch;
                        let actions = window.state_search.actions;
                        dispatch(actions.setValue2('instances.' + payload.id + '.form.mngNo'), data.sequence);
                    }
                };

                if (uiType === 'detail' && editType === 'insert') {
                    getSequence();
                    console.log('customFunctions');
                }
            },
            sheet: {
                cols: {
                    someColumnName: {
                        attr: 'attr'
                    }
                }
            },
            groups: [
                {
                    id: 'general',
                    label: 'general',
                    items: [
                        [
                            { label: 'label', name: 'name' },
                            { label: 'label1', name: 'name1' }
                        ]
                    ]
                }
            ]
        },
        TBAS_NEW_ORG_MGMT: {
            entityId: 'TBAS_NEW_ORG_MGMT',
            entityNm: '통합조직관리',
            addSearchFilters: [
                { column_name: "ORG_CD" },
                { column_name: "ORG_NM" },
                { column_name: "APLY_STA_DT" },
                { column_name: "ORG_CL_CD" },

            ]
        },
        INVENTORY_IN_OUT: {
            entityId: 'INVENTORY_IN_OUT',
            entityNm: '창고입출고',
            addSearchFilters: [
                // {column_name : "ORDER_NO"},
                // {column_name : "IN_OUT_CD"},

            ]
        }
    },
    commonCode: {
        commonCodeGroup: {
            tableName: 'INVENTORY_CMM_CATEGORY',
            columns: {
                groupCode: 'CODE_CATEGORY',
                groupCodeName: 'CODE_CATEGORY_NM',
                groupCodeDesc: 'CODE_CATEGORY_DESC'
            }
        },
        commonCodeDetail: {
            tableName: 'INVENTORY_CMM_CD',
            columns: {
                commonCode: 'CODE_ID',
                commonCodeName: 'CODE_NM',
                commonCodeDesc: 'CODE_DESC',
                sortOrder: 'SORT_ORDER'
            }
        },
        commonCodeUse: {
            tableName: 'INVENTORY_CMM_USE',
            columns: {
                useTableName: 'TABLE_NAME',
                useColumnName: 'COLUMN_NAME'
            }
        }
    }
};

/**
 * Sheet 컬럼들의 추가적인 custom 속성 들을 정의한다.
 * @param {*} cols 컬럼들
 * @param {*} entityId 테이블
 * @returns 
 */
export const mergeCols = (cols, entityId) => {
    let rtnCols = _.cloneDeep(cols);
    let _this = schemaGeneric;
    if (!_this || !_this.customFunctions) {
        return rtnCols;
    }
    let custom = _this.customFunctions[entityId];
    if (custom) {
        rtnCols = _.map(rtnCols, (col) => {
            let rtn = col;
            // 추가적인 컬럼 속성들
            if (custom.sheet && custom.sheet.cols && custom.sheet.cols[col.Name]) {
                _.merge(rtn, custom.sheet.cols[col.Name]);
            }

            return rtn;
        });
    }
    return rtnCols;
};

export const addCustomSearchFilters = (filters, entityId) => {
    let rtnCols = _.cloneDeep(filters);
    let _this = schemaGeneric;
    if (!_this || !_this.customFunctions) {
        return rtnCols;
    }
    let entityobject = _.find(_this.entities, { entityId: entityId });
    let custom = _this.customFunctions[entityId];
    if (custom) {
        if (custom.addSearchFilters != null) {
            _.forEach(custom.addSearchFilters, (filter, i) => {
                let targetColumn = _.find(entityobject.cols, {
                    column_name: filter.column_name
                });
                let key = `searchFilter_${i}`;
                let component = (
                    <Col span={8} key={key}>
                        <Form.Item
                            type="Text"
                            label={targetColumn.column_comment}
                            name={_.camelCase("" + targetColumn.column_name)}
                        // rules={[rules.ruleRequired(), { validator: check }, rules.onlykor()]}
                        >
                            <Input
                                placeholder={targetColumn.column_comment + " 을 입력해 주세요."}
                            />
                        </Form.Item>
                    </Col>
                );
                rtnCols.push({
                    component: component,
                    targetColumn: targetColumn,
                    relationType: 'customSearchFilter',
                    join: {
                        childColumn: targetColumn,
                        relationType: 'customSearchFilter',
                    }
                });
            });
        }

    }
    return rtnCols;
}