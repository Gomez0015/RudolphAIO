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
        userTag: '#0468',
        userProfileImg: 'https://cdn.discordapp.com/avatars/251754270997610497/a_79f510a0f952a37b6450648972b0bf41.png',
        level: '32',
        rank: '21',
        serverLevelColor: '#5acff5',
        botName: 'Rudolph',
        botImage: 'https://cdn.discordapp.com/avatars/930970348697051136/1194dda5073eeb13fa69e371f09d5c09.webp?size=160',
        botColor: '#fff'
    });

    const randomValue =(Math.ceil(Math.random() * 100) / 100).toFixed(1);

    console.log(randomValue);
    console.log((Math.floor((5 * (Math.pow(cardData.level, 2)) + (50 * cardData.level) + 100))) * randomValue);

    const numberWithCommas = (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    const formatAMPM =  (date) => {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
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
            botImage: e.target.botImage.value,
            botName: e.target.botName.value,
            botColor: e.target.botColor.value,
        });
    }

  return (
    <div style={{textAlign: 'center'}}>
        <Title>Generation Tools</Title>
        <form action='#' style={{textAlign: 'center', marginBottom: '25px'}} autocomplete="off" onSubmit={saveUserData}>
            <Input required type="text" name="userName" placeholder="User Name" style={{textAlign: 'center', width: '25%'}}/>
            <br />
            <Input required type="text" name="userTag" placeholder="User #" style={{textAlign: 'center', width: '25%'}}/>
            <br />
            <Input required type="url" name="userProfileImg" placeholder="User Profile Image" style={{textAlign: 'center', width: '25%'}}/>
            <br />
            <Input required type="number" name="level" placeholder="Level" style={{textAlign: 'center', width: '25%'}}/>
            <br />
            <Input required type="number" name="rank" placeholder="Rank" style={{textAlign: 'center', width: '25%'}}/>
            <br />
            <p style={{marginTop: '10px'}}>Server Level Bar Color</p>
            <Input required type="color" name="serverLevelColor" defaultValue="#5acff5" style={{textAlign: 'center', width: '25%'}}/>
            <br />
            <p style={{marginTop: '10px'}}>Server Bot Color</p>
            <Input required type="color" name="botColor" defaultValue="#fff" style={{textAlign: 'center', width: '25%'}}/>
            <br />
            <Input type="text" name="botName" placeholder="Server Bot Name" style={{textAlign: 'center', width: '25%'}}/>
            <br />
            <Input type="url" name="botImage" placeholder="Server Bot Image" style={{textAlign: 'center', width: '25%'}}/>
            <br />
            <Input type="url" name="serverBackground" placeholder="Server Rank Card Background" style={{textAlign: 'center', width: '25%'}}/>
            <br />
            <Button htmlType="submit">Generate Rank Card</Button>
        </form>
        <div style={{backgroundColor: '#2C2F33', borderRadius: '15px', padding: '10%'}}> 
            <div style={{"textAlign":"center","marginBottom":"5px","position":"relative","top":"10px","marginRight":"300px"}}>
                <img src={cardData.botImage} aria-hidden="true" alt=" " style={{"position":"relative","left":"-16px","top":"8px","marginTop":"calc(4px - 0.125rem)","width":"40px","height":"40px","borderRadius":"50%","overflow":"hidden","cursor":"pointer","userSelect":"none","WebkitBoxFlex":"0","flex":"0 0 auto","pointerEvents":"none","zIndex":"1"}}/>
                <span aria-expanded="false" role="button" tabindex="0" style={{"fontSize":"1rem","fontWeight":"500","lineHeight":"1.375rem","color": cardData.botColor,"display":"inline","verticalAlign":"baseline","position":"relative","overflow":"hidden","MsFlexNegative":"0","marginLeft":"-10px","flexShrink":"0"}}>
                {cardData.botName}</span>
                
                <span style={{"height":"0.9375rem","padding":"0.375rem","borderRadius":"0.1875rem","marginLeft":"0.25rem","position":"relative","top":"-2px","textAlign":"left","background":"#5865F2","color":"#fff","fontSize":".625rem","textTransform":"uppercase","display":"inline-flex","WebkitBoxAlign":"center","MsFlexAlign":"center","alignItems":"center","MsFlexNegative":"0","flexShrink":"0","textIndent":"0","outline":"0"}}><span>BOT</span></span>
                <time aria-label="Rudolph is here." id="message-timestamp-937766364385525862" datetime="2022-01-31T17:48:44.126Z" style={{"fontSize":"0.75rem","lineHeight":"1.375rem","color":"#72767d","verticalAlign":"baseline", position: 'relative', left: '8px'}}>Today at {formatAMPM(new Date)}</time>
            </div>
            <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                width="467px"
                height="141px"
            >
                {/* <!-- Background picture --> */}
                {cardData.serverBackground != undefined && cardData.serverBackground != '' ? <>
                <clipPath id="clip">
                    <rect id="rect" width="467px" height="141px" rx="3" ry="3"></rect>
                </clipPath>
                <image clip-path="url(#clip)" width="467px" height="141px" xlinkHref={cardData.serverBackground}></image>
                </>
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
                    #{cardData.rank + " "}
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
                {((5 * (Math.pow(cardData.level, 2)) + (50 * cardData.level) + 100) * randomValue) > 1000 ? (numberWithCommas((Math.floor((5 * (Math.pow(cardData.level, 2)) + (50 * cardData.level) + 100))) * randomValue).toFixed(1)).toString().slice(0, -1) + "K" : (Math.floor((5 * (Math.pow(cardData.level, 2)) + (50 * cardData.level) + 100) * randomValue)) + " "}
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
                width='316px'
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
                width={(316 * (((5 * (Math.pow(cardData.level, 2)) + (50 * cardData.level) + 100) * randomValue)/(5 * (Math.pow(cardData.level, 2)) + (50 * cardData.level) + 100)))}
                height="18"
                style={{fill: cardData.serverLevelColor}}
                ></rect>
            </svg>
        </div>
    </div>
  );
}

export default Generators;
