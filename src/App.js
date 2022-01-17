import 'antd/dist/antd.css';
import './App.css';
import React, { useState } from 'react';
import { BrowserView, MobileView, isBrowser, isMobile } from 'react-device-detect';
import { Layout, Menu, Breadcrumb, Typography, message, Button } from 'antd';
import { useCookies } from "react-cookie";
import {
  Outlet,
  Link,
  Routes,
  Route
} from "react-router-dom";
import {
  UserOutlined,
  DollarOutlined,
  RobotOutlined
} from '@ant-design/icons';
import QuickMint from './components/QuickMint';
import NFTStealer from './components/NFTStealer';
import MEE6Levels from './components/MEE6Levels';
import LoginPage from './components/LoginPage';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const { Title } = Typography;
const { SubMenu } = Menu;
const { Header, Content, Sider, Footer } = Layout;

function App(props) {
  const [collapsed, setCollapsed] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [cookies, setCookie] = useCookies(["userToken", "newKey"]);

  const successMessage = (text) => {
    message.success(
    {
      content: text,
      style: {
        position: 'relative',
        right: '-6%',
      },
    });
  };

  const errorMessage = (text) => {
    message.error(
    {
      content: text,
      style: {
        position: 'relative',
        right: '-6%',
      },
    });
  };

  return (
    <>
    <BrowserView>
    {loggedIn ?
    <Layout> 
        <Header className="header">
          <div className="logo" />
          <Title style={{color: 'white', marginTop: '5px', marginLeft: '-30px'}}>Rudolph BOT</Title>
        </Header>
        <Layout style={{ minHeight: '95vh' }}>
          <Sider collapsible collapsed={collapsed} onCollapse={() => { setCollapsed(!collapsed)}}>
            <div className="logo" />
            <Menu theme="dark" mode="inline">
              <Menu.Item key="1" style={{ marginTop: '0px'}} icon={<UserOutlined />}>
                <Link to="/RudolphDashboardFront/">
                  Home
                </Link>
              </Menu.Item>
              <Menu.Item key="2" icon={<RobotOutlined />}>
                <Link to="/RudolphDashboardFront/mee6levels">
                  MEE6 Levels
                </Link>
              </Menu.Item>
              {/* <Menu.Item key="3" icon={<DollarOutlined />}>
                <Link to="/RudolphDashboardFront/quickmint">
                  Quick Mint
                </Link>
              </Menu.Item>
              <Menu.Item key="4" icon={<DollarOutlined />}>
                <Link to="/RudolphDashboardFront/nftstealer">
                  NFT Stealer
                </Link>
              </Menu.Item> */}
            </Menu>
          </Sider>
          <Layout style={{ padding: '0 24px 24px' }}>
          <Content style={{ margin: '0 16px' }}>
              <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
                  <Routes>
                    <Route path="/RudolphDashboardFront/" element={<Title>Home</Title>} />
                    <Route path="/RudolphDashboardFront/quickmint" element={<QuickMint />} />
                    <Route path="/RudolphDashboardFront/nftstealer" element={<NFTStealer />} />
                    <Route path="/RudolphDashboardFront/mee6levels" element={<MEE6Levels cookies={cookies} successMessage={successMessage} errorMessage={errorMessage}/>} />
                    <Route
                      path="*"
                      element={
                        <main style={{ padding: "1rem" }}>
                          <p>There's nothing here!</p>
                        </main>
                      }
                    />
                </Routes>
              </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}><a style={{ color: '#f5222d' }}href="https://twitter.com/RaxoCoding" target="_blank">@RaxoCoding</a><br /> <p>Donations Appreciated: 9St1VZtnsTQ8KLvjjySt4Ra5k2PX8HpoLCTau86t3imZ</p></Footer>
          </Layout>
        </Layout>
      </Layout> 
    : 
    <Routes>
      <Route
        path="*"
        element={
          <LoginPage setLoggedIn={setLoggedIn} cookies={cookies} setCookie={setCookie} successMessage={successMessage} errorMessage={errorMessage}/>
        }
      />
    </Routes>
    }
    </BrowserView>
    <MobileView style={{ textAlign: 'center' }}>
      <Title>Available for mobile soon...</Title>
    </MobileView>
    </>
  );
}

export default App;
