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

function QuickMint(props) {
  const [mintLoading, setMintLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [method, setMethod] = useState('');
  const [mintData, setMintData] = useState([]);

      const Mint = (e) => {
        e.preventDefault();
        setMintLoading(true);
        axios.post(process.env.REACT_APP_SERVER_URI + ('/api/mint' + method), {userToken: props.cookies.userToken, privateKey: e.target.privateKey.value, url: e.target.url.value, candyId: e.target.url.value, amountToMint: e.target.amountToMint.value})
            .then(res => {
                console.log(res.data);
                setMintLoading(false);
                
                if(res.data.state == 'success') {
                  props.successMessage(res.data.message);
                } else if(res.data.state == 'error'){
                  props.errorMessage(res.data.message);
                }
            }).catch(err => {
            console.error(err);
            })
    }

      const fetchMintData = () => {
        setDataLoading(true);
        axios.post(process.env.REACT_APP_SERVER_URI + "/api/getMintData", {userToken: props.cookies.userToken})
            .then(res => {

              if (res.data.mintData) {
                  setMintData(res.data.mintData.reverse());
              }

              setDataLoading(false);
            }).catch(err => {
                console.error(err);
            });
    }

    const getColor = (item) => {
      if(item.status == 'error') {return ({color: 'red', textAlign: 'center'})}
      else if(item.status == 'success') {
        return ({color: 'green', textAlign: 'center'})
      } else {
        return ({color: 'yellow', textAlign: 'center'})
      }
    }

  return (
    <>
        <Title style={{textAlign: 'center'}}>Quick Mint</Title>
        <form action='#' style={{textAlign: 'center'}} onSubmit={Mint}>
            <Input required type="text" name="privateKey" placeholder="Burner Private Key" style={{textAlign: 'center', width: '25%'}}/>
            <br />
            <Input required type="text" name="url" placeholder="Mint Url/Candy Id" style={{textAlign: 'center', width: '25%'}}/>
            <br />
            <Input required type="number" name="amountToMint" placeholder="Amount To Mint" style={{textAlign: 'center', width: '25%'}}/>
            <br />
            <Button htmlType="submit" onClick={() => {setMethod('Url')}} loading={mintLoading}>Mint from Url</Button>
            <Button htmlType="submit"onClick={() => {setMethod('Id')}} loading={mintLoading}>Mint from Id</Button>
        </form>
        <div style={{textAlign: 'right'}}>
          {dataLoading ? 
          <LoadingOutlined style={{fontSize: '26px', cursor: 'pointer', position: 'absolute', right: '6vw'}}/> 
          : 
          <ReloadOutlined style={{fontSize: '26px', cursor: 'pointer', position: 'absolute', right: '6vw'}} onClick={() => {fetchMintData();}}/>}
        </div>
        <Divider orientation="left">Mint Logs</Divider>
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
                dataLength={mintData.length}
                hasMore={false}
                endMessage={<Divider plain>Last {mintData.length} transactions displayed</Divider>}
                scrollableTarget="scrollableDiv"
              >
                <List
                  dataSource={mintData}
                  renderItem={item => (
                    <List.Item key={item.id}>
                      <List.Item.Meta
                        title={<><p style={getColor(item)}>CandyId: {item.candyId || 'none'}, Status: {item.status || 'unknown'}<br />Transaction: {item.transaction_signature || 'none'}</p></>}
                      />
                    </List.Item>
                  )}
                />
              </InfiniteScroll>
            </div>
    </>
  );
}

export default QuickMint;
