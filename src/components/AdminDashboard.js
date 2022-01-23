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
  const [modalVisible, setModalVisible] = useState(false);
  const [botModalData, setBotModalData] = useState({});

    const getAdminData = () => {
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
    }, []);

    const showMessages = (botData) => {
        setBotModalData(botData);
        setModalVisible(true);
    }

  return (
    <>
    <Modal
          title={botModalData.botName + ' Messages'}
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => {setModalVisible(false)}}>
              Close
            </Button>
            ]}
        >
            <List
              dataSource={botModalData.messages}
              renderItem={item => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    title={<><p style={{textAlign: 'left'}}>{item.messageAuthor}: {item.message}</p><p style={{textAlign: 'center'}}>{item.timeStamp}</p><p style={{textAlign: 'right'}}>{item.response} :{botModalData.botName}</p></>}
                  />
                </List.Item>
              )}
            />         
        </Modal>
        <Title style={{textAlign: 'center'}}>Admin Dashboard</Title>
        {adminData.length > 0 ? 
        adminData.map((data, index) => (
          <div>
            <Card
              style={{ textAlign: 'center', width: 300, display: 'inline-block', marginTop: '50px' }}
              actions={[<MessageOutlined title="Message Logs" key="messages" onClick={() => showMessages(data)}/>]}
            >
              <Meta
                avatar={<Avatar size={64} src={data.botAvatar.replace('.webp', '.jpg')} />}
                title={data.botName}
                description={data.state == 1 ? 'Farming...' : 'Sleeping...'}
              />
            </Card> 
          </div>
        ))
        : <p>No Data :(</p>}
    </>
  );
}

export default AdminDashboard;
