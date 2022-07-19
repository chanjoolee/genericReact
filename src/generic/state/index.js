import React, {Suspense, lazy } from 'react';
import {createSlice, createAction } from '@reduxjs/toolkit';
import { pageDefaultSize } from 'src/generic/constant';
import _ from 'lodash';
import { schemaGeneric } from '@generic/schemaGeneric';

const columns = require("@generic/columns_tdcs_0620.json");
const columns1 = [];

const ROOT_SLICE_NAME = 'generic';
const SLICE_NAME = 'search';

const initialState = {
    basic : {
        id: '',
        onload : false,
        list : [],
        selectedData: {},
        codeList : {
            combo: {},
            enum: {},
            enumKeys: {}
        },
        form : {},
        searchFilter : {},
        parentKeyValue : {},
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
            pageNumber: 1,
            pageSize: pageDefaultSize
        },
        // 어떤형식으로 호출하는가
        openType : '', // tab, modal , embeded
        uiType: 'list', // list , detail
        editType : '', // edit , insert
        openModal : {
            visible: false , 
            uiType : '', // list , detail,
            initParams : {
                entityId: '',
                entityNm : '',
                openType : 'modal',
                editType : '' // edit, insert
            }
        }
    },
    instances : {}
}

const sagaAction = {
    fetchInitialInfo: createAction(`${ROOT_SLICE_NAME}/fetchInitialInfo`),
    getListPage: createAction(`${ROOT_SLICE_NAME}/getListPage`),
    save: createAction(`${ROOT_SLICE_NAME}/save`),

}

const makeSheetCols = (instance) => {
    let group = _.groupBy(_.concat(columns, columns1),'table_name');
    let entities = _.map(group , (value, key) => {
        return {
            entityId: key,
            entityNm : value[0].table_comment , 
            tableName : key , 
            cols : value 
        };
    });

    instance.schema = _.merge(schemaGeneric , {entities: entities});
    let entityObject = _.find(instance.schema.entities , {entityId: instance.entityInfo.entityId});
    if ( entityObject == null){
        console.log("해당 Entity Schema 를 찾을 수 없습니다." + instance.entityInfo.entityId);
    }

    instance.entityInfo.entityNm = entityObject.entityNm;
    instance.entityInfo.dbCols  = entityObject.cols;

    let cols = _.map(entityObject.cols , (v,k) => {
        let vRtn = {
            Header : v.column_comment ,
            dbColumnComment : v.column_comment , 
            Type : (() => {
                switch (v.data_type){
                    case 'varchar': return 'Text' ;
                    case 'bigint' : return 'Int' ;
                    case 'int' : return 'Int' ;
                    case 'float' : return 'Float';
                    case 'datetime' : return 'Date';
                    default : return 'Text';                                                                                                    
                }
            })()
            ,  Name : _.camelCase(v.column_name)
            , dbColumnName : v.column_name
        };
        // find codeList
        let vCommonCode = _.find(schemaGeneric.commonCodeList, {
            entityId: instance.entityInfo.entityId,
            column_name : v.column_name
        });
        if (vCommonCode != null ) {
            vRtn.Type = 'Enum';
            vRtn.Enum = instance.codeList.enum[vCommonCode.code_group_id];
            vRtn.EnumKeys = instance.codeList.enumKeys[vCommonCode.code_group_id];
            vRtn.codeGroupId = vCommonCode.code_group_id;
            vRtn.codeGroupNm = vCommonCode.code_group_nm;
        }

        if( _.includes(['RGSR_ID', 'RGST_DTM','UPPR_ID','UPD_DTM'], v.column_name)){
            vRtn.Visible = false;
            vRtn.isSystimColumn = true;
        }
        if( v.column_key === 'PRI') {
            vRtn.isKey = true;
        }
        if(vRtn.Type === 'Date'){
            _.merge(vRtn, {
                Format: 'yyyy-MM-dd',
                DataFormat: 'yyyyMMdd',
                EditFormat: 'yyyyMMdd'
            });
        }

        return vRtn;

    });    
    
    // parent info
    // find parents
    let relation_parents = _.filter(schemaGeneric.relations , {to: {entityId: instance.entityInfo.entityId}});

    _.forEach(relation_parents , (rel, i) => {
        //  부모컬럼찾기
        let targetEntity = _.find(schemaGeneric.entities , {entityId: rel.from.entityId});
        let parent = {
            parentTableName : targetEntity.tableName,
            childTableName : entityObject.tableName,
            joins : []
        };
        instance.entityInfo.parents.push(parent);

        // 조인컬럼들
        _.forEach(rel.from.cols, (col, j) => {
            // 부모컬럼
            let targetColumn = _.find(targetEntity.cols , {column_name : col.name});
            let nameColumn = _.colneDeep(targetColumn);
            // 쿼리에서 join on 정보
            let join = {
                parentColumnName : col.name ,
                childColumnName : rel.from.cols[j].name
            };
            parent.joins.push(join);
            if(targetColumn.name_column != null){
                nameColumn = _.find(targetEntity.cols , {column_name: targetColumn.name_column});
                join.nameColumn = nameColumn.column_name;
                // cols 에서 컬럼추가
            }
        })
    });

    // children
    let relation_child  = _.filter(schemaGeneric.relations, { from : {entityId: instance.entityInfo.entityId}});

    let contextCol = {
        Header : " ", 
        Type : "Text", 
        Name : "contextMenu" ,
        contextMenu : {
            Default: {Width: 200}
        },
        CanEdit : false, 
        Width :35,
        WidthPad: 35, 
        Align: "Left",
        IconAlign: "Center",
        Button: 'Html',
        Class: "IBCpmtextCol",
        ButtonText:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M0 96C0 78.33 14.33 64 32 64H416C433.7 64 448 78.33 448 96C448 113.7 433.7 128 416 128H32C14.33 128 0 113.7 0 96zM0 256C0 238.3 14.33 224 32 224H416C433.7 224 448 238.3 448 256C448 273.7 433.7 288 416 288H32C14.33 288 0 273.7 0 256zM416 448H32C14.33 448 0 433.7 0 416C0 398.3 14.33 384 32 384H416C433.7 384 448 398.3 448 416C448 433.7 433.7 448 416 448z"/></svg>'
    };

    contextCol.contextMenu.Items = _.map( relation_child, (value, key_) => {
        let rtn = {
            Name : value.to.entityId,
            Text : value.to.comments, 
            Restion : value, 
            RelationType : 'child',
            uiType : 'list'
        };

        return rtn;
    });
    //상세
    contextCol.contextMenu.Items.push({
        Name: 'detail',
        Text : '상세',
        entityId : instance.entityInfo.entityId,
        entityNm : instance.entityInfo.entityNm,
        uiType : 'detail',
        Width : 200
    });

    // parent relation
    let itemsParents = _.map(relation_parents , (value, key ) => {
        let rtn = {
            Name : value.from.entityId,
            Text : value.from.comments, 
            Restion : value, 
            RelationType : 'parent',
            uiType : 'list'
        };

        return rtn;
    });

    contextCol.contextMenu.Items.push.apply(contextCol.contextMenu.Items , itemsParents);

    instance.entityInfo.leftCols = [contextCol];
    instance.entityInfo.cols = cols;
    
}

const reducers = {
    initState: (state) => {
        return state;
    },
    deleteInstance : (state, {payload: {instanceId}}) => {
        delete state.instances[instanceId];
    },
    setInitialInfo : (state , {payload : {instanceId, entityId , tableName, codeList, openType, uiType, editType , callInstanceId}}) => {
        let newinstance = _.cloneDeep(state.basic);
        newinstance.id = instanceId;
        state.instances[instanceId] = newinstance;
        newinstance.entityInfo.entityId = entityId;
        newinstance.entityInfo.tableName = tableName;
        newinstance.codeList.combo = codeList;

        _.forEach(codeList, (code, i) => {
            if(code.length > 0){
                newinstance.codeList.enum[code[0].codeGroupId]  = _.join([''].concat(_.flatMap(code,'label')), '|');
                newinstance.codeList.enum[code[0].codeGroupId]  = _.join([''].concat(_.flatMap(code,'cmnCd')), '|');
            }
        });
        makeSheetCols(newinstance);
        newinstance.openType = openType;
        newinstance.uiType = uiType;
        newinstance.editType = editType;
        newinstance.callInstanceId = callInstanceId;

        newinstance.onload = true;

        if( newinstance.uiType === 'detail'  && newinstance.editType === 'insert'){
            let defaultValue = state.instances[callInstanceId].parentKeyValue;
            if( defaultValue != null) {
                _.merge(newinstance.form , defaultValue);
            }
        }

        // after onload
        let custom = schemaGeneric.customFunctions[newinstance.entityInfo.entityId];        
        if(custom != null){
            if(custom.afterOnload){
                custom.afterOnload(newinstance);
            }
        }
    } ,
    setValue : {
        reducer : (state, {payload: {key, value}}) => {
            state[key] = value;
        },
        prepare : (key, value ) => {
            return {payload: {key, value}}
        }
    }, 
    setValue2 : {
        reducer : (state, {payload: {key, value}}) => {
            _.update(state, key 
                , function(){
                    return value;
                }
            );
        },
        prepare : (key, value ) => {
            return {payload: {key, value}}
        }
    } ,
    setValues : (state, {payload}) => {
        _.forEach(payload, (v,i) => {
            _.update(state, v.key
                , function (){
                    return v.value;
                }
            );
        });
    },
    setSearchFilter : (state , {payload : {instanceId , ...rest}}) => {
        state.instances[instanceId].searchFilter = rest;
        state.instances[instanceId].pageInfo.pageNumber = 1;
    },
    setPageInfo: (state, {payload : {instanceId , pageNumber , pageSize}}) => {
        state.instances[instanceId].pageInfo.pageNumber = pageNumber;
        state.instances[instanceId].pageInfo.pageSize = pageSize;
    }
};


const slice = createSlice({
    name : ROOT_SLICE_NAME ,
    initialState , 
    reducers,
});

export const getStateAll = (state) => state;
// export const getState = (state) => state[ROOT_SLICE_NAME][SLICE_NAME];
export const getState = (state) => state[ROOT_SLICE_NAME];
export const actions = {
    ...slice.actions,
    ...sagaAction
};

export default slice.reducer;