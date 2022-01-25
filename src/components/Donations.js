import React, { useState } from 'react';
import axios from 'axios';
import { Layout, Menu, Breadcrumb, Typography, Input, Submit, Center, Button, Form } from 'antd';
import ConnectToPhantom from "./Phantom/ConnectToPhantom.tsx";
import sendTransferInstruction from './Phantom/SendTransaction.tsx'
import {
  UserOutlined,
  DollarOutlined,
} from '@ant-design/icons';
const { Title } = Typography;
const { SubMenu } = Menu;
const { Header, Content, Sider, Footer } = Layout;

function QuickMint() {
    const [userWallet, setUserWallet] = useState('none');

    const donate = (e) => {
        e.preventDefault();
        sendTransferInstruction(e.target.price.value)
    }

    return (
        <div style={{textAlign: 'center'}}>
            <Title style={{textAlign: 'center'}}>Donations</Title>
            <ConnectToPhantom setUserWallet={setUserWallet}/>
            {userWallet != 'none' ? 
            <form action='#' style={{textAlign: 'center'}} onSubmit={donate} >
                <Input required type="number" name="price" min="0" step="0.01" placeholder="Amount To Donate" style={{textAlign: 'center', width: '25%'}}/>
                <br />
                <Button htmlType="submit">Donate! :)</Button>
            </form>
            : null}
        </div>
    );
}

export default QuickMint;
