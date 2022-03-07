import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, Menu, Breadcrumb, Typography, Input, Submit, Center, Checkbox, Button, Form, List, Divider, Avatar, Skeleton, Card, Modal } from 'antd';
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
const { TextArea } = Input;

function MEE6Levels(props) {
    const [bots, setBots] = useState([]);
    const [activeBot, setActiveBot] = useState({});
    const [userChatLogs, setUserChatLogs] = useState([]);
    const [startFarmingLoading, setStartFarmingLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(false);
    const [botSettings, setBotSettings] = useState({settingsVisible: false});
    const [spamSettingsCheckbox, setSpamSettingsCheckbox] = useState(false);
    const [deleteSettingsCheckbox, setDeleteSettingsCheckbox] = useState(false);
    const [instantDeleteSettingsCheckbox, setInstantDeleteSettingsCheckbox] = useState(false);

    const startFarming = (e) => {
        if(e.target) e.preventDefault();
        setStartFarmingLoading(true);
        if(!e.target) {
          axios.post(process.env.REACT_APP_SERVER_URI + "/api/startFarming", {userToken: props.cookies.userToken,token: e.botToken, messageDelay: e.messageDelay, channelId: e.channelId, mintDate: e.mintDate, collectionName: e.collectionName, customPrompt: e.customPrompt, spam: e.spam,  delete: e.delete, endTimer: e.endTimer, instantDelete: e.instantDelete})
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
          axios.post(process.env.REACT_APP_SERVER_URI + "/api/startFarming", {userToken: props.cookies.userToken,token: e.target.token.value, messageDelay: e.target.messageDelay.value, channelId: e.target.channelId.value, mintDate:  e.target.mintDate.value, collectionName:  e.target.collectionName.value, customPrompt:  e.target.customPrompt.value, spam: e.target.spam.checked, delete: e.target.delete.checked, endTimer: e.target.endTimer.value, instantDelete: e.target.instantDelete.checked})
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
        axios.post(process.env.REACT_APP_SERVER_URI + "/api/stopFarming", {userToken: props.cookies.userToken})
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
        axios.post(process.env.REACT_APP_SERVER_URI + "/api/deleteBot", {userToken: props.cookies.userToken, botData: botSettings})
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
        botToSave.customPrompt = e.target.customPrompt.value; 
        botToSave.spam = e.target.spam.checked; 
        botToSave.delete = e.target.delete.checked; 
        botToSave.endTimer = e.target.endTimer.value;
        botToSave.instantDelete = e.target.instantDelete.checked;
        botToSave.webhook = e.target.webhook.value;

        setBotSettings({settingsVisible: false});
        axios.post(process.env.REACT_APP_SERVER_URI + "/api/updateBotSettings", {userToken: props.cookies.userToken, botData: botToSave})
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
        axios.post(process.env.REACT_APP_SERVER_URI + "/api/getBots", {userToken: props.cookies.userToken, authToken: props.cookies.authToken})
            .then(res => {
              if(res.data.botList) {
                for (let i = 0; i < res.data.botList.length; i++) {
                  if(res.data.botList[i].state == 1) {
                      setActiveBot(res.data.botList[i]);
                  }
                  res.data.botList[i].settingsVisible = false;
                  res.data.botList[i].messages = res.data.botList[i].messages.reverse();
                }

                if (res.data.userChatLogs) {
                    setUserChatLogs(res.data.userChatLogs.reverse());
                }

                setBots(res.data.botList.sort((a, b) => b - a));
                setDataLoading(false);
              }
            }).catch(err => {
                console.error(err);
            });
    }

    useEffect(() => {
      fetchMoreData();
    }, []);


  return (
    <div style={{textAlign: 'center'}}>
      {botSettings.settingsVisible ?
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
            <Input autocomplete="off" required type="text" name="channelId" placeholder="Channel Id" defaultValue={botSettings.channelId}  style={{textAlign: 'center', width: '50%'}}/>
            <br />
            <p style={{marginTop: '30px'}}>Change Message Delay (minutes)</p>
            <Input autocomplete="off" required type="number" name="messageDelay" step="0.1" min='1' placeholder="Message Delay (minutes)" defaultValue={botSettings.messageDelay}  style={{textAlign: 'center', width: '50%'}}/>
            <br />
            <p style={{marginTop: '30px'}}>Change Collection Name</p>
            <Input autocomplete="off" required type="text" name="collectionName" placeholder="Collection Name" defaultValue={botSettings.collectionName}  style={{textAlign: 'center', width: '50%'}}/>
            <br />
            <p style={{marginTop: '30px'}}>Change Mint Date (YYYY-MM-DD)</p>
            <Input autocomplete="off" required type="text" name="mintDate" placeholder="Mint Date (YYYY-MM-DD)" defaultValue={botSettings.mintDate}  style={{textAlign: 'center', width: '50%'}}/>
            <br />
            <p style={{marginTop: '30px'}}>Custom Prompt</p>
            <TextArea autocomplete="off" type="text" name="customPrompt" defaultValue={botSettings.customPrompt} placeholder="He is chatting in the channel called general. He is from Paris, France and travels very often around the world. He does not like talking about artificial inteligence or robots, he likes talking about fast cars and taking a rocket to the moon or jupiter. His profile picture is his dog, a golden retriever. ect." style={{textAlign: 'center', width: '50%'}}/>
            <br />
            <p style={{marginTop: '30px'}}>End Timer (minutes)</p>
            <Input autocomplete="off" required type="number" step="1" min='30' max='300' name="endTimer" defaultValue={botSettings.endTimer} placeholder="Minutes until bot stops farming" style={{textAlign: 'center', width: '50%'}}/>
            <br />
            <p style={{marginTop: '30px'}}>Webhook Link</p>
            <Input autocomplete="off" type="url" name="webhook" defaultValue={botSettings.webhook} placeholder="Webhook to send different bot alerts" style={{textAlign: 'center', width: '50%'}}/>
            <br />
            <Checkbox name="spam" checked={spamSettingsCheckbox} onChange={() => {setSpamSettingsCheckbox(!spamSettingsCheckbox)}}>Spam Mode</Checkbox>
            <br />
            <Checkbox name="delete" checked={deleteSettingsCheckbox} onChange={() => {setDeleteSettingsCheckbox(!deleteSettingsCheckbox)}}>Delete Mode</Checkbox>
            <br />
            <Checkbox name="instantDelete" checked={instantDeleteSettingsCheckbox} onChange={() => {setInstantDeleteSettingsCheckbox(!instantDeleteSettingsCheckbox)}}>Instant Delete Mode</Checkbox>
            <br />
            <Button htmlType="submit" style={{marginTop: '30px'}}>Save Settings</Button>
          </form>
          <Button onClick={() => {deleteBot(botSettings)}} style={{marginTop: '30px'}}>Delete Bot</Button>
        </Modal>
      : null }

        <p style={{textAlign: 'center'}}>we are not responsible for any discord accounts being banned. use a burner. dont be lazy.</p>
        {bots.length > 0 ? 
        bots.map((bot, index) => (
          <>
            <Card
              style={{ width: 300, display: 'inline-block', marginTop: '50px' }}
              actions={ bot.state == 1 ? [
                <StopOutlined title="Shutdown Bot" key="stop" onClick={stopFarming}/>
              ] : [
                <SettingOutlined title="Edit Bot" key="edit" onClick={() => {setBotSettings(bot); setSpamSettingsCheckbox(bot.spam); setDeleteSettingsCheckbox(bot.delete); setInstantDeleteSettingsCheckbox(bot.instantDelete); bot.settingsVisible = true;}}/>,
                <PlayCircleOutlined title="Start Bot" key="start" onClick={!startFarmingLoading ? () => {startFarming(bot) } : null} />
              ]}
            >
              <Meta
                avatar={<Avatar size={64} src={bot.botAvatar.replace('.webp', '.jpg')} />}
                title={bot.botName}
                description={bot.state == 1 ? 'Farming...' : bot.state == 0 ? 'Sleeping...' : bot.state == 2 ? 'Shutting Down...' : 'Imposible...' }
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
                dataLength={activeBot.messages ? activeBot.messages.length : userChatLogs.length}
                hasMore={false}
                endMessage={<Divider plain>Last {activeBot.messages ? activeBot.messages.length : userChatLogs.length} messages displayed</Divider>}
                scrollableTarget="scrollableDiv"
              >
                <List
                  dataSource={activeBot.messages ? activeBot.messages : userChatLogs}
                  renderItem={item => (
                    <List.Item key={item.id}>
                      <List.Item.Meta
                        title={
                        activeBot.messages ?
                        <><p style={{textAlign: 'left'}}>{item.messageAuthor}: {item.message}</p><p style={{textAlign: 'center'}}>{item.timeStamp}</p><p style={{textAlign: 'right'}}>{item.response} :{activeBot.botName}</p></>
                        : 
                        <><p style={{textAlign: 'center'}}>{item}</p></>
                        }
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
