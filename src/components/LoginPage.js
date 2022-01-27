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
    const buyKey = props.cookies.buyKey;

    const setNewKeyCookie = (value) => {
        props.setCookie("newKey", value, {
            path: "/"
        });
    }

    const setBuyKeyCookie = (value) => {
        props.setCookie("buyKey", value, {
            path: "/"
        });
    }

    // Similar to componentDidMount and componentDidUpdate:
    useEffect(() => {
        if(props.cookies.userToken != 'none' && props.cookies.userToken != undefined && props.cookies.userToken != null && newKey == 'false') {
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

    const Register = async (e) => {
        e.preventDefault();
        const discordAuth = await CallBack(code);
        if (discordAuth.data.error) return;
        axios.post(process.env.REACT_APP_SERVER_URI + '/api/linkKeyDiscord', {discordId: discordAuth.data.id, authKey: e.target.authKey.value})
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


    const GenerateKey = async (e) => {
        e.preventDefault();
        const discordAuth = await CallBack(code);
        if(process.env.REACT_APP_WHITE_LIST.includes(discordAuth.data.id)){
            axios.post(process.env.REACT_APP_SERVER_URI + '/api/generateNewKey', {discordId: discordAuth.data.id})
                .then(res => {
                    console.log(res.data);
                    if(res.data.state === 'success') {
                        props.successMessage(res.data.message);
                    } else if(res.data.state === 'error'){
                        props.errorMessage(res.data.message);
                    }

                    setBuyKeyCookie(false);
                }).catch(err => {
                    console.error(err);
                });
        } else {
            props.errorMessage('You are not in the whitelist!');
        }
    }

    const CallBack = async (code) => {
        const result = await axios.post(process.env.REACT_APP_SERVER_URI + '/api/getDiscordAuthInfo', {code: code});

        console.log(result);
        return result;
    }

    const DiscordLogin = () => {
        window.open(process.env.REACT_APP_SERVER_URI + `/api/discordLogin`);
    }


  return (
    <div style={{textAlign: 'center'}}>
        <Title>Login</Title>
        {code && buyKey == 'true' ? 
        <Button onClick={GenerateKey}>Generate Key</Button>
        : code && newKey == 'true' ?
            <form action='#' onSubmit={Register}>
                <Input required type="key" name="authKey" placeholder="Auth Key" style={{textAlign: 'center', width: '25%'}}/>
                <br />
                <Button htmlType="submit">Link Key To Discord</Button>
            </form>
        : code && newKey == 'false' || code && buyKey == 'false' ? 
            <Button onClick={Login}>Log in</Button>
        :
            <>
            <form action='#' onSubmit={() => {setNewKeyCookie(false); setBuyKeyCookie(true); DiscordLogin();}}>
                <Button htmlType="submit">Buy a Key</Button>
            </form>
            <form action='#' onSubmit={() => {setNewKeyCookie(true); setBuyKeyCookie(false); DiscordLogin();}}>
                <Button htmlType="submit">Link new Key With Discord</Button>
            </form>
            <form action='#' onSubmit={() => {setNewKeyCookie(false); setBuyKeyCookie(false); DiscordLogin();}}>
                <Button htmlType="submit">Login with Discord</Button>
            </form>
            </>
        }
    </div>
  );
}

export default LoginPage;
