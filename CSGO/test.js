const {Builder, By, until} = require('selenium-webdriver');
const {Options} = require("selenium-webdriver/firefox");

async function func(){
    let driver = await new Builder().forBrowser('firefox').setFirefoxOptions(new Options().headless()).build(),
        roundCount = 0;
    await driver.get('https://csgo.fastcup.net/match4478918');
    await driver.wait(until.elementLocated({className: "_33aUm"}), 1000);
    console.log(await (await driver.findElement({className: "_33aUm"})).getText());
    await driver.quit();
}

func();