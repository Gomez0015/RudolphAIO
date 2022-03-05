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
        axios.get(process.env.REACT_APP_SERVER_URI + "/api/getCalendarData").then(response => {
            setCalendarData(response.data);
        });
    }


    useEffect(() => {
        fetchUpcomingLaunches();
      }, []);

    function getListData(value) {
        let listData;

        var result = calendarData.filter(obj => {
          if(obj.launchDatetime != undefined) {
            return value.isSame(obj.launchDatetime, 'day');
          }
        });

        let website = '';

        if(result.website) {
          website = result.website;
        } else {
          website = `https://magiceden.io/launchpad/${result.symbol}`;
        }

        if(result != undefined) {
            listData = [
              { type: 'success', content: <p><a href={website} target="_blank">{result.name}</a> <br/>@ {new Date(result.launchDatetime).getHours()}:{new Date(result.launchDatetime).getMinutes()} UTC, <br/>{result.price} SOL, <br/>{result.size} Available</p> }
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