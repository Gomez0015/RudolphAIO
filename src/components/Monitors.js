import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, Menu, Breadcrumb, Typography, Input, Submit, Center, Button, Form, List, Divider, Modal } from 'antd';
import {
    UserOutlined,
    DollarOutlined,
    PlusSquareOutlined
} from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroll-component';
const { Title } = Typography;
const { SubMenu } = Menu;
const { Header, Content, Sider, Footer } = Layout;

function Monitors(props) {
    const [monitors, setMonitors] = useState([]);
    const [dataLoading, setDataLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchMoreData = () => {
        setDataLoading(true);
        axios.post(process.env.REACT_APP_SERVER_URI + "/api/getMonitors", {userToken: props.cookies.userToken, authToken: props.cookies.authToken})
            .then(res => {
              if(res.data.monitors) {
                let finalList = [];

                res.data.monitors.collections.forEach(async (item) => {
                    await finalList.push({
                        type: 'Collection',
                        data: item,
                    });
                });

                res.data.monitors.wallets.forEach(async (item) => {
                    await finalList.push({
                        type: 'Wallet',
                        data: item,
                    });
                });

                setMonitors(finalList);
                setDataLoading(false);
              }
            }).catch(err => {
                console.error(err);
            });
    }

    useEffect(() => {
      fetchMoreData();
    }, []);


    const addMonitor = (e) => {
        e.preventDefault();
        setDataLoading(true);
        axios.post(process.env.REACT_APP_SERVER_URI + "/api/addMonitor", {userToken: props.cookies.userToken, type: e.target.type.value, data: e.target.data.value})
            .then(res => {
                if(res.data.state == 'success') {
                    props.successMessage(res.data.message);
                } else if(res.data.state == 'error'){
                    props.errorMessage(res.data.message);
                }

                setModalVisible(false);
                fetchMoreData();
            }).catch(err => {
                console.error(err);
            });
    }


    return (
        <>
            <Title style={{textAlign: 'center'}}>Monitors</Title>
            <div
            id="scrollableDiv"
            style={{
                height: 400,
                overflow: 'visible',
                padding: '0 16px',
                border: '1px solid rgba(140, 140, 140, 0.35)',
                position: 'relative',
            }}
            >
                <PlusSquareOutlined 
                    style={{
                        cursor: 'pointer',
                        position: 'absolute',
                        top: '-32px',
                        right: '0px',
                        fontSize: '24px'
                    }}
                    onClick={() => {setModalVisible(true)}}
                />
                <InfiniteScroll
                    dataLength={monitors.length}
                    hasMore={false}
                    endMessage={<Divider plain></Divider>}
                    scrollableTarget="scrollableDiv"
                >
                    <List
                    dataSource={monitors}
                    renderItem={item => (
                        <List.Item 
                            key={item.id}
                            actions={[<a key="list-loadmore-edit">edit</a>, <a key="list-loadmore-more">more</a>]}
                        >
                        <List.Item.Meta
                            title={`${item.type} Monitor`}
                            description={`Monitoring... ${item.data}`}
                        />
                        </List.Item>
                    )}
                    />
                </InfiniteScroll>
            </div>

            <Modal
            title={'New Monitor'}
            visible={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={[
                <Button key="back" onClick={() => {setModalVisible(false)}}>
                Close
                </Button>
                ]}
            >
                <form action='#' style={{textAlign: 'center'}} autocomplete="off" onSubmit={addMonitor}>
                    <p>Monitor Type (collection, wallet)</p>
                    <Input autocomplete="off" required type="text" name="type" placeholder="collection" style={{textAlign: 'center', width: '50%'}}/>
                    <br />
                    <p style={{marginTop: '30px'}}>Data to Monitor</p>
                    <Input autocomplete="off" required type="text" name="data" placeholder="SolBots" style={{textAlign: 'center', width: '50%'}}/>
                    <br />
                    <Button htmlType="submit" style={{marginTop: '30px'}}>Create Monitor</Button>
                </form>
            </Modal>
        </>
    );
}

export default Monitors;