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

function Generators() {
    const [cardData, setCardData] = useState({
        userName: 'Raxo',
        userTag: '#4680',
        userProfileImg: 'https://cdn.discordapp.com/avatars/251754270997610497/a_79f510a0f952a37b6450648972b0bf41.png',
        level: '420',
        rank: '69',
        serverLevelColor: '#5acff5'
    });

    const numberWithCommas = (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    const saveUserData = (e) => {
        e.preventDefault();
        setCardData({
            userName: e.target.userName.value,
            userTag: e.target.userTag.value,
            userProfileImg: e.target.userProfileImg.value,
            level: e.target.level.value,
            rank: e.target.rank.value,
            serverLevelColor: e.target.serverLevelColor.value,
            serverBackground: e.target.serverBackground.value,
        });
        console.log({
            userName: e.target.userName.value,
            userTag: e.target.userTag.value,
            userProfileImg: e.target.userProfileImg.value,
            level: e.target.level.value,
            rank: e.target.rank.value,
            serverLevelColor: e.target.serverLevelColor.value,
            serverBackground: e.target.serverBackground.value,
        });
    }

  return (
    <div style={{textAlign: 'center'}}>
        <Title>Generation Tools</Title>
        <form action='#' style={{textAlign: 'center', marginBottom: '25px'}} autocomplete="off" onSubmit={saveUserData}>
            <Input required type="text" name="userName" placeholder="Raxo" style={{textAlign: 'center', width: '25%'}}/>
            <br />
            <Input required type="text" name="userTag" placeholder="#0468" style={{textAlign: 'center', width: '25%'}}/>
            <br />
            <Input required type="url" name="userProfileImg" placeholder="https://cdn.discordapp.com/avatars/251754270997610497/a_79f510a0f952a37b6450648972b0bf41.png" style={{textAlign: 'center', width: '25%'}}/>
            <br />
            <Input required type="number" name="level" placeholder="420" style={{textAlign: 'center', width: '25%'}}/>
            <br />
            <Input required type="number" name="rank" placeholder="69" style={{textAlign: 'center', width: '25%'}}/>
            <br />
            <Input required type="color" name="serverLevelColor" defaultValue="#5acff5" style={{textAlign: 'center', width: '25%'}}/>
            <br />
            <Input type="url" name="serverBackground" style={{textAlign: 'center', width: '25%'}}/>
            <br />
            <Button htmlType="submit">Generate Rank Card</Button>
        </form>
        <div style={{backgroundColor: '#2C2F33', borderRadius: '15px', padding: '10%'}}> 
            <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                width="467px"
                height="141px"
            >
                {/* <!-- Background picture --> */}
                {cardData.serverBackground != undefined && cardData.serverBackground != '' ? 
                <image clip-path="url(#clip)" width="467px" height="141px" xlinkHref={cardData.serverBackground}></image>
                :
                <rect
                id="rect"
                width="100%"
                height="100%"
                rx="3"
                ry="3"
                style={{fill: '#23272A'}}
                ></rect>
                }

                {/* <!-- Rounded rectangle in the center --> */}
                <rect
                y="18"
                x="12"
                rx="3"
                ry="3"
                width="443"
                height="105"
                style={{fill: 'black', opacity: 0.7}}
                ></rect>

                {/* <!-- === Avatar. ===
                    Radius of circle = rc = 40px
                    Width of circle = height of circle = rc * 2 = 80px
                    margin left of avatar = mla = 21px
                    margin top of avatar = mta = 31px -->
                <!-- Border of avatar.
                    This border is made by a frame that is bigger than the avatar and behind it
                    centered at the same point.
            
                    Width of border = wb = 4px
                    Radius of border = rb = rc + wb/2 = 42px
                    --> */}
                <circle r="42" cx="61" cy="71" style={{fill: 'black'}}></circle>
                <clipPath id="clipCircle">
                {/* <!-- cx = mla + r = 21 + 40 = 61
                        cy = mta + r = 31 + 40 = 71 --> */}
                <circle r="40" cx="61" cy="71"></circle>
                </clipPath>
                <image
                x="21"
                y="31"
                width="80"
                height="80"
                clip-path="url(#clipCircle)"
                xlinkHref={cardData.userProfileImg}
                ></image>

                {/* <!-- Activity status --> */}
                <circle r="12" cx="92" cy="97" style={{fill: 'black'}}></circle>
                <circle r="10" cx="92" cy="97" style={{fill: '#44b37f'}}></circle>

                {/* <!-- Rank and level --> */}
                <text
                x="441"
                y="50"
                font-family="Poppins"
                font-size="12"
                text-anchor="end"
                style={{stroke: 'black', strokeWidth: '0.2px'}}
                >
                <tspan fill="white">
                    {' RANK '}
                    <tspan font-size="30">
                    #{cardData.rank}
                    </tspan>
                </tspan>
                <tspan style={{fill: cardData.serverLevelColor}}>
                    {' LEVEL '}
                    <tspan font-size="30">{cardData.level}</tspan>
                </tspan>
                </text>

                {/* <!-- Username + tag --> */}
                <text x="137" y="83" font-family="DejaVu" font-size="" fill="white">
                {cardData.userName + " "}
                <tspan style={{fill: '#7f8384'}} font-size="12">{cardData.userTag}</tspan>
                </text>

                {/* <!-- Exp points --> */}
                <text
                x="441"
                y="83"
                font-family="Poppins"
                font-size="12"
                fill="white"
                text-anchor="end"
                >
                {((5 * (Math.pow(cardData.level, 2)) + (50 * cardData.level) + 100) / 10) > 1000 ? (numberWithCommas(Math.floor((5 * (Math.pow(cardData.level, 2)) + (50 * cardData.level) + 100)) / 100)).toString().slice(0, -1) + "K" : (Math.floor((5 * (Math.pow(cardData.level, 2)) + (50 * cardData.level) + 100) / 10)) + " "}
                <tspan style={{fill: '#7f8384'}}>/ {(5 * (Math.pow(cardData.level, 2)) + (50 * cardData.level) + 100) > 1000 ? (numberWithCommas(5 * (Math.pow(cardData.level, 2)) + (50 * cardData.level) + 100)).toString().slice(0, -1) + "K" : (5 * (Math.pow(cardData.level, 2)) + (50 * cardData.level) + 100)} XP</tspan>
                </text>

                {/* <!-- === Progress bar === -->
                <!-- simulate an outer stroke --> */}
                <rect
                x="128"
                y="91"
                rx="12"
                ry="12"
                width="318"
                height="20"
                style={{fill: 'black'}}
                ></rect>
                {/* <!-- background color of progress bar--> */}
                <rect
                x="129"
                y="92"
                rx="9"
                ry="9"
                width="316"
                height="18"
                style={{fill: '#484b4e'}}
                ></rect>
                {/* <!-- actual progress bar.
                    be careful when computing width: full width is 316px.
                    Minimum width should be either 0px or 18px for better looking because of border radius --> */}
                <rect
                x="129"
                y="92"
                rx="9"
                ry="9"
                width="150"
                height="18"
                style={{fill: cardData.serverLevelColor}}
                ></rect>
            </svg>
        </div>
    </div>
  );
}

export default Generators;
