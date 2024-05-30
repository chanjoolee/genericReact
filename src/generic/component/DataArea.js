import React, { useState, useEffect, useRef } from 'react';
import { actions, getState, getInstance, getAttr } from '@/generic/state/stateSearch';
import { useDispatch, useSelector, connect } from 'react-redux';
// import Ibsheet from '@components/grid/IbSheet'; 
import { Table, Dropdown, Space, message, Modal, Popconfirm } from 'antd';
// import TitleSub from '@components/layout/TitleSub'; 
import { Card, Button } from 'antd';
// import Pagination from '@components/grid/Pagenation'; 
// import {RowAddButton, RowDeleteButton, DownLoadButton, SaveButton } from '@components/button'; 
import _ from 'lodash';
// import Detail from '@generic/component/Details'; 
import { schemaGeneric, mergeCols } from '@generic/schemaGeneric.js';
import Item from 'antd/lib/list/Item';
import qs from 'qs';
import { DownOutlined, DeleteOutlined, EyeOutlined, EditOutlined, FileAddOutlined, DatabaseOutlined, BranchesOutlined, MinusOutlined } from '@ant-design/icons';
import { join } from 'redux-saga/effects';
import { v } from 'react-syntax-highlighter/dist/esm/languages/prism';
import { createSelector } from 'reselect';
import SearchPage from '@generic/container/SearchPage';
import DetailPage from "@generic/container/DetailPage";

// Assuming getState gets the appropriate slice of state, adjust this as per your state structure
const getList = (state, instanceId) => getState(state).instances[instanceId].list;

// Memoized selector
const getMemoizedList = createSelector(
  [getList],
  (list) => list
);

// const getPageInfo = (state, instanceId) => getState(state).instances[instanceId].pageInfo;
// const getMemoizedPageInfo = createSelector(
//   [getPageInfo],
//   (pageInfo) => pageInfo
// );

// const pageInfo = (state, instanceId) => getState(state).instances[instanceId].pageInfo;


const DataArea = ({ entityId, instanceId, ...restProps }) => {
  const modalwidth = {
    sm: 300, // Example width for 'sm'
    md: 500, // Example width for 'md'
    lg: 800  // Example width for 'lg'
  };
  const detailRef = useRef();

  const _schemaGeneric = schemaGeneric;
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [sheetReady, setSheetReady] = useState(false);

  // const list = useSelector((state) => getState(state).instances[instanceId].list);
  // const list = useSelector(state => getMemoizedList(state, instanceId));
  const list = useSelector((state) => getAttr(state, instanceId, 'list'));
  // const listTotalCount = useSelector((state) => getState(state).instances[instanceId].listTotalCount); //전체 조회건수 
  // const pageInfo = useSelector((state) => getState(state).instances[instanceId].pageInfo); //HOSE 
  // const pageInfo = useSelector(state => getMemoizedPageInfo(state, instanceId));
  const pageInfo = useSelector((state) => getAttr(state, instanceId, 'pageInfo'));
  const thisInstance = useSelector((state) => getState(state).instances[instanceId]);
  const searchCompleted = useSelector((state) => getState(state).searchCompleted);
  const cols = useSelector((state) => {
    let vState = getState(state);
    let vCols = _.cloneDeep(vState.instances[instanceId].entityInfo.cols);
    vCols = mergeCols(vCols, thisInstance.entityInfo.entityId);
    return vCols;
    // getState(state).instances[instanceId).entityInfo.cols 
  });


  const thisSheet = useRef(null);


  const getRandomuserParams = (params) => ({
    results: params.pagination?.pageSize,
    page: params.pagination?.current,
    ...params,
  });


  const handleTableChange = (newPagination, filters, sorter) => {
    let _page = {
      newPagination
    };
    dispatch(actions.setPageInfo({
      instanceId,
      current: newPagination.current,
      defaultPageSize: newPagination.defaultPageSize,
      pageSize: newPagination.pageSize,
      showSizeChanger: newPagination.showSizeChanger,
      total: newPagination.total
    }));

  };
  const contextMenuClick = () => {
    console.log('contextMenuClick');
  };


  function handleMenuClick(record, action) {
    message.info(`Action: ${action} on record id: ${record.id}`);
  }

  const makeActionItem = (filters) => {
    let items = [
      {
        key: 'view',
        label: <Button type="link" icon={<EyeOutlined />} size={'small'}>상세</Button>,
      },
      {
        key: 'update',
        label: <Button type="link" icon={<EditOutlined />} size={'small'}>편집</Button>,
      },
      {
        key: 'insert',
        label: <Button type="link" icon={<FileAddOutlined />} size={'small'}>추가</Button>,
      },
      {
        key: 'delete',
        label: <Popconfirm
          title="삭제"
          description="정말로 삭제하시겠습니까?"
          onConfirm={(e) => {
            // message.success('Click on Yes');
            let payload = {
              instanceId: instanceId,
              editType: 'delete',
              tableName: entityId,
              filters: filters
            };
            dispatch(actions.save(payload));
          }}
          onCancel={(e) => {
            // message.error('Click on No');
          }}
          okText="Yes"
          cancelText="No"
        >
          <Button type="link" icon={<DeleteOutlined />} size={'small'}>삭제</Button>
        </Popconfirm>,
      },
    ];
    // parent 
    let parent = {
      key: 'parent',
      label: <Button type="Text" icon={<DatabaseOutlined />} size={'small'}>Parent</Button>,
      type: 'group',
      children: []
    };
    _.forEach(thisInstance.entityInfo.parents, (m, i) => {
      let keys = m.joins.map(join => join.parentColumn.column_name).join(',');
      let targetEntity = _.find(_schemaGeneric.entities, { entityId: m.parentTableName });
      let labels = m.joins.map(join => {
        let targetEntity = _.find(_schemaGeneric.entities, { entityId: m.parentTableName });
        let column = _.find(targetEntity.cols, { column_name: join.parentColumn.column_name });
        return column.column_comment;
      }).join(',');
      //부모관계를 클릭한 경우
      let button = <Button
        type="link"
        icon={<div style={{ display: 'inline-block', width: '16px' }} />}
        // onClick={(e) => {
        //   message.success(targetEntity.entityNm);

        // }}
        size={'small'}>{targetEntity.entityNm + " : " + labels} </Button>;
      parent.children.push({
        key: m.parentTableName + " : " + keys,
        // label: "    " + targetEntity.entityNm + " : " + labels,
        label: button,
        information: { type: 'parent', ...m }
      });
    });
    items.push(parent);

    // child
    let children = {
      key: 'children',
      label: <Button type="Text" icon={<BranchesOutlined />} size={'small'}>Children</Button>,
      type: 'group',
      children: []
    };
    _.forEach(thisInstance.entityInfo.children, (m, i) => {
      let keys = m.joins.map(join => join.childColumn.column_name).join(',');
      let targetEntity = _.find(_schemaGeneric.entities, { entityId: m.childTableName });
      let labels = m.joins.map(join => {
        let targetEntity = _.find(_schemaGeneric.entities, { entityId: m.childTableName });
        let column = _.find(targetEntity.cols, { column_name: join.childColumn.column_name });
        return column.column_comment;
      }).join(',');
      children.children.push({
        key: m.childTableName + " : " + keys,
        label: <Button type="link" icon={<div style={{ display: 'inline-block', width: '16px' }} />} size={'small'}>{targetEntity.entityNm + " : " + labels} </Button>,
        information: { type: 'child', ...m }
      });
    });

    items.push(children);
    return items;
  }

  const getFiters = (record) => {
    let filters = [];
    //  filter 만들기
    let keyColumns = _.filter(thisInstance.entityInfo.cols, { isKey: true });
    _.forEach(cols, (col, i) => {
      let value = record[col.dataIndex];
      if (value != null) {
        filters.push({
          col: col.dataIndex,
          dbColumnName: col.dbColumnName,
          value,
          isKey: col.isKey
        });
      }
    });
    return filters;
  }
  return (
    <>
      {thisInstance && thisInstance.onload && searchCompleted && (
        <>
          <Table
            columns={[
              {
                title: 'No',
                key: 'index',
                width: 40,
                render: (text, record, index) => {
                  return ((pageInfo.current - 1) * pageInfo.pageSize) + index + 1;
                },
                fixed: 'left'
              },
              ...cols,
              {
                title: 'Action',
                key: 'operation',
                fixed: 'right',
                width: 100,
                render: (text, record, index) => {
                  let filters = getFiters(record);
                  let items = makeActionItem(filters);
                  // 참조
                  let openModalDetail = (info) => {

                    switch (info.key) {
                      case 'view':
                      case 'update':
                      case 'insert': {
                        let initParams = {
                          entityId: thisInstance.entityInfo.entityId,
                          entityNm: thisInstance.entityInfo.entityNm,
                          openType: 'modal',
                          uiType: 'detail',
                          editType: info.key,
                          callInstanceId: thisInstance.id,
                          filters: filters
                        };
                        let payload = {
                          instanceId: instanceId,
                          openModal: {
                            visible: true,
                            uiType: 'detail',
                            editType: info.key,
                            initParams: initParams
                          }
                        };
                        dispatch(actions.setValue3(payload));
                        break;
                      }

                      default: {
                        if (info.item.props.information.type == "parent") {
                          let _info = info.item.props.information;
                          let initParams = {
                            entityId: _info.joins[0].parentColumn.table_name,
                            entityNm: _info.joins[0].parentColumn.table_comment,
                            openType: 'modal',
                            uiType: 'list',
                            editType: 'list',
                            callInstanceId: thisInstance.id,
                            filters: filters
                          };
                          let payload = {
                            instanceId: instanceId,
                            openModal: {
                              visible: true,
                              openType: 'modal',
                              uiType: 'list',
                              editType: 'list',
                              initParams: initParams
                            }
                          };
                          dispatch(actions.setValue3(payload));
                        } else if (info.item.props.information.type == "child") {
                          let _info = info.item.props.information;
                          let initParams = {
                            entityId: _info.joins[0].childColumn.table_name,
                            entityNm: _info.joins[0].childColumn.table_comment,
                            openType: 'modal',
                            uiType: 'list',
                            editType: 'list',
                            callInstanceId: thisInstance.id,
                            filters: filters
                          };
                          let payload = {
                            instanceId: instanceId,
                            openModal: {
                              visible: true,
                              openType: 'modal',
                              uiType: 'list',
                              editType: 'list',
                              initParams: initParams
                            }
                          };
                          dispatch(actions.setValue3(payload));
                        }
                        break;
                      }

                    }

                  };

                  return (
                    <>
                      <Dropdown
                        menu={{
                          items,
                          onClick: (info) => {
                            openModalDetail(info);
                          }
                        }}
                      >
                        <a onClick={e => e.preventDefault()}>
                          <Space>
                            Action
                            <DownOutlined />
                          </Space>
                        </a>
                      </Dropdown>
                    </>
                  );
                },
              },
            ]}
            // rowKey={(record, index) => {
            //   // return ((pageInfo.current - 1) * pageInfo.pageSize) + index + 1 ;
            //   return record.rowNumber + '';
            // }}
            rowKey={(record) => record.rowNumber?.toString() || record.id?.toString()}
            dataSource={list}
            pagination={pageInfo}
            loading={loading}
            onChange={handleTableChange}
            size="middle" // small middle large
            scroll={{ x: 'max-content', y: 600 }}
          // style={{ minHeight: '600px' }}
          />
        </>
      )}
    </>

  );
};

const arePropsEqual = (prevProps, nextProps) => {
  return prevProps.list === nextProps.list;
}

const MemoizedMyComponent = React.memo(DataArea, arePropsEqual);
export default MemoizedMyComponent;




// export default DataArea;