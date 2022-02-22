import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, Menu, Breadcrumb, Typography, Input, Select, Submit, Center, Checkbox, Button, Form, List, Divider, Avatar, Skeleton, Card, Modal } from 'antd';
import {
  SettingOutlined,
  PlayCircleOutlined,
  StopOutlined,
  LoadingOutlined,
  ReloadOutlined,
  PlusCircleOutlined
} from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroll-component';
const { Title } = Typography;
const { Header, Content, Sider, Footer } = Layout;
const { Meta } = Card;
const { TextArea } = Input;
const { Option } = Select;

function Bots(props) {
    const [bots, setBots] = useState([]);
    const [selectedBots, setSelectedBots] = useState([]);
    const [addBotLoading, setAddBotLoading] = useState(false);
    const [botSettings, setBotSettings] = useState({settingsVisible: false});
    const [spamSettingsCheckbox, setSpamSettingsCheckbox] = useState(false);
    const [deleteSettingsCheckbox, setDeleteSettingsCheckbox] = useState(false);
    const [botsModalVisible, setBotsModalVisible] = useState(false);
    const [reactEmoji, setReactEmoji] = useState('🎉');

    const addBot = async(e) => {
        e.preventDefault();
        setAddBotLoading(true);

        let tokenArray = e.target.tokenList.value.split('\n');

        for (let i = 0; i < tokenArray.length; i++) {
          const token = tokenArray[i].trim();

          await axios.post(process.env.REACT_APP_SERVER_URI + "/api/createBot", {userToken: props.cookies.userToken, botToken: token })
            .then(res => {
                console.log(res.data);
                if(res.data.state == 'success') {
                    props.successMessage(res.data.message);
                } else if(res.data.state == 'error'){
                    props.errorMessage(res.data.message);
                }
            }).catch(err => { 
                console.error(err);
          });  

          if(i == tokenArray.length - 1) {
            setAddBotLoading(false);
            setTimeout(() => {fetchMoreData();}, 3000);
          } 
        }
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

    const fetchMoreData = () => {
        // setDataLoading(true);
        axios.post(process.env.REACT_APP_SERVER_URI + "/api/getBots", {userToken: props.cookies.userToken})
            .then(res => {
              for (let i = 0; i < res.data.botList.length; i++) {
                res.data.botList[i].settingsVisible = false;
                res.data.botList[i].messages = res.data.botList[i].messages.reverse();
              }

              // if (res.data.userChatLogs) {
              //     setUserChatLogs(res.data.userChatLogs.reverse());
              // }

              setBots(res.data.botList.sort((a, b) => b - a));
              // setDataLoading(false);
            }).catch(err => {
                console.error(err);
            });
    }

    useEffect(() => {
      fetchMoreData();
    }, []);

    const selectBot = (bot) => {
      selectedBots.push(bot);
      setSelectedBots(selectedBots);
    }

    const unselectBot = (bot) => {
      if(selectedBots.indexOf(bot) === -1) {  return; }
      selectedBots.splice(selectedBots.indexOf(bot), 1);
      setSelectedBots(selectedBots);
    }

    const inviteBot = (bot, e) => {
      e.preventDefault();

      let code = e.target.code.value

      if(bot.length != undefined) {
        for (let i = 0; i < bot.length; i++) {
          axios({method: 'post', url: `https://discordapp.com/api/v6/invites/${code}`, headers: {'authorization': bot[i].botToken} }).then(res => {
            props.successMessage('Bot Invited!');
          }).catch(err => {
            props.errorMessage(err.message);
          });
        }
      } else {
        axios({method: 'post', url: `https://discordapp.com/api/v6/invites/${code}`, headers: {'authorization': bot.botToken} }).then(res => {
          props.successMessage('Bot Invited!');
        }).catch(err => {
          props.errorMessage(err.message);
        });
      }
    }

    const reactToMessage = (bot, e) => {
      e.preventDefault();

      let reactionEncoded = encodeURI(reactEmoji);

      let messageLink = e.target.messageLink.value;

      if(Array.isArray(bot)) {
        for (let i = 0; i < bot.length; i++) {
          axios({method: 'put', url: `https://discordapp.com/api/v9/channels/${messageLink.split('/')[5]}/messages/${messageLink.split('/')[6]}/reactions/${reactionEncoded}/%40me`, headers: {'authorization': bot[i].botToken} }).then(res => {
            props.successMessage('Bot Reacted!');
          }).catch(err => {
            props.errorMessage(err.message);
          });
        }
      } else {
        axios({method: 'put', url: `https://discordapp.com/api/v9/channels/${messageLink.split('/')[5]}/messages/${messageLink.split('/')[6]}/reactions/${reactionEncoded}/%40me`, headers: {'authorization': bot.botToken} }).then(res => {
          props.successMessage('Bot Reacted!');
        }).catch(err => {
          props.errorMessage(err.message);
        });
      }
    }


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
            <Checkbox name="spam" checked={spamSettingsCheckbox} onChange={() => {setSpamSettingsCheckbox(!spamSettingsCheckbox)}}>Spam Mode</Checkbox>
            <br />
            <Checkbox name="delete" checked={deleteSettingsCheckbox} onChange={() => {setDeleteSettingsCheckbox(!deleteSettingsCheckbox)}}>Delete Mode</Checkbox>
            <br />
            <Button htmlType="submit" style={{marginTop: '30px'}}>Save Settings</Button>
          </form>
          <Button onClick={() => {deleteBot(botSettings)}} style={{marginTop: '30px'}}>Delete Bot</Button>
        </Modal>
      : null }
        <Title style={{textAlign: 'center'}}>Bots</Title>
        <p style={{textAlign: 'center'}}>we are not responsible for any discord accounts being banned.</p>
        <form autocomplete="off" action='#' style={{textAlign: 'center'}} onSubmit={addBot}>
            <TextArea autocomplete="off" required type="text" name="tokenList" placeholder="Discord User Tokens (Seperated by new line)" style={{textAlign: 'center'}}/>
            <br />
            <Button htmlType="submit" loading={addBotLoading}>Add Bots</Button>
        </form>
        <Modal
          title={'Bot Manager'}
          visible={botsModalVisible}
          onCancel={() => setBotsModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => {setBotsModalVisible(false)}}>
              Close
            </Button>
            ]}
        >
          <form autocomplete="off" action='#' style={{textAlign: 'center'}} onSubmit={(e) => { inviteBot(selectedBots, e); }}>
            <Button htmlType="submit">Join Server</Button>
            <Input autocomplete="off" required type="text" name="code" placeholder="Server Code" style={{textAlign: 'center', width: '25%'}}/>
          </form>
          <form autocomplete="off" action='#' style={{textAlign: 'center', marginTop: '10px'}} onSubmit={(e) => { reactToMessage(selectedBots, e);}}>
            <Button htmlType="submit">React to Message</Button>
            <Input autocomplete="off" required type="url" name="messageLink" placeholder="Message Link" style={{textAlign: 'center', width: '25%'}}/>
            <Select defaultValue="🎉" onChange={(value) => { setReactEmoji(value); }} style={{ width: 60 }}>
              <Option value="🎉">🎉</Option>
              <Option value="✅">✅</Option>
              <Option value="🚀">🚀</Option>
            </Select>
          </form>
        </Modal>
        <div style={{textAlign: 'center', display: 'block', margin: '25px'}}>
          <Button onClick={() => {setBotsModalVisible(true)}}>Bot Actions</Button>
        </div>
        {bots.length > 0 ? 
        bots.map((bot, index) => (
          <>
            <Card
              style={{ width: 300, display: 'inline-block', margin: '25px' }}
              actions={[
                <SettingOutlined title="Edit Bot" key="edit" onClick={() => { setBotSettings(bot); setSpamSettingsCheckbox(bot.spam); setDeleteSettingsCheckbox(bot.delete); bot.settingsVisible = true;}}/>,
                <PlusCircleOutlined title="Bot Actions" key='actions' onClick={() => {setSelectedBots([bot]); setBotsModalVisible(true);}}/>,
                <Checkbox title="Select Bot" key="select" onClick={(e) => {if(e.target.checked) { selectBot(bot) } else { unselectBot(bot) }}} />
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
    </div>
  );
}

export default Bots;
