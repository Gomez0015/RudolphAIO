import React, { useState } from 'react';
import axios from 'axios';
import { Layout, Menu, Breadcrumb, Typography, Input, Submit, Center, Button, Form } from 'antd';
import {
  UserOutlined,
  DollarOutlined,
} from '@ant-design/icons';
const { Title } = Typography;
const { SubMenu } = Menu;
const { Header, Content, Sider, Footer } = Layout;

function QuickMint() {
  const [mintLoading, setMintLoading] = useState(false);

    const Mint = (e) => {
        e.preventDefault();
        setMintLoading(true);
        axios.post('https://rudolph-backend.gomez0015.repl.co/api/mint', {seed: e.target[0].value, url: e.target[1].value, amountToMint: e.target[2].value})
            .then(res => {
                console.log(res.data);
                setMintLoading(false);
            }).catch(err => {
            console.error(err);
            })
    }

  return (
    <>
        <Title style={{textAlign: 'center'}}>Quick Mint</Title>
        <form action='#' style={{textAlign: 'center'}}>
            <Input required type="text" name="seed" placeholder="Burner Seed Phrase" style={{textAlign: 'center', width: '25%'}}/>
            <br />
            <Input required type="url" name="url" placeholder="Mint Url" style={{textAlign: 'center', width: '25%'}}/>
            <br />
            <Input required type="number" name="amountToMint" placeholder="Amount To Mint" style={{textAlign: 'center', width: '25%'}}/>
            <br />
            <Button htmlType="submit" loading={mintLoading}>Mint</Button>
        </form>
    </>
  );
}

export default QuickMint;
