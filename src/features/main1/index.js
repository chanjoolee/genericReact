import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactDOM from "react-dom";
import "./index.css";
import { Layout, Menu, Breadcrumb } from "antd";
import {
  DesktopOutlined,
  PieChartOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
  AppstoreAddOutlined,
  CodeSandboxOutlined,
} from "@ant-design/icons";
import TabContainer from "@tabs/container/tabs";
import { actions, getState } from "@tabs/state";
import _ from "lodash";
import SearchPage from "@generic/container/SearchPage";
import CodeBlock from "@/sample/codeBlock";
import Collapse from "@/sample/collapse";

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

const LayoutSide1 = () => {
  const [state, setState] = useState({
    collapsed: false,
  });
  const tabState = useSelector((state) => getState(state));
  const dispatch = useDispatch();

  const toggle = () => {
    setState({
      collapsed: !state.collapsed,
    });
  };

  const onCollapse = (collapsed) => {
    console.log(collapsed);
    setState({ collapsed });
  };
  window.toggle = toggle;

  const menuClick = ({ item, key, keyPath, domEvent }) => {
    let find_pane = _.find(tabState.panes, (pane) => {
      return pane.key === key;
    });
    if (find_pane != null) {
      dispatch(actions.setValue2("activeKey", key));
      return;
    }
    // maxkey
    let initParams = {
      // entityId: item.props.elementRef.current.getAttribute("entityId"),
      entityId: item.props.entityid,
      openType: "tab",
      uiType: "list",
    };
    let uniqKey = key; // _.uniqueId();
    let payload = {
      activeKey: uniqKey,
      pane: {
        label: item.props.title,
        // children: <SearchPage initParams={initParams} />,
        children: initParams,
        key: uniqKey,
        closable: true,
        // initParams: {},
        type: 'generic',
      },
    };
    dispatch(actions.add(payload));
  };
  const menuClickSample = ({ item, key, keyPath, domEvent }, content) => {
    let find_pane = _.find(tabState.panes, (pane) => {
      return pane.key === key;
    });
    if (find_pane != null) {
      dispatch(actions.setValue2("activeKey", key));
      return;
    }
    // maxkey

    let uniqKey = key; // _.uniqueId();
    // let content = item.props.elementRef.current.getAttribute("component");
    // if ()

    let payload = {
      activeKey: uniqKey,
      pane: {
        label: item.props.title,
        children: content,
        key: uniqKey,
        closable: true,
        // initParams: {},
        type: 'general',
      },
    };
    dispatch(actions.add(payload));
  };
  const { collapsed } = state;
  return (
    <>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
          <div className="logo" />
          <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
            <Menu.Item key="1" icon={<PieChartOutlined />}>
              Option 1
            </Menu.Item>
            <Menu.Item key="2" icon={<DesktopOutlined />}>
              Option 2
            </Menu.Item>
            <SubMenu key="sub1" icon={<UserOutlined />} title="User">
              <Menu.Item key="3">Tom</Menu.Item>
              <Menu.Item key="4">Bill</Menu.Item>
              <Menu.Item key="5">Alex</Menu.Item>
            </SubMenu>
            <SubMenu key="sub2" icon={<TeamOutlined />} on title="TDCS">
              <Menu.Item
                key="6"
                entityid="TBAS_ABN_RE_PAY_IF"
                title="비정상영업_재심관리"
                onClick={menuClick}
              >
                비정상영업_재심관리
              </Menu.Item>
              <Menu.Item
                key="8"
                entityid="TBAS_ABN_SALE_RPAY_IF"
                title="비정상영업_환수관리"
                onClick={menuClick}
              >
                비정상영업_환수관리
              </Menu.Item>
              <Menu.Item
                key="10"
                entityid="TBAS_NEW_ORG_MGMT"
                title="통합조직관리"
                onClick={menuClick}
              >
                통합조직관리
              </Menu.Item>
            </SubMenu>
            <SubMenu key="sub4" icon={<AppstoreAddOutlined />} on title="INVENTORY">
              <Menu.Item
                key="31"
                entityid="INVENTORY_CMM_CD"
                title="공통코드"
                onClick={menuClick}
              >
                공통코드
              </Menu.Item>
              <Menu.Item
                key="32"
                entityid="INVENTORY_ITEM_MASTER"
                title="품목코드마스타"
                onClick={menuClick}
              >
                품목코드마스타
              </Menu.Item>
              <Menu.Item
                key="33"
                entityid="INVENTORY_IN_OUT"
                title="창고입출고"
                onClick={menuClick}
              >
                창고입출고
              </Menu.Item>
            </SubMenu>
            <SubMenu key="sub3" icon={<CodeSandboxOutlined />} on title="Sample">
              <Menu.Item
                key="20"
                title="코드블럭연습"
                onClick={(param) => {
                  menuClickSample(param, <CodeBlock />);
                }}
              >
                코드블럭연습
              </Menu.Item>
              <Menu.Item
                key="21"
                title="Collapse"
                onClick={(param) => {
                  menuClickSample(param, <Collapse />);
                }}
              >
                Collapse
              </Menu.Item>
            </SubMenu>
            <Menu.Item key="9" icon={<FileOutlined />}>
              Files
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout className="site-layout">
          <Header className="site-layout-background" style={{ padding: 0 }} />
          <Content style={{ margin: "0 16px" }}>
            <TabContainer />
          </Content>
          <Footer style={{ textAlign: "center" }}>
            Ant Design ©2018 Created by Ant UED
          </Footer>
        </Layout>
      </Layout>
    </>
  );
};

export default LayoutSide1;
