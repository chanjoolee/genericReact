import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getState } from "../state/stateSearch";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Col, Row } from "antd";
import useMounted from "@hooks/useMounted";
import { actions } from "@/generic/state/stateSearch";
import _ from "lodash";
import { schemaGeneric, addCustomSearchFilters } from "@generic/schemaGeneric.js";
import callApi from "@lib/callApi";

const SearchFilterContainer = ({ instanceId, initParams }, ...restProps) => {
  // window.columns - columns;
  const dispatch = useDispatch();
  const event = useSelector((state) => getState(state).searchEvent);
  const codelist = useSelector((state) => getState(state).codelist);
  const thisState = useSelector((state) => getState(state));
  const thisInstance = useSelector(
    (state) => getState(state).instances[instanceId]
  );
  const [expand, setExpand] = useState(false);
  const [form] = Form.useForm();

  // 모든 검색영역은 초기화 함수를 이와 같은 형태로 관리한다.
  useMounted(() => {
    if (initParams && initParams.filters) {
      let initFormValues = {};
      _.forEach(initParams.filters, (filter) => {
        initFormValues[_.camelCase(filter.col)] = filter.value;
      });
      form.setFieldsValue(initFormValues);
    }
    search();
  });

  const initForm = () => {
    // form.setFieldsValue(formInitValue);
  };

  const onFormReset = () => {
    initForm();
  };

  var searchFilter = [];
  var parentKeyValue = {};
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
      let elName = _.camelCase(search.targetColumn.column_name);
      let filter = {
        col: elName,
        dbcolumnName: search.targetColumn.column_name,
        value: forms[elName],
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
    dispatch(
      actions.setValue(
        "instances." + instanceId + ".parentKeyValue",
        parentKeyValue
      )
    );
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
    let entityobject = _.find(schemaGeneric.entities, { entityId: entityId });
    let forms = form.getFieldsValue();
    // find parents
    let relation_parents = _.filter(schemaGeneric.relations, {
      to: { entityId: entityId },
    });
    // Relations
    _.forEach(relation_parents, (rel, i) => {
      // 부모컬럼 찾기
      let targetEntity = _.find(schemaGeneric.entities, {
        entityId: rel.from.entityId,
      });
      // 컬럼들
      _.forEach(rel.from.cols, (col, j) => {
        let componentName = col.componentName;
        if (componentName == null) {
          componentName = "FormItem";
        }
        if (componentName === "FormItem") {
          let targetColumn = _.find(targetEntity.cols, {
            column_name: col.name,
          });
          let nameColumn = _.cloneDeep(targetColumn);
          // let label - targetColumn.column_comment;
          if (targetColumn.name_column != null) {
            nameColumn = _.find(targetEntity.cols, {
              column_name: targetColumn.name_column,
            });
          }

          let component = (
            <Col span={8} key={i}>
              <Form.Item
                type="Text"
                label={nameColumn.column_comment}
                name={_.camelCase("" + targetColumn.column_name)}
              // rules={[rules.ruleRequired(), { validator: check }, rules.onlykor()]}
              >
                <Input
                  placeholder={nameColumn.column_comment + " 을 입력해 주세요."}
                />
              </Form.Item>
            </Col>
          );
          searchFilter.push({
            component: component,
            targetColumn: targetColumn,
          });

          if (initParams.filters) {
            let v_filter = _.find(initParams.filters, {
              col: targetColumn.column_name,
            });
            if (v_filter != null) {
              parentKeyValue[_.camelCase(targetColumn.column_name)] =
                v_filter.value + "";
            }
          }
        }
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
    <Form form={form} {...formProps} onFinish={onFinish} {...formItemLayout} >
      <Row gutter={24}>{getFields()}</Row>
      <Row>
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
  );
};

export default SearchFilterContainer;
const formInitValue = {};
