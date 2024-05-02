import React, { useEffect, useState } from "react";
import { useDispatch, useSelector ,connect } from "react-redux";
import { getState } from "../state/stateSearch";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Col, Row } from "antd";
import useMounted from "@hooks/useMounted";
import { actions } from "@/generic/state/stateSearch";
import _ from "lodash";
import { schemaGeneric, addCustomSearchFilters } from "@generic/schemaGeneric.js";
import callApi from "@lib/callApi";
import { join } from "redux-saga/effects";

const SearchFilterContainer = ({ instanceId, initParams }, ...restProps) => {
  // console.log("SearchFilterContainer was rendered at", new Date().toLocaleTimeString());
  // window.columns - columns;
  const _schemaGeneric = schemaGeneric;
  const dispatch = useDispatch();
  const event = useSelector((state) => getState(state).searchEvent);
  const codelist = useSelector((state) => getState(state).codelist);
  const thisState = useSelector((state) => getState(state));
  const thisInstance = useSelector(
    (state) => getState(state).instances[instanceId]
  );
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

  // useMounted 는 왜 안먹지. useEffect 를 써야하나
  useEffect(() => {
    // Initialization logic...
    search();
  }, [dispatch]);

  var searchFilter = [];
  const search = () => {
    let payload = form.getFieldsValue();
    // parent join
    payload = _.merge(payload, {
      entityId: thisState.instances[instanceId].entityInfo.entityId,
      tableName: thisState.instances[instanceId].entityInfo.entityId,
      tableComment: thisInstance.entityInfo.entityNm,
      cols: _.filter(thisState.instances[instanceId].entityInfo.cols, (col) => {
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
    _.forEach(searchFilter, (search) => {
      let elName = _.camelCase(search.join.childColumn.column_name);
      let filter = {
        col: elName,
        dbcolumnName: search.join.childColumn.column_name,
        value: forms[elName],
        joinInfo: search.join
      };
      filters.push(filter);
    });
    payload.filters = filters;
    if (thisInstance.openType === "embeded") {
      getListPageAsync(payload);
      dispatch(
        actions.setValue2("instances." + instanceId + ".searchFilter", payload)
      );
    } else {
      dispatch(actions.setSearchFilter(payload));
    }

    
  };

  const getListPageAsync = async (payload) => {
    let searchFilter = payload;
    let pageInfo = thisInstance.pageInfo;
    let instance = thisInstance;

    let { isSuccess, data } = await callApi({
      url: "/offer/generic/getListPage",
      method: "post",
      // data: payload,
      params: pageInfo,
      data: searchFilter,
    });

    if (isSuccess && data) {
      let values = [];
      if (instance.uiType === "list") {
        values.push({
          key: "instances." + payload.instanceId + "list",
          value: data.list,
        });
        values.push({
          key: "instances." + payload.instanceId + ".listTotalcount",
          value: data.totalcnt,
        });
      } else if (instance.uiType === "detail") {
        values.push({
          key: "instances." + payload.instanceId + ".list",
          value: data.list,
        });
        values.push({
          key: "instances." + payload.instanceId + ".editType",
          value: "edit",
        });
        values.push({
          key: "instances." + payload.instanceId + ".listTotalcount",
          value: data.totalent,
        });
        if (data.list.length > 0) {
          values.push({
            key: "instances." + payload.instanceId + ".form",
            value: data.list[0],
          });
        }
      }
      dispatch(actions.setValues(values));
    }
  };

  const formProps = {
    onFinish: () => {
      search();
    },
  };

  const onFinish = (values) => {
    console.log('Received values of form: ', values);
    search();
  };


  const rlcmonchange = () => {
    if (form.getFieldsValue().rlcmdvscd !== "") {
      form.setFieldsValue({ uprT100EtrpYn: "" });
    }
  };

  const makeSearchFilter = () => {
    let entityId = thisState.instances[instanceId].entityInfo.entityId;
    let entityobject = _.find(_schemaGeneric.entities, { entityId: entityId });
    let forms = form.getFieldsValue();
    // find parents
    let relation_parents = _.filter(_schemaGeneric.relations, {
      to: { entityId: entityId },
    });
    // Relations
    _.forEach(thisInstance.entityInfo.parents, (parent, i) => {
      _.forEach(parent.joins, (join, j) => {
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
              label={join.parentColumn.column_comment}  // parentColumns 으로 해야하나?
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
          join : join
        });
  
      });
      
    });

    searchFilter = addCustomSearchFilters(searchFilter, entityId);


  };

  const getFields = () => {
    let count = searchFilter.length;
    const children = [];


    for (let i = 0; i < count; i++) {
      children.push(
        searchFilter[i].component
      );
    }

    return children;
  };
  makeSearchFilter();

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
    {thisInstance && thisInstance.onload && searchCompleted && (
      <Form form={form} {...formProps}  {...formItemLayout} >
        <Row gutter={24} key={'search_row_0'}>{getFields()}</Row>
        <Row key={'search_row_1'}>
          <Col
            span={24}
            style={{
              textAlign: "right",
            }}
          >
            <Button type="primary" htmlType="submit">
              Search
            </Button>
            <Button
              style={{
                margin: "0 8px",
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
  // let filter1 = prevProps.searchState.instances[prevProps.instanceId].searchFilter;
  // let filter2 = nextProps.searchState.instances[nextProps.instanceId].searchFilter;
  // return filter1 === filter2 ;
 
  // return prevProps.searchFilter.filters === nextProps.searchFilter.filters;
  let isEqual =  _.isEqual(prevProps.searchFilter.filters,nextProps.searchFilter.filters);
  // console.log(`SearchFilterContainer is Equal? ${isEqual}`);
  return isEqual;
}

const SearchFilterContainerMemo = React.memo(SearchFilterContainer,arePropsEqual);
// const mapStateToProps = (state) => {
//   return ({
//     searchState: state.generic.search
//   });
// };

// export default SearchFilterContainer;
export default SearchFilterContainerMemo;
// export default connect(mapStateToProps)(MemoizedMyComponent);
const formInitValue = {};