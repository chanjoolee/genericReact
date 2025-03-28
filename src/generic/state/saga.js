import callApi from '@lib/callApi';
import { message as antMessage, Modal } from 'antd';
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
  let commonInfo = schemaGeneric.commonCode;
  let { isSuccess, data } = yield call(callApi, {
    url: '/generic/selectList',
    method: 'post',
    // credentials: 'include',
    data: {
      sqlId: 'com.mapper.generic.mysql.selectCommonUseList',
      entityId: payload.entityId,
      commonCodeInfo: commonInfo
    }
  });

  let vCommonCodes = data.list;
  if (isSuccess && data) {
    let v_codeCategoryList = _.map(vCommonCodes, (v, k) => {
      return { codeCategory: v[_.camelCase(commonInfo.commonCodeGroup.columns.groupCode)] };
    });
    v_codeCategoryList.push({ codeCategory: 'xxxxxx', codeCategoryNm: 'xxxxxx' });
    let { isSuccess, data } = yield call(callApi, {
      url: '/generic/selectList',
      method: 'post',
      data: {
        codeCategoryList: v_codeCategoryList,
        commonCodeInfo: commonInfo,
        sqlId: 'com.mapper.generic.mysql.selectCommonCodeList',
      }
    });


    if (isSuccess && data) {

      //category 하위에 codeList 만들기
      let v_allCodeList = data.list;
      _.forEach(vCommonCodes, (m, i) => {
        let v_codeList = _.filter(v_allCodeList, { codeCategory: m.codeCategory });
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
  let state = yield select((state) => getState(state));
  let { isSuccess, data } = yield call(callApi, {
    url: '/generic/getListPage',
    method: 'post',
    // data: payload, 
    // params: pageInfo,
    data: { ...searchFilter, ...pageInfo }
  });

  if (isSuccess && data) {

    let values = [];
    // let newState  = { ...state };
    // let newInstance = { ...instance };
    let newState = _.cloneDeep(state);
    let newInstance = _.cloneDeep(instance);
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

      newInstance.instanceId = payload.instanceId;
      newInstance.list = data.list;
      newInstance.listTotalCount = data.totalCnt;
      newInstance.pageInfo.total = data.totalCnt;
      newInstance.searchCompleted = true;
      // newState.instances[payload.instanceId] = newInstance ;

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

      newInstance.instanceId = payload.instanceId;
      newInstance.list = data.list;
      // newInstance.editType = 'edit';
      newInstance.listTotalcount = data.totalCnt;
      newInstance.searchCompleted = true;
      // newState.instances[payload.instanceId] = newInstance ;
    }

    // yield put(actions.setValues(values));
    yield put(actions.setValue3(newInstance));
  }
}

function* save({ payload }) {
  const instance = yield select((state) => getState(state).instances[payload.instanceId]);
  // ui 타입에 따라 url 조정 
  let url = 'save';

  // view delete add update
  url = payload.editType
  const { isSuccess, data, resultCode, message } = yield call(callApi, {
    url: '/generic/' + url,
    method: 'post',
    data: payload,
  });

  if (isSuccess && resultCode == 200) {
    // message.success(i18n.t('message.save')); 
    if (payload.editType === 'insert') {
      // detail insert 
      antMessage.success('데이타가 추가되었습니다.');
    } else if (payload.editType === 'update') {
      antMessage.success('저장이 완료되었습니다.');
    } else {
      // delete
      antMessage.success('삭제되었습니다.');
      // let payload = {
      //   instanceId: instance.callInstanceId,
      //   openModal: {
      //     visible: false
      //   }
      // };
      // yield put(actions.setValue3(payload));
    }

    // 다시조회
    if (payload.editType === 'delete') {
      // 삭제는 본데이타의 DataArea에서 한다.
      yield put(actions.getListPage({ instanceId: instance.id }));
    } else if (instance.callInstanceId != null && !_.isEmpty(instance.callInstanceId)) {
      // 추가 편집은 모달에서 하므로 자신을 콜한 instance를 찾아야 한다.
      let parentIns = yield select((state) => getState(state).instances[instance.callInstanceId]);
      if (parentIns != null) {
        yield put(actions.getListPage({ instanceId: instance.callInstanceId }));
      }
    }
    // getAnplDsplWithdrawPage(); 
  } else {
    // let [modal, contextHolder] = Modal.useModal();
    Modal.error({
      title: '오류',
      content: message,
    });
    // antMessage.error(message);

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