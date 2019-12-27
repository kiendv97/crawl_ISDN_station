const puppeteer = require('puppeteer');
const express = require('express');
const cron = require('node-cron');
const axios = require('axios');
const scheduleStringCron = '*/10 * * * * *';
const scheduleRefesh = '*/3 * * * *';
let browser;
// CRON 
BrowserHandler();
cron.schedule(scheduleRefesh, async () => {
    console.log('refesh');
    const page = await browser.newPage()
    await page.goto(`http://10.50.8.210/1090/main.jsp`, {
        waitUntil: 'load'
    });
    await page.close();

})
cron.schedule(scheduleStringCron, async () => {
    console.log('cronning 5 minutes');
    let data = [];
    axios.get('https://gateway.stl.vn/getkeyword')
        .then(async (responses) => {
            if (responses.data.status && responses.data.result.length > 0) {
                data = responses.data.result;
                data.forEach(async (el) => {
                    const result = await searchISDN(el._id);
                    await setInfo({ _id: el._id, result: result });
                })

            }
        })
        .catch(async (error) => {
            throw error
        })


});
function sendToDingtalk(data) {
    axios
        .post(`https://oapi.dingtalk.com/robot/send?access_token=031011ad57ec1aaf5b46b7d13663a54a8997ed6d0ba248e40b25f12f2f6159f0`, {
            "msgtype": "text",
            "text": {
                "content": data
            }
        })
        .then(responses => {
            if (responses.data.status) {
                console.log('sendToDingTalk ok');
            }
        });
}
async function setInfo(data) {
    console.log(data ,'xxxxxxxxxx');
    let result;
    axios
        .post(`https://gateway.stl.vn/setinfo`, {
            telco: 'mobi',
            keyword: data._id,
            content: data.result || {},
        })
        .then(responses => {
            console.log(responses);
            // if (responses) {
            //     console.log('setinfo ok');
            //     // result = responses.data.result
            // }
        })


}
async function BrowserHandler() {
    browser = await puppeteer.launch({
        headless: false,
        // ============ DEBUG ====================//
         slowMo: 10,
        // defaultViewport: {
        //     width: 600,
        //     height: 600
        // },
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu'
        ],
        ignoreDefaultArgs: ['--disable-extensions']
    });

    // =========
    await login();


}

async function login(username, password) {
    try {
        const page = await browser.newPage();
        // file:///E:/Document%20(Project)/crawl.ISDN.sim/login.html
        await page.goto('http://10.50.8.210/1090/login.jsp', {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });
        await page.waitForSelector('input');
        await page.type('input[name="txtUserName"]', username || 'Mbf2_nganha');
        await page.type('input[name="txtPassword"]', password || 'nganha999999');
        await page.click('.button');
        await page.waitForSelector('table');

        const checkLogin = await page.evaluate(() => {
            return (document.getElementsByTagName('input').length === 0) ? true : false;
        })
        console.log("checkLogin: " + checkLogin);
        if (checkLogin) {
            await page.close();
        } else {
            await page.close();
            await login(username, password)
        }
    } catch (error) {
        throw error;
    }
}

async function searchISDN(numberISDN) {
    try {
        if (!numberISDN) return;
        const page = await browser.newPage();
        // file:///E:/Document%20(Project)/crawl.ISDN.sim/crawlSDN.html
        await page.goto(`http://10.50.8.210/1090/isdn_detail.jsp?p_ISDN=${numberISDN}`, {
            waitUntil: 'load',
            timeout: 60000
        });
        await page.waitForSelector('table');
        const checkLogin = await page.evaluate(() => {
            return (document.getElementsByTagName('input').length !== 0) ? true : false;
        })
        if (checkLogin) {
            await page.close();
            return {};
        }
        try {
            let data = await page.evaluate(() => {
                const tables = document.getElementsByTagName('table').item(1);
                const data2 = tables.getElementsByTagName('tr');
                let ArrObject = {};
                for (let i = 0; i < data2.length; i++) {
                    const nameLeft = data2[i].getElementsByTagName('td').item(0).textContent.trim();
                    const valueLeft = data2[i].getElementsByTagName('td').item(1).textContent.trim();
                    const nameRight = (i < 5) ? data2[i].getElementsByTagName('td').item(2).textContent.trim() : '';
                    const valueRight = (i < 5) ? data2[i].getElementsByTagName('td').item(3).textContent.trim() : '';
                    const ObjectData = {
                        [nameLeft]: valueLeft,
                        [nameRight]: valueRight
                    }
                    ArrObject = { ...ArrObject, ...ObjectData }
                }
                return ArrObject
            });
            await page.close();
            return data;
        } catch (error) {
            await page.close();
            console.log(error);
            return {};
        }

    } catch (error) {
        throw error

    }
}

