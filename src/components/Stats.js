import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, Menu, Breadcrumb, Typography, Input, Submit, Center, Button, Form, Statistic, Card } from 'antd';
import {
    UserOutlined,
    DollarOutlined,
} from '@ant-design/icons';
const { Title } = Typography;
const { SubMenu } = Menu;
const { Header, Content, Sider, Footer } = Layout;

function Stats() {
    const [data, setData] = useState({
        totalMonitors: 0,
        totalBots: 0,
        totalBotsFarming:0,
        topCollection: 'none',
    });

    const fetchMoreData = () => {
        axios.get(process.env.REACT_APP_SERVER_URI + "/api/getStats")
            .then(res => {
                setData(res.data);
            }).catch(err => {
                console.error(err);
            });
    }

    useEffect(() => {
      fetchMoreData();
    }, []);

  return (
    <>
        <ul style={{textAlign: 'center'}}>
            <li style={{display: 'inline'}}>
                <Card style={{display: 'inline-block', width: '25%', margin: '20px'}}>
                    <Statistic title="Total Monitors" value={data.totalMonitors} />
                </Card>
            </li>
            <li style={{display: 'inline'}}>
                <Card style={{display: 'inline-block', width: '25%', margin: '20px'}}>
                    <Statistic title="Total Bots" value={data.totalBots} />
                </Card>
            </li>
            <li style={{display: 'inline'}}>
                <Card style={{display: 'inline-block', width: '25%', margin: '20px'}}>
                    <Statistic title="Bots Farming" value={data.totalBotsFarming} />
                </Card>
            </li>
            <li style={{display: 'inline'}}>
                <Card style={{display: 'inline-block', width: '25%', margin: '20px'}}>
                    <Statistic title="Top Collection" value={data.topCollection} />
                </Card>
            </li>
        </ul>
    </>
  );
}

export default Stats;