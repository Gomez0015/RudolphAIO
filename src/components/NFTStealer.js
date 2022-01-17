import React, { useState } from 'react';
import axios from 'axios';
import JSZip from "jszip"
import { saveAs } from 'file-saver';
import { Layout, Menu, Breadcrumb, Typography, Input, Submit, Center, Button, Form, Progress } from 'antd';
import {
  UserOutlined,
  DollarOutlined,
} from '@ant-design/icons';
const { Title } = Typography;
const { SubMenu } = Menu;
const { Header, Content, Sider, Footer } = Layout;


function NFTStealer() {
    const [downloadPercent, setDownloadPercent] = useState(0);
    const [downloadError, setDownloadError] = useState(false);

    async function startDownload(e) {
        try {
            e.preventDefault();
            setDownloadPercent(10);
            var collectionName = e.target.name.value.toLowerCase();;
            var amountToDownload = e.target.number.value;

            var collection = await axios.get(`https://api.opensea.io/api/v1/collection/${collectionName}?format=json`);
            if (collection.status_code == 429) {
                console.log("Server returned HTTP 429. Request was throttled. Please try again in about 5 minutes.");
                setDownloadError(true);
            } else if (collection.status_code == 404) {
                setDownloadError(true);
                console.log("Collection not found.");
            } else {
                setDownloadPercent(20);
                var count = collection.data.collection.stats.count;
                var iter = Math.ceil(count / 50);
                console.log(`\nBeginning download of \"${collectionName}\" collection.\n`);
                var stats = {
                    downloadedData: 0,
                    alreadyDownloadedData: 0,
                    downloadedImages: 0,
                    alreadyDownloadedImages: 0,
                    failedImages: 0
                }
                var currentIndex = -1;
                var fileURLs = [];
                // Iterate through every unit
                for (var i = 0; i < iter; i++) {
                    var offset = i * 50;
                    var data = (await axios.get(`https://api.opensea.io/api/v1/assets?order_direction=asc&offset=${offset}&limit=50&collection=${collectionName}&format=json`)).data;
                    if (currentIndex >= (amountToDownload - 1)) {
                        break;
                    }
                    if (data.assets) {
                        setDownloadPercent(30);
                        for (let x = 0; x < data.assets.length; x++) {
                            try {
                                if (currentIndex >= (amountToDownload - 1)) {
                                    break;
                                }
                                var image;
                                currentIndex += 1
                                console.log(`\n#${currentIndex}:`)
                                    //   Check if image already exists, if it does, skip saving it
                                    // Make the request to the URL to get the image
                                if (!data.assets[x].image_original_url) {
                                    image = await axios.get(data.assets[x].image_original_url);
                                } else {
                                    image = await axios.get(data.assets[x].image_url);
                                }
                                // If the URL returns status code "200 Successful", save the image into the "images" folder.
                                if (image.status == 200) {
                                    var file = `./images/${currentIndex}.jpg`;
                                    fileURLs.push(image.config.url);
                                    console.log(`  Image -> [\u2713] (Successfully downloaded)`)
                                    stats.downloadedImages += 1;
                                } else {
                                    console.log(`Image -> [!] (HTTP Status ${image.status})`)
                                    stats.failedImages += 1;
                                }
                            }catch (e) {
                                console.log(e);
                            }
                        }
                    } else {
                        setDownloadError(true);
                        console.log('No Assets found!');
                    }
                }

                var zip = new JSZip();
                zip.file("Hello.txt", "Hello World\n");
                var img = zip.folder(`${collectionName}`);
                var count = 0;
                setDownloadPercent(40);
                function downloadFile(url, onSuccess) {
                    axios.get(url, {responseType: 'blob'}).then((response) => {console.log(response); onSuccess(response.data);}).catch((error) => {console.log(error)});
                }
                function onDownloadComplete(blobData){
                    if (count < fileURLs.length) {
                        blobToBase64(blobData, function(binaryData){
                            // add downloaded file to zip:
                            var fileName = `${count}.jpg`;
                            img.file(fileName, binaryData, {base64: true});
                            if (count < fileURLs.length -1){
                                setDownloadPercent(Math.round(50 + (count / fileURLs.length) * 49));
                                count++;
                                downloadFile(fileURLs[count], onDownloadComplete);
                            } else {
                                // all files have been downloaded, create the zip
                                zip.generateAsync({type:"blob"})
                                .then(async function(content) {
                                    // see FileSaver.js
                                    await saveAs(content, "example.zip");
                                    setDownloadPercent(100);
                                });
                            }
                        });
                    }
                }
                function blobToBase64(blob, callback) {
                    var reader = new FileReader();
                    reader.onload = function() {
                        var dataUrl = reader.result;
                        var base64 = dataUrl.split(',')[1];
                        callback(base64);
                    };
                    reader.readAsDataURL(blob);
                }

                setDownloadPercent(50);
                await downloadFile(fileURLs[count], onDownloadComplete);
            }
        } catch (error) {
            setDownloadError(true);
            console.log(error);
        }
    }

    return (
        <>
            <form action='#' style={{textAlign: 'center'}} onSubmit={startDownload}>
                <Input required type="text" name="name" placeholder="Opensea Collection Name" style={{textAlign: 'center', width: '25%'}}/>
                <br />
                <Input required type="number" name="number" placeholder="Amount To Steal" style={{textAlign: 'center', width: '25%'}}/>
                <br />
                <Button htmlType="submit">Steal!</Button>
            </form>
            <Progress percent={downloadPercent} status={(downloadPercent < 100 && !downloadError) ? "active" : downloadError ? "exception" : "none"} />
        </>
    );
}

export default NFTStealer;
