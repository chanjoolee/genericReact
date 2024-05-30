import React, { Suspense, lazy } from 'react';
import { createSlice, createAction } from '@reduxjs/toolkit';
import { pageDefaultSize } from 'src/generic/constant';
import _ from 'lodash';
import { schemaGeneric } from '@generic/schemaGeneric';

const columns = require("@generic/columns_inventory.json");
const columns1 = [];

const _schemaGeneric = schemaGeneric;
const ROOT_SLICE_NAME = 'generic';
const SLICE_NAME = 'search';

const initialState = {
    basic: {
        id: '',
        onload: false,
        searchCompleted: true,
        list: [],
        selectedData: {},
        codeList: {
            combo: {},
            enum: {},
            enumKeys: {}
        },
        // form: {},
        searchFilter: {},
        entityInfo: {
            entityId: '',
            entityNm: '',
            tableName: '',
            cols: [],
            parents: [],
            children: []
        },
        // 고정적인 UI 로표현되는 Instance ex) master and sub
        subInstances: [],
        parentInstances: [],
        // 모달로 표현되는 Instance
        calleeInstance: {}, // 내가 호출한 인스턴스
        callInstance: {}, // 나를 호출한 인스턴스
        listTotalCount: 0,
        pageInfo: {
            current: 1,
            pageSize: pageDefaultSize,
            defaultPageSize: 10,
            showSizeChanger: true,
            total: 0,
            showTotal: (total, range) => {
                // console.log(range);
                return `Total ${total}`;
            },
        },
        // 어떤형식으로 호출하는가
        openType: '', // tab, modal , embeded
        uiType: 'list', // list , detail
        editType: '', // update , insert
        openModal: {
            visible: false,
            uiType: '', // list , detail,
            initParams: {
                entityId: '',
                entityNm: '',
                openType: 'modal',
                editType: '', // update, insert
                uiType: 'detail',
                callInstanceId: '',
                filters: []
            }
        }
    },
    searchCompleted: true,
    instances: {}
}

const sagaAction = {
    fetchInitialInfo: createAction(`${ROOT_SLICE_NAME}/${SLICE_NAME}/fetchInitialInfo`),
    getListPage: createAction(`${ROOT_SLICE_NAME}/${SLICE_NAME}/getListPage`),
    save: createAction(`${ROOT_SLICE_NAME}/${SLICE_NAME}/save`),

}

const makeSheetCols = (instance) => {
    let group = _.groupBy(_.concat(columns, columns1), 'table_name');
    let entities = _.map(group, (value, key) => {
        return {
            entityId: key,
            entityNm: value[0].table_comment,
            tableName: key,
            cols: value
        };
    });

    instance.schema = _.merge(_schemaGeneric, { entities: entities });
    let entityObject = _.find(instance.schema.entities, { entityId: instance.entityInfo.entityId });
    if (entityObject == null) {
        console.log("해당 Entity Schema 를 찾을 수 없습니다." + instance.entityInfo.entityId);
    }

    instance.entityInfo.entityNm = entityObject.entityNm;
    instance.entityInfo.dbCols = entityObject.cols;

    let cols = _.map(entityObject.cols, (v, k) => {
        let vRtn = {
            title: v.column_comment,
            dbColumnComment: v.column_comment,
            Type: (() => {
                switch (v.data_type) {
                    case 'varchar': return 'Text';
                    case 'bigint': return 'Int';
                    case 'int': return 'Int';
                    case 'float': return 'Float';
                    case 'datetime': return 'Date';
                    default: return 'Text';
                }
            })()
            , dataIndex: _.camelCase(v.column_name)
            , dbColumnName: v.column_name
            , width: 120
            , originColInfo: v
        };


        if (_.includes(['RGSR_ID', 'RGST_DTM', 'UPPR_ID', 'UPD_DTM'], v.column_name)) {
            vRtn.Visible = false;
            vRtn.isSystimColumn = true;
        }
        if (v.column_key === 'PRI') {
            vRtn.isKey = true;
        }
        if (vRtn.Type === 'Date') {
            _.merge(vRtn, {
                Format: 'yyyy-MM-dd',
                DataFormat: 'yyyyMMdd',
                EditFormat: 'yyyyMMdd'
            });
        }

        return vRtn;

    });

    // 첫번째 컬럼에 번호를 추가한다.

    // parent info
    // find parents
    let relation_parents = _.filter(_schemaGeneric.relations, { to: { entityId: instance.entityInfo.entityId } });

    _.forEach(relation_parents, (rel, i) => {
        //  부모컬럼찾기
        let targetEntity = _.find(_schemaGeneric.entities, { entityId: rel.from.entityId });
        let parent = {
            parentTableName: targetEntity.tableName,
            childTableName: entityObject.tableName,
            joins: []
        };
        instance.entityInfo.parents.push(parent);

        // 조인컬럼들
        _.forEach(rel.from.cols, (col, j) => {
            // 부모컬럼
            let targetColumn = _.find(targetEntity.cols, { column_name: col.column_name });
            let childColumn = _.find(entityObject.cols, { column_name: rel.to.cols[j].column_name });
            // 쿼리에서 join on 정보
            let join = {
                type: 'parent',
                parentColumn: targetColumn,
                childColumn: childColumn,
                nameColumn: null,  // column info 임 {} 
            };
            parent.joins.push(join);
            // name column 우선적으로 cols 에서 가져옮.
            if (targetColumn['name_column'] != null) {
                join.nameColumn = targetColumn['name_column'];
                // cols 에서 컬럼추가
            }
            // name column 만약 없다면 schemaGeneric.nameColumns 에서 가져옮
            if (join.nameColumn == null) {
                let findName = _.find(_schemaGeneric.nameColumns, { entityId: rel.from.entityId, cols: [{ column_name: col.column_name }] });
                // cols: {column_name : col.column_name}
                if (findName != null) {
                    join.nameColumn = _.find(targetEntity.cols, { column_name: findName.cols[0].name_column });
                }
            }
        })
    });

    // children
    let relation_child = _.filter(_schemaGeneric.relations, { from: { entityId: instance.entityInfo.entityId } });

    _.forEach(relation_child, (rel, i) => {
        //  부모컬럼찾기
        let targetEntity = _.find(_schemaGeneric.entities, { entityId: rel.to.entityId });
        let child = {
            parentTableName: entityObject.tableName,
            childTableName: targetEntity.tableName,
            joins: []
        };
        instance.entityInfo.children.push(child);

        // 조인컬럼들
        _.forEach(rel.to.cols, (col, j) => {
            // 부모컬럼
            let parentColumn = _.find(entityObject.cols, { column_name: rel.from.cols[j].column_name });
            let childColumn = _.find(targetEntity.cols, { column_name: col.column_name });
            // 쿼리에서 join on 정보
            let join = {
                type: 'child',
                parentColumn: parentColumn,
                childColumn: childColumn,
                nameColumn: null,  // column info 임 {} 
            };
            child.joins.push(join);
            // name column 우선적으로 cols 에서 가져옮.
            if (parentColumn['name_column'] != null) {
                join.nameColumn = parentColumn['name_column'];
                // cols 에서 컬럼추가
            }
            // name column 만약 없다면 schemaGeneric.nameColumns 에서 가져옮
            if (join.nameColumn == null) {
                let findName = _.find(_schemaGeneric.nameColumns, { entityId: rel.from.entityId, cols: [{ column_name: parentColumn.column_name }] });
                // cols: {column_name : col.column_name}
                if (findName != null) {
                    join.nameColumn = _.find(targetEntity.cols, { column_name: findName.cols[0].name_column });
                }
            }
        })
    });

    instance.entityInfo.cols = cols;

}

const reducers = {
    initState: (state) => {
        return state;
    },
    deleteInstance: (state, { payload: { instanceId } }) => {
        // let myInstance = state.instances[instanceId];
        // if( myInstance.callInstance.id != null){
        //     let callInstance = state.instances[myInstance.callInstance.id];
        //     if(callInstance != null){
        //         callInstance.calleeInstance = {};
        //     }
        // }

        delete state.instances[instanceId];
    },
    setInitialInfo: (state, { payload: { instanceId, entityId, tableName, codeList, openType, uiType, editType, callInstanceId } }) => {
        let newinstance = _.cloneDeep(state.basic);
        newinstance.id = instanceId;
        state.instances[instanceId] = newinstance;
        newinstance.entityInfo.entityId = entityId;
        newinstance.entityInfo.tableName = tableName;
        newinstance.codeList.combo = codeList;

        _.forEach(codeList, (code, i) => {
            if (code.length > 0) {
                newinstance.codeList.enum[code.codeCategory] = _.join([''].concat(_.flatMap(code.list, 'codeId')), '|');
                newinstance.codeList.enumKeys[code.codeCategory] = _.join([''].concat(_.flatMap(code.list, 'codeNm')), '|');
            }
        });
        makeSheetCols(newinstance);
        newinstance.openType = openType;
        newinstance.uiType = uiType;
        newinstance.editType = editType;
        newinstance.onload = true;
        if (callInstanceId != null) {
            newinstance.callInstanceId = callInstanceId;
            // let callInstance = state.instances[callInstanceId];
            // newinstance.callInstance = callInstance;
            // callInstance.calleeInstance = newinstance;
        }

        // // after onload
        // let custom = _schemaGeneric.customFunctions[newinstance.entityInfo.entityId];
        // if (custom != null) {
        //     if (custom.afterOnload) {
        //         custom.afterOnload(newinstance);
        //     }
        // }
    },
    setValue: {
        reducer: (state, { payload: { key, value } }) => {
            state[key] = value;
        },
        prepare: (key, value) => {
            return { payload: { key, value } }
        }
    },
    setValue2: {
        reducer: (state, { payload: { key, value } }) => {
            _.update(state, key
                , function () {
                    return value;
                }
            );
        },
        prepare: (key, value) => {
            return { payload: { key, value } }
        }
    },
    setValues: (state, { payload }) => {
        _.forEach(payload, (v, i) => {
            _.update(state, v.key
                , function () {
                    return v.value;
                }
            );
        });
        // state.instances[instanceId].onload = true;
    },
    setValue3: (state, { payload: { instanceId, searchCompleted, ...rest } }) => {
        state.instances[instanceId] = { ...state.instances[instanceId], ...rest };
        if (searchCompleted != null)
            state.searchCompleted = searchCompleted;
    },
    // setValue3: (state, { payload }) => {
    //     state = { ...payload } ;
    // },
    setSearchFilter: (state, { payload: { instanceId, ...rest } }) => {
        state.instances[instanceId].searchFilter = { ...state.instances[instanceId].searchFilter, ...rest };
        state.instances[instanceId].pageInfo.current = 1;
        state.searchCompleted = false;
    },
    setPageInfo: (state, { payload: { instanceId, ...rest } }) => {
        state.instances[instanceId].pageInfo = { ...state.instances[instanceId].pageInfo, ...rest }
        state.searchCompleted = false;
    }
};


const slice = createSlice({
    name: ROOT_SLICE_NAME,
    initialState,
    reducers,
});

export const getStateAll = (state) => state;
export const getState = (state) => state[ROOT_SLICE_NAME][SLICE_NAME];
export const getInstance = (state, id) => {
    if (state[ROOT_SLICE_NAME][SLICE_NAME] != null) {
        return state[ROOT_SLICE_NAME][SLICE_NAME].instances[id];
    } else {
        return null;
    }
};
export const getAttr = (state, id, key) => {
    if (state[ROOT_SLICE_NAME][SLICE_NAME] != null && state[ROOT_SLICE_NAME][SLICE_NAME].instances[id] != null) {
        return _.get(state[ROOT_SLICE_NAME][SLICE_NAME].instances[id], key);
    } else {
        return null;
    }
};
// export const getState = (state) => state[ROOT_SLICE_NAME];
export const actions = {
    ...slice.actions,
    ...sagaAction
};

export default slice.reducer;