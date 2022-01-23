import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, Menu, Breadcrumb, Typography, Input, Submit, Center, Button, Form } from 'antd';
import {
  UserOutlined,
  DollarOutlined,
} from '@ant-design/icons';
const { Title } = Typography;
const { SubMenu } = Menu;
const { Header, Content, Sider, Footer } = Layout;

function AdminDashboard(props) {
  const [adminData, setAdminData] = useState({});

    const getAdminData = (e) => {
        e.preventDefault();
        setMintLoading(true);
        axios.post(process.env.REACT_APP_SERVER_URI + '/api/getAdminData', {userToken: props.cookies.userToken})
            .then(res => {
                console.log(res.data);
                setAdminData(res.data);
            }).catch(err => {
                console.error(err);
            })
    }

    useEffect(() => {
        getAdminData();
    })

  return (
    <>
        <Title style={{textAlign: 'center'}}>Admin Dashboard</Title>
    </>
  );
}

export default AdminDashboard;
