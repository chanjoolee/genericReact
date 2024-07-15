import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useDispatch, useSelector, connect } from "react-redux";
import { createSelector } from 'reselect';
import { getState } from "../state/stateSearch";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Select, Col, Row } from "antd";
import useMounted from "@hooks/useMounted";
import { actions } from "@/generic/state/stateSearch";
import _ from "lodash";
import { schemaGeneric, addCustomSearchFilters } from "@generic/schemaGeneric.js";
// import callApi from "@lib/callApi";
import { join } from "redux-saga/effects";
import state from "@/tabs/state";
// import jsonp from 'fetch-jsonp';
import callApi from '@lib/callApi';
import { keepalived } from "react-syntax-highlighter/dist/esm/languages/prism";

// Function to fetch suggestions


const SearchInput = ({ join, relation, placeholder, style, value: initialValue, onChange }) => {
  const [data, setData] = useState([]);
  const [value, setValue] = useState(initialValue || []);
  const timeoutRef = useRef(null);

  const fetch = useCallback((value, callback) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (value) {
      timeoutRef.current = setTimeout(async () => {
        let cols = [];
        _.filter(relation.relationInfo.from.cols, (col, i) => {
          let addCol = {
            dbColumnName: col.column_name
          };
          cols.push(addCol);
          // name column
          if (join.nameColumn != null) {
            cols.push({
              dbColumnName: join.nameColumn.column_name
            });
          }

        });

        let filterColumn = join.parentColumn.column_name;
        if (join.nameColumn != null) {
          filterColumn = join.nameColumn.column_name;
        }
        const { isSuccess, data } = await callApi({
          url: '/generic/selectList',
          method: 'post',
          data: {
            tableName: relation.parentTableName,
            cols: cols,
            filters: [
              {
                dbColumnName: filterColumn,
                value: value
              }
            ]
          }
        });

        if (isSuccess) {

          const options = data.list.map((item) => {
            let vlabel = item[_.camelCase(join.parentColumn.column_name)];
            if (join.nameColumn != null) {
              vlabel = item[_.camelCase(join.nameColumn.column_name)];
            }
            let rtn = {
              value: item[_.camelCase(join.parentColumn.column_name)],
              label: vlabel
            };
            return rtn;
          });

          callback(options);
        } else {
          console.error('Failed to fetch data');
          callback([]);
        }
      }, 300);
    } else {
      callback([]);
    }
  }, [relation, join]);

  const handleSearch = (newValue) => {
    fetch(newValue, setData);
  };

  const handleChange = (newValue) => {
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <Select
      showSearch
      value={value}
      placeholder={placeholder}
      style={style}
      filterOption={false}
      onSearch={handleSearch}
      onChange={handleChange}
      options={data.map((d) => ({
        value: d.value,
        label: d.label,
      }))}
      mode="multiple"
    />
  );
};

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
  const commonCodeList = useSelector((state) => getState(state).instances[instanceId].codeList.combo);
  const parents = useSelector((state) => getState(state).instances[instanceId].entityInfo.parents);
  const children = useSelector((state) => getState(state).instances[instanceId].entityInfo.children);
  const openType = useSelector((state) => getState(state).instances[instanceId].openType);
  const onload = useSelector((state) => getState(state).instances[instanceId].onload);
  const searchCompleted = useSelector((state) => getState(state).searchCompleted);
  const [expand, setExpand] = useState(false);
  const [form] = Form.useForm();

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

  const getDefaultValueFromInitial = (col) => {
    let defaultValue = null;
    if (initParams.filters) {
      let _find = _.find(initParams.filters, { col: _.camelCase(col.column_name) });
      if (_find) {
        defaultValue = _find.value;
      }
    }
    return defaultValue;
  }

  const makeSearchFilter = useMemo(() => {
    let searchFilter = [];
    let entityId = this_entityId;
    let entityobject = _.find(_schemaGeneric.entities, { entityId: entityId });
    let forms = form.getFieldsValue();
    // find parents
    let relation_parents = _.filter(_schemaGeneric.relations, {
      to: { entityId: entityId },
    });

    // Relations Parent
    _.forEach(parents, (relation, i) => {
      _.forEach(relation.joins, (join, j) => {
        // 부모관계에 의한 검색조건은 멀티콤보등의 기능으로 구현 하므로 이름컬럼이 없다.  
        // 나중에 좀더 기능 고민 필요함.
        // let nameColumn = join.nameColumn;
        // if(nameColumn == null){
        //   nameColumn = join.parentColumn;
        // }

        let key = `searchFilter_${i}_${j}`;
        // let defaultValue = getDefaultValueFromInitial(join.childColumn);
        let selectType = relation.relationInfo.selectType;
        let component;
        let valueType;
        if (selectType === 'multi-select') {
          valueType = 'list';
          component = (
            <Col span={8}>
              <Form.Item
                type="Text"
                label={join.childColumn.column_comment}
                name={_.camelCase("" + join.childColumn.column_name)}
              >
                <SearchInput join={join} relation={relation} placeholder={join.childColumn.column_comment + " 을 입력해 주세요."} />
              </Form.Item>
            </Col>
          );
        } else {
          valueType = 'string';
          component = (
            <Col span={8} key={key}>
              <Form.Item
                type="Text"
                label={join.childColumn.column_comment}  // parentColumns 으로 해야하나?
                name={_.camelCase("" + join.childColumn.column_name)}
              // rules={[rules.ruleRequired(), { validator: check }, rules.onlykor()]}
              >
                <Input
                  placeholder={join.childColumn.column_comment + " 을 입력해 주세요."}
                // defaultValue={defaultValue}
                />
              </Form.Item>
            </Col>
          );
        }

        searchFilter.push({
          component: component,
          join: join,
          valueType: valueType
        });

      });

    });

    // Primary Keys 부모컬럼을 참조하면 중복되므로 부모와 겹치는 부분은 제외
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
        // let col = col.originColInfo;
        // let defaultValue = getDefaultValueFromInitial(col.originColInfo);
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
              // defaultValue={defaultValue}
              />
            </Form.Item>
          </Col>
        );
        searchFilter.push({
          component: component,
          join: { ...col, relationType: 'key', valueType: 'string' },
        });
      }
    });

    // 공통코드. 이부분을 Select 로 만들자
    _.forEach(commonCodeList, (commonCode, i) => {
      let options = _.map(commonCode.list, (m, i) => {
        return {
          value: m[_.camelCase(_schemaGeneric.commonCode.commonCodeDetail.columns.commonCode)],
          label: m[_.camelCase(_schemaGeneric.commonCode.commonCodeDetail.columns.commonCodeName)]
        };
      })
      let component = (
        <Col span={8}>
          <Form.Item
            type="Text"
            label={commonCode[_.camelCase(_schemaGeneric.commonCode.commonCodeGroup.columns.groupCodeName)]}  // parentColumns 으로 해야하나?
            name={_.camelCase(commonCode[_.camelCase(_schemaGeneric.commonCode.commonCodeUse.columns.useColumnName)])}
          // rules={[rules.ruleRequired(), { validator: check }, rules.onlykor()]}
          >
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="All"
              defaultValue={[]}
              // onChange={(value) => {

              // }}
              options={options}
            />

          </Form.Item>
        </Col>
      );
      let col = _.find(cols, { dataIndex: _.camelCase(commonCode[_.camelCase(_schemaGeneric.commonCode.commonCodeUse.columns.useColumnName)]) })
      searchFilter.push({
        component: component,
        join: {
          ...commonCode,
          type: 'commonCode',
          valueType: 'list',
          originColInfo: col.originColInfo
        },
      });
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
        valueType: _search.valueType,
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
    if (initParams.filters) {
      let formJson = {};
      _.forEach(initParams.filters, (filter) => {
        formJson[filter.col] = filter.value;
      });

      form.setFieldsValue(formJson);

    }
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


