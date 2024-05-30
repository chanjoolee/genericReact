import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector, connect } from "react-redux";
import { createSelector } from 'reselect';
import { getState } from "../state/stateSearch";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Col, Row } from "antd";
import useMounted from "@hooks/useMounted";
import { actions } from "@/generic/state/stateSearch";
import _ from "lodash";
import { schemaGeneric, addCustomSearchFilters } from "@generic/schemaGeneric.js";
import callApi from "@lib/callApi";
import { join } from "redux-saga/effects";
import state from "@/tabs/state";

const SearchFilterContainer = ({ instanceId, initParams }, ...restProps) => {
  console.log("SearchFilterContainer was rendered at", new Date().toLocaleTimeString());
  // window.columns - columns;
  const _schemaGeneric = schemaGeneric;
  const dispatch = useDispatch();
  // const event = useSelector((state) => getState(state).searchEvent);
  // const codelist = useSelector((state) => getState(state).codelist);
  // const thisState = useSelector((state) => getState(state));
  // const thisInstance = useSelector(
  //   (state) => getState(state).instances[instanceId]
  // );
  const this_entityId = useSelector((state) => getState(state).instances[instanceId].entityInfo.entityId);
  const entityNm = useSelector((state) => getState(state).instances[instanceId].entityInfo.entityNm);
  const cols = useSelector((state) => getState(state).instances[instanceId].entityInfo.cols);
  const parents = useSelector((state) => getState(state).instances[instanceId].entityInfo.parents);
  const children = useSelector((state) => getState(state).instances[instanceId].entityInfo.children);
  const openType = useSelector((state) => getState(state).instances[instanceId].openType);
  const onload = useSelector((state) => getState(state).instances[instanceId].onload);
  const searchCompleted = useSelector((state) => getState(state).searchCompleted);
  const [expand, setExpand] = useState(false);
  const [form] = Form.useForm();

  // // 모든 검색영역은 초기화 함수를 이와 같은 형태로 관리한다.
  // useMounted(() => {
  //   if (initParams && initParams.filters) {
  //     let initFormValues = {};
  //     _.forEach(initParams.filters, (filter) => {
  //       initFormValues[_.camelCase(filter.col)] = filter.value;
  //     });
  //     form.setFieldsValue(initFormValues);
  //   }
  //   search();
  // });



  // var searchFilter = [];



  // const getListPageAsync = useCallback(async (payload) => {
  //   let searchFilter = payload;
  //   let pageInfo = thisInstance.pageInfo;
  //   let instance = thisInstance;

  //   let { isSuccess, data } = await callApi({
  //     url: "/generic/getListPage",
  //     method: "post",
  //     // data: payload,
  //     params: pageInfo,
  //     data: searchFilter,
  //   });

  //   if (isSuccess && data) {
  //     let values = [];
  //     if (instance.uiType === "list") {
  //       values.push({
  //         key: "instances." + payload.instanceId + "list",
  //         value: data.list,
  //       });
  //       values.push({
  //         key: "instances." + payload.instanceId + ".listTotalcount",
  //         value: data.totalcnt,
  //       });
  //     } else if (instance.uiType === "detail") {
  //       values.push({
  //         key: "instances." + payload.instanceId + ".list",
  //         value: data.list,
  //       });
  //       values.push({
  //         key: "instances." + payload.instanceId + ".editType",
  //         value: "edit",
  //       });
  //       values.push({
  //         key: "instances." + payload.instanceId + ".listTotalcount",
  //         value: data.totalent,
  //       });
  //       if (data.list.length > 0) {
  //         values.push({
  //           key: "instances." + payload.instanceId + ".form",
  //           value: data.list[0],
  //         });
  //       }
  //     }
  //     dispatch(actions.setValues(values));
  //   }
  // }, [thisInstance, dispatch]);

  const formProps = {
    onFinish: () => {
      search();
    },
  };




  const rlcmonchange = () => {
    if (form.getFieldsValue().rlcmdvscd !== "") {
      form.setFieldsValue({ uprT100EtrpYn: "" });
    }
  };

  const makeSearchFilter = useMemo(() => {
    let searchFilter = [];
    let entityId = this_entityId;
    let entityobject = _.find(_schemaGeneric.entities, { entityId: entityId });
    let forms = form.getFieldsValue();
    // find parents
    let relation_parents = _.filter(_schemaGeneric.relations, {
      to: { entityId: entityId },
    });

    // Relations
    _.forEach(parents, (relation, i) => {
      _.forEach(relation.joins, (join, j) => {
        // 부모관계에 의한 검색조건은 멀티콤보등의 기능으로 구현 하므로 이름컬럼이 없다.  
        // 나중에 좀더 기능 고민 필요함.
        // let nameColumn = join.nameColumn;
        // if(nameColumn == null){
        //   nameColumn = join.parentColumn;
        // }
        let key = `searchFilter_${i}_${j}`;
        let component = (
          <Col span={8} key={key}>
            <Form.Item
              type="Text"
              label={join.childColumn.column_comment}  // parentColumns 으로 해야하나?
              name={_.camelCase("" + join.childColumn.column_name)}
            // rules={[rules.ruleRequired(), { validator: check }, rules.onlykor()]}
            >
              <Input
                placeholder={join.childColumn.column_comment + " 을 입력해 주세요."}
              />
            </Form.Item>
          </Col>
        );
        searchFilter.push({
          component: component,
          join: join
        });

      });

    });

    // Keys 부모컬럼을 참조하면 중복되므로 부모와 겹치는 부분은 제외
    _.forEach(cols, (col, i) => {
      let find_in_parent = _.find(parents, (parent) => {
        return _.find(parent.joins, (join) => {
          // { childColumn: { column_name: col.column_name } }
          if (join.childColumn && join.childColumn.column_name) {
            return join.childColumn.column_name === col.originColInfo.column_name;
          }
        });
      });
      if (col.isKey && find_in_parent == null) {
        let key = `searchFilter_key_${i}`;
        let component = (
          <Col span={8} key={key}>
            <Form.Item
              type="Text"
              label={col.originColInfo.column_comment}  // parentColumns 으로 해야하나?
              name={_.camelCase("" + col.originColInfo.column_name)}
            // rules={[rules.ruleRequired(), { validator: check }, rules.onlykor()]}
            >
              <Input
                placeholder={col.originColInfo.column_comment + " 을 입력해 주세요."}
              />
            </Form.Item>
          </Col>
        );
        searchFilter.push({
          component: component,
          join: { ...col, relationType: 'key' },
        });
      }
    });




    searchFilter = addCustomSearchFilters(searchFilter, entityId);
    return searchFilter;

  }, [form, this_entityId]);

  const search = useCallback(() => {
    let payload = form.getFieldsValue();
    // parent join
    payload = _.merge(payload, {
      entityId: this_entityId,
      tableName: this_entityId,
      tableComment: entityNm,
      cols: _.filter(cols, (col) => {
        if (col.Name !== "contextMenu") {
          return true;
        } else {
          return false;
        }
      }),
      instanceId: instanceId,
    });

    let filters = [];
    let forms = form.getFieldsValue();
    _.forEach(makeSearchFilter, (_search) => {
      let col = _search.join.childColumn || _search.join.originColInfo;
      let elName = _.camelCase(col.column_name);
      let filter = {
        col: elName,
        dbColumnName: col.column_name,
        value: forms[elName],
        joinInfo: _search.join
      };
      filters.push(filter);
    });
    payload.filters = filters;
    if (openType === "embeded") {
      // getListPageAsync(payload);
      dispatch(
        actions.setValue2("instances." + instanceId + ".searchFilter", payload)
      );
    } else {
      // setTimeout(() => {
      //   dispatch(actions.setSearchFilter(payload));
      // },100);
      dispatch(actions.setSearchFilter(payload));
    }


  }, [instanceId, makeSearchFilter]);

  // useMounted 는 왜 안먹지. useEffect 를 써야하나
  useEffect(() => {
    // Initialization logic...
    search();
  }, [dispatch]);

  // const onFinish = useCallback((values) => {
  //   console.log('Received values of form: ', values);
  //   search();
  // }, [search]);

  // const searchFilter = useMemo(() => makeSearchFilter());

  // const getFields = () => {
  //   let count = searchFilter.length;
  //   const children = [];


  //   for (let i = 0; i < count; i++) {
  //     children.push(
  //       searchFilter[i].component
  //     );
  //   }

  //   return children;
  // };
  // makeSearchFilter();
  const getFields = useCallback(() => {
    return makeSearchFilter.map((filter, index) => filter.component);
  }, [makeSearchFilter, form]);

  const formItemLayout = {
    labelCol: {
      xs: {
        span: 24,
      },
      sm: {
        span: 8,
      },
    },
    wrapperCol: {
      xs: {
        span: 24,
      },
      sm: {
        span: 16,
      },
    },
  };
  return (
    <>
      {onload && (
        <Form form={form} {...formProps}  {...formItemLayout} >
          <Row gutter={24} key={'search_row_0'}>{getFields()}</Row>
          <Row key={'search_row_1'}>
            <Col
              span={24}
              style={{
                textAlign: "right",
              }}
            >
              <Button
                type="primary"
                style={{
                  margin: "0 4px",
                }}
                onClick={() => {
                  let payload = {
                    instanceId: instanceId,
                    openModal: {
                      visible: true,
                      uiType: 'detail',
                      editType: 'insert',
                      initParams: {
                        entityId: this_entityId,
                        entityNm: entityNm,
                        openType: 'modal',
                        uiType: 'detail',
                        editType: 'insert',
                        callInstanceId: instanceId,
                        filters: []
                      }
                    }
                  }
                  dispatch(actions.setValue3(payload));
                }}
              >
                Add
              </Button>
              <Button type="primary" htmlType="submit">
                Search
              </Button>
              <Button
                style={{
                  margin: "0 4px",
                }}
                onClick={() => {
                  form.resetFields();
                }}
              >
                Clear
              </Button>
              <a
                style={{
                  fontSize: 12,
                }}
                onClick={() => {
                  setExpand(!expand);
                }}
              >
                {expand ? <UpOutlined /> : <DownOutlined />} Collapse
              </a>
            </Col>
          </Row>
        </Form>
      )}
    </>
  );
};



const arePropsEqual = (prevProps, nextProps) => {
  let isEqual = _.isEqual(prevProps.instanceId, nextProps.instanceId);
  return isEqual;
}

const SearchFilterContainerMemo = React.memo(SearchFilterContainer, arePropsEqual);
// const mapStateToProps = (state) => {
//   return ({
//     searchState: state.generic.search
//   });
// };

// export default SearchFilterContainer;
export default SearchFilterContainerMemo;
// export default connect(mapStateToProps)(MemoizedMyComponent);
const formInitValue = {};