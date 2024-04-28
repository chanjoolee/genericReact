import React, { useState, useEffect, useRef } from 'react';
import { actions, getState } from '@/generic/state/stateSearch';
import { useDispatch, useSelector } from 'react-redux';
// import Ibsheet from '@components/grid/IbSheet'; 
import { Table, Dropdown, Menu, Space, message  } from 'antd';
// import TitleSub from '@components/layout/TitleSub'; 
import { Card, Button } from 'antd';
// import Pagination from '@components/grid/Pagenation'; 
// import {RowAddButton, RowDeleteButton, DownLoadButton, SaveButton } from '@components/button'; 
import _ from 'lodash';
// import Detail from '@generic/component/Details'; 
import { schemaGeneric, mergeCols } from '@generic/schemaGeneric.js';
import Item from 'antd/lib/list/Item';
import qs from 'qs';
import { DownOutlined } from '@ant-design/icons';
import { join } from 'redux-saga/effects';
import { v } from 'react-syntax-highlighter/dist/esm/languages/prism';

const DataArea = ({ entityId, instanceId, ...restProps }) => {
  const _schemaGeneric = schemaGeneric;
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [sheetReady, setSheetReady] = useState(false);
  const list = useSelector((state) => getState(state).instances[instanceId].list);
  const listTotalCount = useSelector((state) => getState(state).instances[instanceId].listTotalCount); //전체 조회건수 
  const pageInfo = useSelector((state) => getState(state).instances[instanceId].pageInfo); //HOSE 
  const thisInstance = useSelector((state) => getState(state).instances[instanceId]);
  const cols = useSelector((state) => {
    let vState = getState(state);
    let vCols = _.cloneDeep(vState.instances[instanceId].entityInfo.cols);
    vCols = mergeCols(vCols, thisInstance.entityInfo.entityId);
    return vCols;
    // getState(state).instances[instanceId).entityInfo.cols 
  });
  const leftCols = useSelector((state) => {
    let vState = getState(state);
    let vCols = _.cloneDeep(vState.instances[instanceId].entityInfo.leftcols);
    _.forEach(vCols, function (col, k) {
      // console.log('colcolcol') 
      if (col.Name === 'contextMenu') {
        _.forEach(col.contextMenu.Items, function (item, kk) {
          if (item.Name != null) {
            item.OnClick = function (obj) {
              let _this = this;
              let sheet = this.Owner.Sheet;
              let row = _this.Owner.Row;
              let entityId = _this.Name;
              let initParams = {
                entityId: entityId,
                entity: _this.Text,
                openType: 'modal',
                ulType: 'list'
              };
              let vOpenUiType = 'list';

              // instance.openModal = true; 
              // instance.initParams = initParams; 
              let filters = [];
              if (this.uiType === 'list') {
                vOpenUiType = 'list';
                _.forEach(_this.Relation.to.cols, (col, k) => {
                  let vol = {
                    col: col.name,
                    value: row[_.camelCase(_this.Relation.from.cols[k]['name'])]
                  };
                  filters.push(vol);
                });
              }
              // 
              if (_this.uiType === 'detail') {
                initParams = {
                  entityid: _this.entityid,
                  entitym: _this.entitym,
                  openType: 'modal',
                  uiType: 'detail'
                };
                vOpenUiType = 'detail';
                filters = [];
                let keys = _.filter(thisInstance.entityInfo.dbCols, { column_key: "PRI" });
                _.forEach(keys, (col, k) => {
                  let vCol = {
                    col: _.camelCase(col.column_name),
                    dbColumnName: col.column_name,
                    value: row[_.camelCase(col.column_name)]
                  };
                  filters.push(vCol);
                });
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
        col.OnClick = (evtParam) => {
          // const { sheet, row, col } - evtParam; 
          var pos = { Align: 'right below' };
          evtParam.sheet.showMenu(evtParam.row, evtParam.col, col.contextMenu, pos, null, null);
          return true;
        };
      }
    });

    return vCols;
    //  getState(state). instances[instance Id).entityinfo.cols
  });

  const thisSheet = useRef(null);
  useEffect(() => {
    if (thisSheet.current) {
      thisSheet.current.loadSearchData({ data: list, sync: true });
    }
  }, [list]);

  const getRandomuserParams = (params) => ({
    results: params.pagination?.pageSize,
    page: params.pagination?.current,
    ...params,
  });


  const handleTableChange = (newPagination, filters, sorter) => {

    dispatch(actions.setPageInfo({
      instanceId,
      ...newPagination,
      // showTotal: (total, range) => {
      //   console.log(range);
      //   return `total ${total}` ;
      // },
    }));

  };
  const contextMenuClick = () => {
    console.log('contextMenuClick');
  };


  var items = [
    {
      key: '1',
      type: 'group',
      label: 'Group title',
      children: [
        {
          key: '1-1',
          label: '1st menu item',
        },
        {
          key: '1-2',
          label: '2nd menu item',
        },
      ],
    },
    {
      key: '2',
      label: 'sub menu',
      children: [
        {
          key: '2-1',
          label: '3rd menu item',
        },
        {
          key: '2-2',
          label: '4th menu item',
        },
      ],
    },
    {
      key: '3',
      label: 'disabled sub menu',
      disabled: true,
      children: [
        {
          key: '3-1',
          label: '5d menu item',
        },
        {
          key: '3-2',
          label: '6th menu item',
        },
      ],
    },
  ];



  (() => {
    items = [
      {
        key: 'detail',
        label: '상세',
      },
      {
        key: 'edit',
        label: '편집',
      },
      {
        key: 'add',
        label: '추가',
      },
      {
        key: 'delete',
        label: '삭제',
      },
     
      
    ];
    // parent 
    let parent = {
      key: 'parent',
      label : 'Parent',
      type: 'group',
      children: []
    };    
    _.forEach(thisInstance.entityInfo.parents, (m, i) => {
      let keys = m.joins.map(join => join.parentColumn.column_name).join(',');
      let targetEntity = _.find(_schemaGeneric.entities, { entityId: m.parentTableName });
      let labels = m.joins.map(join => {
      let targetEntity = _.find(_schemaGeneric.entities, { entityId: m.parentTableName });
        let column = _.find(targetEntity.cols, {column_name : join.parentColumn.column_name });
        return column.column_comment;
      }).join(',');
      parent.children.push({
        key: m.parentTableName + " : " + keys ,
        label : targetEntity.entityNm + " : " + labels ,      
        information : { type: 'parent' , ...m }  
      });
    });
    items.push(parent);

    // child
    let children = {
      key: 'children',
      label : 'Children',
      type: 'group',
      children: []
    };    
    _.forEach(thisInstance.entityInfo.children, (m, i) => {
      let keys = m.joins.map(join => join.childColumn.column_name).join(',');
      let targetEntity = _.find(_schemaGeneric.entities, { entityId: m.childTableName });
      let labels = m.joins.map(join => {
      let targetEntity = _.find(_schemaGeneric.entities, { entityId: m.childTableName });
        let column = _.find(targetEntity.cols, {column_name : join.childColumn.column_name });
        return column.column_comment;
      }).join(',');
      children.children.push({
        key: m.childTableName + " : " + keys ,
        label : targetEntity.entityNm + " : " + labels ,      
        information : { type: 'child' , ...m }  
      });
    });
    
    items.push(children);

  })();


  function handleMenuClick(record, action) {
    message.info(`Action: ${action} on record id: ${record.id}`);
  }

  return (
    <>
      <Table
        columns={[
          {
            title: 'No',
            key: 'index',
            width: 40,
            render: (text, record, index) => ((pageInfo.current - 1) * pageInfo.pageSize) + index + 1,
            fixed: 'left'
          },
          ...cols ,
          {
            title: 'Action',
            key: 'operation',
            fixed: 'right',
            width: 100,
            render: (text, record, index) => {

              // 참조
              let openModalAdd = () => {
                let initParams = {
                  entityId: thisInstance.entityInfo.entityId,
                  entitylin: thisInstance.entityInfo.entityNm,
                  openType: 'modal',
                  uiType: 'detail',
                  editType: 'insert',
                  callinstanceId: thisInstance.id
                };
                let vOpenUiType = 'detail';
                let values = [
                  { key: 'instances.' + instanceId + '.openModal.visible', value: true },
                  { key: 'instances.' + instanceId + '.openModal.uiType', value: vOpenUiType },
                  { key: 'instances.' + instanceId + '.openModal.initParams', value: initParams }
                ];
                // 모달창띄우기 
                dispatch(actions.setValues(values));
              };
              

              return (
                <Dropdown
                  menu={{ 
                    items,
                    onClick: (info) => { 
                      console.log(info.key);
                      console.log(info.item.props.information);
                      console.log(record);
                    }
                  }} 
                  // overlay={items1}
                >
                  <a onClick={e =>  e.preventDefault()} >
                    <Space>
                      Action
                      <DownOutlined />
                    </Space>
                  </a>
                </Dropdown>

              );
            },
          },
        ]}
        rowKey={(record,index) => {
          return ((pageInfo.current - 1) * pageInfo.pageSize) + index + 1 ;
        }}
        dataSource={list}
        pagination={pageInfo}
        loading={loading}
        onChange={handleTableChange}
        // size="small"
        // scroll={{ x: 'max-content' , y: 600 }}
      />
    </>

  );
};

export default DataArea;
