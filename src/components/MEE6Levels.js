import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, Menu, Breadcrumb, Typography, Input, Submit, Center, Button, Form, List, Divider, Avatar, Skeleton, Card, Modal } from 'antd';
import {
  SettingOutlined,
  PlayCircleOutlined,
  StopOutlined,
  LoadingOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroll-component';
const { Title } = Typography;
const { Header, Content, Sider, Footer } = Layout;
const { Meta } = Card;

function MEE6Levels(props) {
    const [bots, setBots] = useState([]);
    const [activeBot, setActiveBot] = useState({});
    const [startFarmingLoading, setStartFarmingLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(false);
    const [botSettings, setBotSettings] = useState({settingsVisible: false});

    const startFarming = (e) => {
        if(e.target) e.preventDefault();
        setStartFarmingLoading(true);
        if(!e.target) {
          axios.post("https://beta.rudolphaio.com/api/startFarming", {userToken: props.cookies.userToken,token: e.botToken, messageDelay: e.messageDelay, channelId: e.channelId, mintDate: e.mintDate, collectionName: e.collectionName})
          .then(res => {
              if(res.data.state == 'success') {
                  props.successMessage(res.data.message);
                  setStartFarmingLoading(false);
              } else if(res.data.state == 'error'){
                  props.errorMessage(res.data.message);
                  setStartFarmingLoading(false);
              }
              setTimeout(() => {fetchMoreData();}, 3000);
          }).catch(err => { 
              console.error(err);
          });
        } else {
          axios.post("https://beta.rudolphaio.com/api/startFarming", {userToken: props.cookies.userToken,token: e.target.token.value, messageDelay: e.target.messageDelay.value, channelId: e.target.channelId.value, mintDate:  e.target.mintDate.value, collectionName:  e.target.collectionName.value})
          .then(res => {
              if(res.data.state == 'success') {
                  props.successMessage(res.data.message);
                  setStartFarmingLoading(false);
              } else if(res.data.state == 'error'){
                  props.errorMessage(res.data.message);
                  setStartFarmingLoading(false);
              }
              setTimeout(() => {fetchMoreData();}, 3000);
          }).catch(err => { 
              console.error(err);
          });
        }
    }

    const stopFarming = (e) => {
        e.preventDefault();
        axios.post("https://beta.rudolphaio.com/api/stopFarming", {userToken: props.cookies.userToken})
          .then(res => {
              if(res.data.state == 'success') {
                  props.successMessage(res.data.message);
                  setActiveBot({});
              } else if(res.data.state == 'error'){
                  props.errorMessage(res.data.message);
              }
              setTimeout(() => {fetchMoreData();}, 3000);
          }).catch(err => { 
              console.error(err);
          });
    }

    const deleteBot = (botSettings) => {
        setBotSettings({settingsVisible: false});
        axios.post("https://beta.rudolphaio.com/api/deleteBot", {userToken: props.cookies.userToken, botData: botSettings})
          .then(res => {
              if(res.data.state == 'success') {
                  props.successMessage(res.data.message);
              } else if(res.data.state == 'error'){ 
                  props.errorMessage(res.data.message);
              }
              setTimeout(() => {fetchMoreData();}, 3000);
          }).catch(err => {
              console.error(err);
          });
    }

    const saveSettings = (e) => {
        e.preventDefault();
        let botToSave = botSettings;
        botToSave.messageDelay = e.target.messageDelay.value; 
        botToSave.channelId = e.target.channelId.value; 
        botToSave.mintDate = e.target.mintDate.value; 
        botToSave.collectionName = e.target.collectionName.value; 
        setBotSettings({settingsVisible: false});
        axios.post("https://beta.rudolphaio.com/api/updateBotSettings", {userToken: props.cookies.userToken, botData: botToSave})
            .then(res => {
              if(res.data.state == 'success') {
                  props.successMessage(res.data.message);
              } else if(res.data.state == 'error'){
                  props.errorMessage(res.data.message);
              }
              fetchMoreData();
            }).catch(err => {
                console.error(err);
            });
    }

    const fetchMoreData = () => {
        setDataLoading(true);
        axios.post("https://beta.rudolphaio.com/api/getFarmingData", {userToken: props.cookies.userToken})
            .then(res => {
              for (let i = 0; i < res.data.length; i++) {
                if(res.data[i].running) {
                    setActiveBot(res.data[i]);
                }
                res.data[i].settingsVisible = false;
                res.data[i].messages = res.data[i].messages.reverse();
              }
              setBots(res.data.sort((a, b) => b - a));
              setDataLoading(false);
            }).catch(err => {
                console.error(err);
            });
    }

    useEffect(() => {
      fetchMoreData();
    }, []);


  return (
    <div style={{textAlign: 'center'}}>
        <Modal
          title={botSettings.botName + ' Settings'}
          visible={botSettings.settingsVisible}
          onCancel={() => setBotSettings({settingsVisible: false})}
          footer={[
            <Button key="back" onClick={() => {setBotSettings({settingsVisible: false})}}>
              Close
            </Button>
            ]}
        >
          <form action='#' style={{textAlign: 'center'}} autocomplete="off" onSubmit={saveSettings}>
            <p>Change Channel Id</p>
            <Input autocomplete="off" required type="text" name="channelId" placeholder="Channel Id" defaultValue={botSettings.channelId} style={{textAlign: 'center', width: '50%'}}/>
            <br />
            <p style={{marginTop: '30px'}}>Change Message Delay (minutes)</p>
            <Input autocomplete="off" required type="number" name="messageDelay" step="0.1" min='1' placeholder="Message Delay (minutes)" defaultValue={botSettings.messageDelay} style={{textAlign: 'center', width: '50%'}}/>
            <br />
            <p style={{marginTop: '30px'}}>Change Collection Name</p>
            <Input autocomplete="off" required type="text" name="collectionName" placeholder="Collection Name" defaultValue={botSettings.collectionName} style={{textAlign: 'center', width: '50%'}}/>
            <br />
            <p style={{marginTop: '30px'}}>Change Mint Date (YYYY-MM-DD)</p>
            <Input autocomplete="off" required type="text" name="mintDate" placeholder="Mint Date (YYYY-MM-DD)" defaultValue={botSettings.mintDate} style={{textAlign: 'center', width: '50%'}}/>
            <br />
            <Button htmlType="submit" style={{marginTop: '30px'}}>Save Settings</Button>
          </form>
          <Button onClick={() => {deleteBot(botSettings)}} style={{marginTop: '30px'}}>Delete Bot</Button>
        </Modal>

        <Title style={{textAlign: 'center'}}>MEE6Levels</Title>
        <form autocomplete="off" action='#' style={{textAlign: 'center'}} onSubmit={startFarming}>
            <Input autocomplete="off" required type="text" name="token" placeholder="Discord User Token" style={{textAlign: 'center', width: '25%'}}/>
            <br />
            <Input autocomplete="off" required type="text" name="channelId" placeholder="Channel Id" style={{textAlign: 'center', width: '25%'}}/>
            <br />
            <Input autocomplete="off" required type="number" name="messageDelay" step="0.1" min='1' placeholder="Message Delay (minutes)" style={{textAlign: 'center', width: '25%'}}/>
            <br />
            <Input autocomplete="off" required type="text" name="collectionName" placeholder="Collection Name" style={{textAlign: 'center', width: '25%'}}/>
            <br />
            <Input autocomplete="off" required type="text" name="mintDate" placeholder="Mint Date (YYYY-MM-DD)" style={{textAlign: 'center', width: '25%'}}/>
            <br />
            <Button htmlType="submit" loading={startFarmingLoading}>Run Bot</Button>
        </form>
        {bots.length > 0 ? 
        bots.map((bot, index) => (
          <>
            <Card
              style={{ width: 300, display: 'inline-block', marginTop: '50px' }}
              actions={ bot.running ? [
                <StopOutlined title="Shutdown Bot" key="stop" onClick={stopFarming}/>
              ] : [
                <SettingOutlined title="Edit Bot" key="edit" onClick={() => {bot.settingsVisible = true; setBotSettings(bot);}}/>,
                <PlayCircleOutlined title="Start Bot" key="start" onClick={!startFarmingLoading ? () => {startFarming(bot) } : null} />
              ]}
            >
              <Meta
                avatar={<Avatar size={64} src={bot.botAvatar.replace('.webp', '.jpg')} />}
                title={bot.botName}
                description={bot.running ? 'Farming...' : 'Sleeping...'}
              />
            </Card> 
          </>
        ))
        : <p>No Bots :(</p>}
        <div style={{textAlign: 'right'}}>
          {dataLoading ? 
          <LoadingOutlined style={{fontSize: '26px', cursor: 'pointer', position: 'absolute', right: '6vw'}}/> 
          : 
          <ReloadOutlined style={{fontSize: '26px', cursor: 'pointer', position: 'absolute', right: '6vw'}} onClick={() => {fetchMoreData();}}/>}
        </div>
        <Divider orientation="left">Chat Logs</Divider>
        <div
              id="scrollableDiv"
              style={{
                height: 400,
                overflow: 'auto',
                padding: '0 16px',
                border: '1px solid rgba(140, 140, 140, 0.35)',
              }}
            >
              <InfiniteScroll
                dataLength={activeBot.messages ? activeBot.messages.length : 0}
                hasMore={false}
                endMessage={<Divider plain>Last {activeBot.messages ? activeBot.messages.length : 0} messages displayed</Divider>}
                scrollableTarget="scrollableDiv"
              >
                <List
                  dataSource={activeBot.messages}
                  renderItem={item => (
                    <List.Item key={item.id}>
                      <List.Item.Meta
                        title={<><p style={{textAlign: 'left'}}>{item.messageAuthor}: {item.message}</p><p style={{textAlign: 'right'}}>{item.response} :{activeBot.botName}</p></>}
                      />
                    </List.Item>
                  )}
                />
              </InfiniteScroll>
            </div>
    </div>
  );
}

export default MEE6Levels;
