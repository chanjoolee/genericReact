import React, { useState } from 'react';
import 'antd/dist/antd.css';
import './LayoutSearchRows.css';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Row, Select } from 'antd';

const { Option } = Select;

const LayoutSearchRows = ({searchFilter , rowsections }) => {
  const [expand, setExpand] = useState(false);
  const [form] = Form.useForm();


  const onFinish = (values) => {
    console.log('Received values of form: ', values);
  };

  return (
    <>
    {searchFilter}
    </>
  );
};

// const App = () => (
//   <div>
//     <LayoutSearchRows />
//     <div className="search-result-list">Search Result List</div>
//   </div>
// );

export default LayoutSearchRows;