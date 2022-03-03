import './App.css';
import 'antd/dist/antd.dark.css';
import React, { useState } from 'react';
import { BrowserView, MobileView, isBrowser, isMobile } from 'react-device-detect';
import { Layout, Menu, Breadcrumb, Typography, message, Button } from 'antd';
import { useCookies } from "react-cookie";
import rudolph from './rudolph.png';
import {
  Outlet,
  Link,
  Routes,
  Route
} from "react-router-dom";
import {
  UserOutlined,
  DollarOutlined,
  RobotOutlined,
  KeyOutlined,
  LineChartOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
  UsbOutlined,
  BugOutlined
} from '@ant-design/icons';
import QuickMint from './components/QuickMint';
import NFTStealer from './components/NFTStealer';
import MEE6Levels from './components/MEE6Levels';
import Generators from './components/Generators';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import Donations from './components/Donations';
import MobileLogin from './components/mobile/MobileLogin';
import Bots from './components/Bots';
import Monitors from './components/Monitors';
// import Stats from './components/Stats';

const { Title } = Typography;
const { SubMenu } = Menu;
const { Header, Content, Sider, Footer } = Layout;

const adminList = process.env.REACT_APP_ADMIN_LIST;

function App(props) {
  const [collapsed, setCollapsed] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [cookies, setCookie] = useCookies(["userToken", "newKey", "buyKey", "authToken"]);
  // const [darkMode, setDarkMode] = useState(true);

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

  // const updateStyleMode = () => {

  //   if(!darkMode) {
  //     let root = document.documentElement;
  //     root.classList.remove('dark-mode');
  //     root.classList.add('light-mode');
  //     setDarkMode(!darkMode);
  //   } else {
  //     let root = document.documentElement;
  //     root.classList.remove('light-mode');
  //     root.classList.add('dark-mode');
  //     setDarkMode(!darkMode);
  //   }
  // }

  return (
    <>
    <BrowserView>
    {loggedIn ?
    <Layout> 
        <Header className="header">
          <div className="logo" />
          {/* <Button onClick={updateStyleMode} style={{display: 'inline-block', marginLeft: '-30px'}}>{darkMode ? 'Light Mode' : 'Dark Mode'}</Button> */}
          <Title id='mainTitle' style={{color: 'white', marginTop: '5px', marginLeft: '15px', display: 'inline-block'}}>Rudolph AIO</Title>
        </Header>
        <Layout style={{ minHeight: '95vh' }}>
          <Sider collapsible collapsed={collapsed} onCollapse={() => { setCollapsed(!collapsed)}}>
            <div className="logo" />
            <Menu theme="dark" mode="inline">
              <Menu.Item key="1" style={{ marginTop: '0px'}} icon={<LineChartOutlined />}>
                <Link to="/dashboard/monitors">
                  Monitors
                </Link>
              </Menu.Item>
              <Menu.Item key="2" icon={<RobotOutlined />}>
                <Link to="/dashboard/bots">
                  Bots
                </Link>
              </Menu.Item>
              <Menu.Item key="3" icon={<BugOutlined />}>
                <Link to="/dashboard/mee6levels">
                  Whitelist Farmer
                </Link>
              </Menu.Item>
              <Menu.Item key="4" icon={<ExperimentOutlined />}>
                <Link to="/dashboard/generators">
                  Generators
                </Link>
              </Menu.Item>
              <Menu.Item key="5" icon={<ThunderboltOutlined />}>
                <Link to="/dashboard/quickmint">
                  Quick Mint
                </Link>
              </Menu.Item>
              <Menu.Item key="6" icon={<UsbOutlined />}>
                <Link to="/dashboard/nftstealer">
                  NFT Stealer
                </Link>
              </Menu.Item>
              <Menu.Item key="7" icon={<DollarOutlined />}>
                <Link to="/dashboard/donate">
                  Donations :)
                </Link>
              </Menu.Item>
              {adminList.includes(cookies.userToken) ? 
              <Menu.Item key="8" icon={<KeyOutlined />}>
                <Link to="/dashboard/admin">
                  Admin Dashboard
                </Link>
              </Menu.Item>
              : null}
            </Menu>
          </Sider>
          <Layout style={{ padding: '0 24px 24px' }}>
          <Content style={{ margin: '0 16px' }}>
              <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
                  <Routes>
                    <Route path="/dashboard/stats" element={<h1>Stats</h1>} />
                    <Route path="/dashboard/quickmint" element={<QuickMint cookies={cookies} successMessage={successMessage} errorMessage={errorMessage}/>} />
                    <Route path="/dashboard/nftstealer" element={<NFTStealer />} />
                    <Route path="/dashboard/donate" element={<Donations successMessage={successMessage} errorMessage={errorMessage} />} />
                    <Route path="/dashboard/mee6levels" element={<MEE6Levels cookies={cookies} successMessage={successMessage} errorMessage={errorMessage}/>} />
                    <Route path="/dashboard/generators" element={<Generators successMessage={successMessage} errorMessage={errorMessage}/>} />
                    <Route path="/dashboard/bots" element={<Bots cookies={cookies} successMessage={successMessage} errorMessage={errorMessage}/>} />
                    <Route path="/dashboard/monitors" element={<Monitors cookies={cookies} successMessage={successMessage} errorMessage={errorMessage}/>} />
                    {adminList.includes(cookies.userToken) ? 
                      <Route path="/dashboard/admin" element={<AdminDashboard cookies={cookies} successMessage={successMessage} errorMessage={errorMessage}/>} />
                    : null}
                    <Route
                      path="*"
                      element={
                        <main style={{ padding: "1rem", textAlign: 'center' }}>
                          <img src={rudolph} style={{ width: "200px"}}/>
                          <Title>404 Rudolph is Lost!</Title>
                        </main>
                      }
                    />
                </Routes>
              </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}><a style={{ color: '#f5222d' }}href="https://twitter.com/RaxoCoding" target="_blank">@RaxoCoding</a></Footer>
          </Layout>
        </Layout>
      </Layout> 
    : 
    <Routes>
      <Route
        path="/dashboard/*"
        element={
          <LoginPage setLoggedIn={setLoggedIn} cookies={cookies} setCookie={setCookie} successMessage={successMessage} errorMessage={errorMessage}/>
        }
      />
    </Routes>
    }
    </BrowserView>
    <MobileView style={{ textAlign: 'center' }}>
    <Title>Available for mobile soon...</Title>
    {/* <Routes>
      <Route
        path="*"
        element={
          <Title>Available for mobile soon...</Title>
        }
      />
    </Routes> */}
    {/* {loggedIn ?
      <Title>Available for mobile soon...</Title>
      :
      <>
        <h1> Hello! </h1>
        <MobileLogin setLoggedIn={setLoggedIn} successMessage={successMessage} errorMessage={errorMessage}/>
      </>
    } */}
    </MobileView>
    </>
  );
}

export default App;
