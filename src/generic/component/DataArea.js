import React, { useState, useEffect, useRef } from 'react';
import { actions, getState } from '@/generic/state/stateSearch';
import { useDispatch, useSelector } from 'react-redux';
// import Ibsheet from '@components/grid/IbSheet'; 
import { Table } from 'antd';
// import TitleSub from '@components/layout/TitleSub'; 
import { Card, Button } from 'antd';
// import Pagination from '@components/grid/Pagenation'; 
// import {RowAddButton, RowDeleteButton, DownLoadButton, SaveButton } from '@components/button'; 
import _ from 'lodash';
// import Detail from '@generic/component/Details'; 
import { schemaGeneric, mergeCols } from '@generic/schemaGeneric.js';
import Item from 'antd/lib/list/Item';
import qs from 'qs';

const DataArea = ({ entityId, instanceId, ...restProps }) => {
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



  const openModalAdd = () => {
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
    <>
      <Table
        columns={cols}
        // rowKey={(record) => record.login.uuid}
        dataSource={list}
        pagination={pageInfo}
        loading={loading}
        onChange={handleTableChange}
        // scroll={{ x: 'max-content' }}
      />
    </>




  );
};

export default DataArea;
