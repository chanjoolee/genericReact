import React, { useState, useEffect, useRef } from 'react'; 
import { actions, getState } from '../state'; 
import { useDispatch, useSelector } from 'react-redux'; 
import Ibsheet from '@components/grid/IbSheet'; 
import TitleSub from '@components/layout/TitleSub'; 
import { Card, Button } from 'antd'; 
import Pagination from '@components/grid/Pagenation'; 
import {RowAddButton, RowDeleteButton, DownLoadButton, SaveButton } from '@components/button'; 
import _ from 'lodash'; 
import Detail from './Detail'; 
import { schemaBos, mergeCols } from '@pages/bos/common/generic/schemaBos'; 
import Item from 'antd/lib/list/Item';

const DataArea = ({entityId , instanceId, ...restProps}) => {
  const dispatch = useDispatch();
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
    _.forEach(vCols, function(col,k){ 
      // console.log('colcolcol') 
      if(col.Name === 'contextMenu'){
        _.forEach(col.contextMenu.Items, function(item, kk) { 
          if(item.Name != null) { 
            item.OnClick = function(obj) {
              let _this = this; 
              let sheet = this.Owner.Sheet; 
              let row = _this.Owner.Row; 
              let entityId = _this.Name; 
              let initParams = {
                entityId: entityId, 
                entity : _this.Text ,
                openType: 'modal', 
                ulType: 'list'
              };
              let vOpenUiType = 'list';
              
              // instance.openModal = true; 
              // instance.initParams = initParams; 
              let filters = []; 
              if(this.uiType === 'list') { 
                vOpenUiType = 'list'; 
                _.forEach(_this.Relation.to.cols, (col,k) => { 
                  let vol = {
                    col : col.name ,
                    value : row[_.camelCase(_this.Relation.from.cols[k]['name'])]
                  };
                  filters.push(vol);
                });
              }    
                  // 
              if( _this.uiType === 'detail') {
                initParams = {
                  entityid : _this.entityid, 
                  entitym: _this.entitym, 
                  openType: 'modal',
                  uiType : 'detail' 
                }; 
                vOpenUiType = 'detail';
                filters = []; 
                let keys = _.filter(thisInstance.entityInfo.dbCols,{column_key: "PRI"}); 
                _.forEach(keys, (col, k) => { 
                  let vCol = {
                    col: _.camelCase(col.column_name) ,
                    dbColumnName : col.column_name, 
                    value: row[_.camelCase(col.column_name)]
                  };
                  filters.push(vCol); 
                });
              }
              initParams.filters = filters; 
              let values = [
                { key: 'instances.' + instanceId + '.openModal.visible', value: true }, 
                { key: 'instances.' + instanceId + '.openModal.uiType', value: vOpenUiType}, 
                { key: 'instances.' + instanceId + '.openModal.initParams', value: initParams}
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
      thisSheet.current.loadSearchData({data: list, sync:true});
    }
  }, [list]);

  // 페이지 변경 이벤트 
  const onPageInfoChange = (pageNumber, pageSize) => {
    dispatch(actions.setPageInfo({ instanceId, pageNumber, pageSize }));
  };
  const contextMenuClick = () => {
    console.log('contextMenuClick');
  };


  const options = { 
    Def : { 
      Row: {
        CanFormula: 1, 
        CalcOrder : 'contextMenu'
      },
    },
    // sheet 공통설정 (Cols 설정보다 우선순위 높음)) 
    Cfg: {
      CanEdit: 1, 
      IgnoreFocused: 0, //
    },
    Events : { 
      onRowload : function (evtParam) {
        const { sheet, row, eventName } =  evtParam; 
      },
      onRenderFinish: function (evtParam) { 
        // 엑셀 양식 관련 내용 숨김
        const { sheet, row, eventName} = evtParam; 
        console.log("onRenderFinish");
      },
      onRowAdd: function (evtParam) {
        const { sheet , row, eventName} = evtParam; 
        console.log("onRowAdd");
      },
      // onAfterRowAdd : function(paramObject) { 
      // console.log("onAfter RowAdd”);
      // }
    },
    LeftCols : _.concat(
      {Extend: window.IB_Preset.STATUS, Nome: 'status'}, 
      leftCols
    ),
    Cols: cols
  }

  const openModalAdd = () => { 
    let initParams = {
      entityId: thisInstance.entityInfo.entityId, 
      entitylin : thisInstance.entityInfo.entityNm, 
      openType : 'modal', 
      uiType : 'detail', 
      editType: 'insert', 
      callinstanceId : thisInstance.id
    };
    let vOpenUiType = 'detail'; 
    let values =[
      { key: 'instances.' + instanceId + '.openModal.visible', value: true }, 
      { key: 'instances.' + instanceId + '.openModal.uiType', value: vOpenUiType },
      { key: 'instances.' + instanceId + '.openModal.initParams', value: initParams} 
    ];
    // 모달창띄우기 
    dispatch(actions.setValues(values));
  };
  
  return (
    <Card style={{border: 0 }}>
      <TitleSub title={(() => { 
        if(thisInstance.openType === 'tab') {
          return thisInstance.entityInfo.entity;
        }
      })()} 
      utilsGroupRight={
        <>
          <Button onClick={(e) => {
            openModalAdd();
          }}
          >
            추가 
          </Button> 
        </>
      }
    />
    <div className="wrap-sheet" 
      style= {(() => {
        if(thisInstance.openType === 'tab'){
          return { height: '650px' , minheight: '200px' };
        } else {
          return { height: '355px' , minheight: '200px' };
        }
      })()}
    >
      <Ibsheet 
        onLoadIbSheet={(sheet) => {
          thisSheet.current = sheet; 
          // 그리드 로드 완료 state true변경 
          setSheetReady(true); 
          if (list && list.length > 0) {
            sheet.loadSearchData({data:list, sync:true});
          }
        }}
        options={options} 
        data={[]} 
        style={{ height: 'auto' }}
      />
    </div> 
    <Pagination
      total={listTotalCount} 
      current={pageInfo.pagellumber} 
      pageSize={pageInfo.pageSize} 
      onChange={onPageInfoChange}
    />
    
    </Card>
  );
};

export default DataArea;
