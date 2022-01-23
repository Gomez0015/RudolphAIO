import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, Menu, Breadcrumb, Typography, Input, Submit, Center, Checkbox, Button, Form, List, Divider, Avatar, Skeleton, Card, Modal } from 'antd';
import {
  UserOutlined,
  DollarOutlined,
  MessageOutlined
} from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroll-component';
const { Title } = Typography;
const { Header, Content, Sider, Footer } = Layout;
const { Meta } = Card;
const { TextArea } = Input;

function AdminDashboard(props) {
  const [adminData, setAdminData] = useState([]);

    const getAdminData = (e) => {
        e.preventDefault();
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
        {adminData.length > 0 ? 
        adminData.map((data, index) => (
          <>
            <Card
              style={{ width: 300, display: 'inline-block', marginTop: '50px' }}
              actions={[<MessageOutlined title="Message Logs" key="messages" />]}
            >
              <Meta
                avatar={<Avatar size={64} src={data.botAvatar.replace('.webp', '.jpg')} />}
                title={data.botName}
                description={data.state == 1 ? 'Farming...' : 'Sleeping...'}
              />
            </Card> 
          </>
        ))
        : <p>No Data :(</p>}
    </>
  );
}

export default AdminDashboard;
