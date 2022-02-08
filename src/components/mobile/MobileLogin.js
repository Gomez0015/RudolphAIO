import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, Menu, Breadcrumb, Typography, Input, Submit, Center, Button, Form } from 'antd';
import { useNavigate } from "react-router-dom";
import {
  UserOutlined,
  DollarOutlined,
} from '@ant-design/icons';
const { Title } = Typography;
const { SubMenu } = Menu;
const { Header, Content, Sider, Footer } = Layout;

function LoginPage(props) {
    const [userWallet, setUserWallet] = useState('none');
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get("code");
    const navigate = useNavigate();

    // Similar to componentDidMount and componentDidUpdate:
    useEffect(() => {
        if(props.cookies.userToken != 'none' && props.cookies.userToken != undefined && props.cookies.userToken != null) {
            axios.post(process.env.REACT_APP_SERVER_URI + '/api/checkAuthDiscord', {discordId: props.cookies.userToken})
                .then(res => {
                    
                    if(res.data.state == 'success') {
                        props.successMessage(res.data.message);
                    } else if(res.data.state == 'error'){
                        props.errorMessage(res.data.message);
                    }

                    if(res.data.key != 'none' && res.data.expired != 'false' && res.data.key != undefined) {
                        props.setLoggedIn(true);
                    }
                }).catch(err => {
                    console.error(err);
                })
        }
    }, []);

    const Login = async (e) => {
        e.preventDefault();
        const discordAuth = await CallBack(code);
        axios.post(process.env.REACT_APP_SERVER_URI + '/api/checkAuthDiscord', {discordId: discordAuth.data.id, discordLogin: true})
            .then(res => {
                if(res.data.state === 'success') {
                    props.successMessage(res.data.message);
                } else if(res.data.state === 'error'){
                    props.errorMessage(res.data.message);
                }
                if(res.data.key != 'none' && res.data.expired != 'false' && res.data.key != undefined) {
                    props.setCookie("userToken", res.data.discordId, {
                        path: "/"
                    });
                    props.setLoggedIn(true);
                }
            }).catch(err => {
                console.error(err);
            });
    }

    const CallBack = async (code) => {
        const result = await axios.post(process.env.REACT_APP_SERVER_URI + '/api/getDiscordAuthInfo', {code: code});

        return result;
    }

    const DiscordLogin = () => {
        window.open(process.env.REACT_APP_SERVER_URI + `/api/discordLogin`);
    }


  return (
    <div style={{textAlign: 'center'}}>
        <Title>Login</Title>
        {code ? 
            <Button onClick={Login}>Log in</Button>
        :
            <>
            <form action='#' onSubmit={() => {DiscordLogin();}}>
                <Button htmlType="submit">Login with Discord</Button>
            </form>
            </>
        }
    </div>
  );
}

export default LoginPage;
