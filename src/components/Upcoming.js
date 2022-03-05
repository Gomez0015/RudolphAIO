import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, Menu, Breadcrumb, Typography, Calendar, Input, Submit, Badge, Center, Button, Form, List, Divider, Modal } from 'antd';
import {
    UserOutlined,
    DollarOutlined,
    PlusSquareOutlined,
    SettingOutlined
} from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroll-component';

const { Title } = Typography;
const { SubMenu } = Menu;
const { Header, Content, Sider, Footer } = Layout;

function Upcoming(props) {
    const [calendarData, setCalendarData] = useState([]);

    const fetchUpcomingLaunches = () => {
        axios.get('https://api-mainnet.magiceden.dev/v2/launchpad/collections?offset=0&limit=200').then(response => {
            setCalendarData(response.data);
        });
    }


    useEffect(() => {
        fetchUpcomingLaunches();
      }, []);

    function getListData(value) {
        let listData;

        var result = calendarData.find(obj => {
            if(obj.launchDatetime != undefined) {
                return value.isSame(obj.launchDatetime, 'day');
            }
        });

        if(result != undefined) {
            listData = [
              { type: 'success', content: <p><a href={`https://magiceden.io/launchpad/${result.symbol}`} target="_blank">{result.name}</a> <br/>@ {new Date(result.launchDatetime).getHours()}:{new Date(result.launchDatetime).getMinutes()} UTC, <br/>{result.price} SOL, <br/>{result.size} Available</p> }
            ];
        }

        return listData || [];
    }

    function dateCellRender(value) {
        const listData = getListData(value);
        return (
          <ul className="events">
            {listData.map(item => (
              <div key={item.content}>
                {item.content}
              </div>
            ))}
          </ul>
        );
      }


    return (
        <>
            <div>
                <Calendar dateCellRender={dateCellRender}/>
            </div>
        </>
    );
}

export default Upcoming;