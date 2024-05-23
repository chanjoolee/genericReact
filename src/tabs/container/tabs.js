import React, { Children, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import '@tabs/tabs.css';
import { Tabs } from 'antd';
import { actions, getState } from '@tabs/state';
import { actions as actions_generic, getState as getState_generic } from '@/generic/state/stateSearch';
import SearchPage from "@generic/container/SearchPage";
import _ from 'lodash';


const { TabPane } = Tabs;


const TabContainer = () => {
  const dispatch = useDispatch();
  const newTabIndex = useRef(0);

  const thisState = useSelector((state) => getState(state));
  const genericState = useSelector((state) => getState_generic(state));
  if (thisState != null)
    window.state_tabs = thisState;

  const onChange = (newActiveKey) => {
    // setActiveKey(newActiveKey);
    dispatch(actions.setValue2('activeKey', newActiveKey));
  };

  const add = () => {
    // maxkey 
    let uniqKey = _.uniqueId();
    let payload = {
      activeKey: uniqKey,
      pane: {
        label: 'New Tab',
        children: 'Content of new Tab',
        key: uniqKey,
        closable: true,
        initParams: {}
      }
    }
    dispatch(actions.add(payload));
    // const newActiveKey = `newTab${newTabIndex.current++}`;
    // const newPanes = [...panes];
    // newPanes.push({
    //   title: 'New Tab',
    //   content: 'Content of new Tab',
    //   key: newActiveKey,
    // });
    // setPanes(newPanes);
    // setActiveKey(newActiveKey);
  };

  const remove = (targetKey) => {
    let newActiveKey = thisState.activeKey;
    let lastIndex = -1;
    thisState.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    let deletePane = _.find(thisState.panes, { key: targetKey });

    const newPanes = thisState.panes.filter((pane) => pane.key !== targetKey);

    if (newPanes.length && newActiveKey === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = newPanes[lastIndex].key;
      } else {
        newActiveKey = newPanes[0].key;
      }
    }
    let values = [
      { key: 'panes', value: newPanes },
      { key: 'activeKey', value: newActiveKey }
    ]

    dispatch(actions.setValues(values));
    // dispatch(actions_generic.deleteInstance());
  };

  const onEdit = (targetKey, action) => {
    if (action === 'add') {
      add();
    } else {
      remove(targetKey);
    }
  };


  const items = thisState.panes.map((pane, i) => {
    let { label, children, key, closable } = pane;
    if (pane.key == "Main") {
      return {
        label, key, closable,
        children: <div>Content of Main</div>
      };
    } else if (pane.label == 'New Tab') {
      return {
        label, key, closable,
        children: 'Content of new Tab'
      };
    } else {
      if (pane.type == 'generic') {
        return {
          label, key, closable,
          children: <SearchPage initParams={pane.children} />
        };
      } else {
        return {
          label, key, closable,
          children: pane.children
        };
      }

    }

  });

  return (
    // <Tabs type="editable-card" onChange={onChange} activeKey={thisState.activeKey} onEdit={onEdit}>
    //   {thisState.panes.map((pane) => (
    //     <TabPane tab={pane.title} key={pane.key} closable={pane.closable}>
    //       {pane.content}
    //     </TabPane>
    //   ))}
    // </Tabs>
    <Tabs
      type="editable-card"
      onChange={onChange}
      activeKey={thisState.activeKey}
      onEdit={onEdit}
      items={items}
    />
  );
};

export default TabContainer;