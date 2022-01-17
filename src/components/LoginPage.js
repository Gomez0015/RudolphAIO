import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, Menu, Breadcrumb, Typography, Input, Submit, Center, Button, Form } from 'antd';
import {
  UserOutlined,
  DollarOutlined,
} from '@ant-design/icons';

const { Title } = Typography;
const { SubMenu } = Menu;
const { Header, Content, Sider, Footer } = Layout;

function LoginPage(props) {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get("code");
    const newKey = props.cookies.newKey;

    const setNewKeyCookie = (value) => {
        props.setCookie("newKey", value, {
            path: "/"
        });
    }

    // Similar to componentDidMount and componentDidUpdate:
    useEffect(() => {
        if(props.cookies.userToken != 'none' && props.cookies.userToken != undefined && props.cookies.userToken != null && newKey == 'false') {
            axios.post('https://rudolph-backend.gomez0015.repl.co/api/checkAuthDiscord', {discordId: props.cookies.userToken})
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
        axios.post('https://rudolph-backend.gomez0015.repl.co/api/checkAuthDiscord', {discordId: discordAuth.data.id, discordLogin: true})
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

    const Register = async (e) => {
        e.preventDefault();
        const discordAuth = await CallBack(code);
        if (discordAuth.data.error) return;
        axios.post('https://rudolph-backend.gomez0015.repl.co/api/linkKeyDiscord', {discordId: discordAuth.data.id, authKey: e.target.authKey.value})
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
                    setNewKeyCookie(false);
                    props.setLoggedIn(true);
                }
            }).catch(err => {
                console.error(err);
            });
    }

    const CallBack = async (code) => {
        const result = await axios.post('https://rudolph-backend.gomez0015.repl.co/api/getDiscordAuthInfo', {code: code});

        return result;
    }

    const DiscordLogin = () => {
        window.open(`https://rudolph-backend.gomez0015.repl.co/api/discordLogin`);
    }


  return (
    <div style={{textAlign: 'center'}}>
        <Title>Login</Title>
        {code && newKey == 'true' ?
            <form action='#' onSubmit={Register}>
                <Input required type="key" name="authKey" placeholder="Auth Key" style={{textAlign: 'center', width: '25%'}}/>
                <br />
                <Button htmlType="submit">Link Key To Discord</Button>
            </form>
        : code && newKey == 'false' ? 
            <Button onClick={Login}>Log in</Button>
        :
            <>
            <form action='#' onSubmit={() => {setNewKeyCookie(true); DiscordLogin();}}>
                <Button htmlType="submit">Link new Key With Discord</Button>
            </form>
            <form action='#' onSubmit={() => {setNewKeyCookie(false); DiscordLogin();}}>
                <Button htmlType="submit">Login with Discord</Button>
            </form>
            </>
        }
    </div>
  );
}

export default LoginPage;
