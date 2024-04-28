import callApi from '@lib/callApi';
import { message as antMessage } from 'antd';
import { all, call, put, takeLatest, takeEvery, select } from 'redux-saga/effects';
import { actions } from './stateSearch';
// import { modalMessage } from '@lib/messageUtil'; 
import _ from 'lodash';
import { useSelector } from 'react-redux';
import { getState } from './stateSearch';
import { schemaGeneric } from '@generic/schemaGeneric';

function* fetchInitialInfo({ payload }) {
  const state = yield select((state) => getState(state));
  // backend가 설정될때 까지 보류
  // let vCommonCodes = _.filter(schemaGeneric.commonCodeList,{entityId : payload.entityId });

  let { isSuccess, data } = yield call(callApi, {
    url: '/generic/selectList',
    method: 'post',
    // credentials: 'include',
    data: {
      sqlId  : 'com.mapper.inventory.selectCommonUseList', 
      entityId : payload.entityId
    }
  });

  let vCommonCodes = data.list;
  if (isSuccess && data ) {
    let v_codeCategoryList = _.map(vCommonCodes, (v, k) => {
      return { codeCategory: v.codeCategory };
    });
    v_codeCategoryList.push({codeCategory: 'xxxxxx',codeCategoryNm : 'xxxxxx'});
    let { isSuccess, data } = yield call(callApi, {
      url: '/generic/selectList',
      method: 'post',
      data: {
        codeCategoryList: v_codeCategoryList ,
        sqlId  : 'com.mapper.inventory.selectCommonCodeList', 
      }
    });


    if (isSuccess && data) {

      //category 하위에 codeList 만들기
      let v_allCodeList = data.list;
      _.forEach(vCommonCodes, (m,i) => {
        let v_codeList = _.filter(v_allCodeList , { codeCategory : m.codeCategory } );
        m.list = v_codeList;
      });

      yield put(
        actions.setInitialInfo({
          instanceId: payload.instanceId,
          entityId: payload.entityId,
          tableName: payload.tableName,
          codeList: vCommonCodes,
          openType: payload.openType,
          uiType: payload.uiType,
          editType: payload.editType,
          callInstanceId: payload.callInstanceId
        })
      );
    }
  } else {
    yield put(
      actions.setInitialInfo({
        instanceId: payload.instanceId,
        entityId: payload.entityId,
        tableName: payload.tableName,
        codeList: [],
        openType: payload.openType,
        uiType: payload.uiType,
        editType: payload.editType,
        callInstanceId: payload.callInstanceId
      }),
    );
  }
}


function* getListPage({ payload }) {
  let searchFilter = yield select((state) => getState(state).instances[payload.instanceId].searchFilter);
  let pageInfo = yield select((state) => getState(state).instances[payload.instanceId].pageInfo);
  let instance = yield select((state) => getState(state).instances[payload.instanceId]);
  let { isSuccess, data } = yield call(callApi, {
    url: '/generic/getListPage',
    method: 'post',
    // data: payload, 
    // params: pageInfo,
    data: { ...searchFilter, ...pageInfo }
  });

  if (isSuccess && data) {

    let values = [];
    if (instance.uiType === 'list') {
      values.push({
        key: 'instances.' + payload.instanceId + '.list',
        value: data.list
      });
      values.push({
        key: 'instances.' + payload.instanceId + '.listTotalCount',
        value: data.totalCnt
      });
      values.push({
        key: 'instances.' + payload.instanceId + '.pageInfo.total',
        value: data.totalCnt
      });
    } else if (instance.uiType === 'detail') {
      values.push({
        key: 'instances.' + payload.instanceId + '.list',
        value: data.list
      });
      values.push({
        key: 'instances.' + payload.instanceId + '.editType',
        value: 'edit'
      });
      values.push({
        key: 'instances.' + payload.instanceId + '.listTotalcount',
        value: data.totalCnt
      });

      if (data.list.length > 0) {
        values.push({
          key: 'instances.' + payload.instanceId,
          value: data.list[0]
        });
      }
    }

    yield put(actions.setValues(values));
  }
}

function* save({ payload }) {
  const instance = yield select((state) => getState(state).instances[payload.instanceId]);
  // ui 타입에 따라 url 조정 
  let url = 'save';
  if (payload.editType === 'insert') {
    // detail insert 
    url = 'insert';
  }
  const { isSuccess, data, resultCode, message } = yield call(callApi, {
    url: '/offer/generic/' + url,
    method: 'post',
    data: payload,
  });

  if (isSuccess && resultCode >= 0) {
    // message.success(i18n.t('message.save')); 
    antMessage.success('저장이 완료되었습니다.');
    yield put(actions.getListPage({ instanceId: payload.instanceId }))
    // getAnplDsplWithdrawPage(); 
  } else {
    // modalMessage({
    //   title: '오류', 
    //   content: message, 
    //   width: '500px',
    // });
  }
}

export function* watchUnsplash() {
  yield all([
    takeEvery(actions.fetchInitialInfo, fetchInitialInfo),
    takeEvery(actions.getListPage, getListPage),
    takeEvery(actions.setSearchFilter, getListPage),
    takeEvery(actions.setPageInfo, getListPage),
    takeEvery(actions.save, save),
  ]);
}