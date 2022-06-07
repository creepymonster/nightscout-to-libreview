const dayjs = require('dayjs');
const uuid = require('uuid');
const colors = require('colors');
const prompt = require('prompt');
const fs = require('fs');
require('dotenv').config({ path: __dirname + '/../config.env' });

const libre = require('./functions/libre');
const nightscout = require('./functions/nightscout');

const CONFIG_NAME = 'config.json';
const DEFAULT_CONFIG = {
};

if (!fs.existsSync(CONFIG_NAME)) {
  fs.writeFileSync(CONFIG_NAME, JSON.stringify(DEFAULT_CONFIG));
}

const rawConfig = fs.readFileSync(CONFIG_NAME);
let config = JSON.parse(rawConfig);

prompt.get([{
  name: 'nightscoutUrl',
  description: 'please enter your nightscout url',
  required: true,
  default: config.nightscoutUrl
}, {
  name: 'nightscoutToken',
  description: 'please enter your nightscout token',
  required: false,
  default: config.nightscoutToken
}, {
  name: 'libreUsername',
  description: 'please enter your libreview username',
  required: true,
  default: config.libreUsername
}, {
  name: 'librePassword',
  description: 'please enter your libreview password',
  required: true,
  default: config.librePassword
}, {
  name: 'year',
  description: 'please enter the year you want to transfer to libreview',
  required: true,
  type: 'number',
  default: new Date().getFullYear()
}, {
  name: 'month',
  description: 'please enter the month you want to transfer to libreview',
  required: true,
  type: 'number',
  default: new Date().getMonth()
}, {
  name: 'libreResetDevice',
  description: 'if you have problems with your transfer, recreate your device id',
  required: true,
  type: 'boolean',
  default: false
}], function (err, result) {
  if (err) {
    return onErr(err);
  }

  config = Object.assign({}, config, {
    nightscoutUrl: result.nightscoutUrl,
    nightscoutToken: result.nightscoutToken,
    libreUsername: result.libreUsername,
    librePassword: result.librePassword,
    libreDevice: (result.libreResetDevice || !!!config.libreDevice) ? uuid.v4().toUpperCase() : config.libreDevice
  });

  fs.writeFileSync(CONFIG_NAME, JSON.stringify(config));

  (async () => {
    const fromDate = dayjs(`${result.year}-${result.month}-01`).format('YYYY-MM-DD');
    const toDate = dayjs(`${result.year}-${result.month + 1}-01`).format('YYYY-MM-DD');

    console.log('transfer time span', fromDate.gray, toDate.gray);

    const glucoseEntries = await nightscout.getNightscoutGlucoseEntries(config.nightscoutUrl, config.nightscoutToken, fromDate, toDate);
    const foodEntries = await nightscout.getNightscoutFoodEntries(config.nightscoutUrl, config.nightscoutToken, fromDate, toDate);
    const insulinEntries = await nightscout.getNightscoutInsulinEntries(config.nightscoutUrl, config.nightscoutToken, fromDate, toDate);

    if (glucoseEntries.length > 0 || foodEntries.length > 0 || insulinEntries.length > 0) {
      const auth = await libre.authLibreView(config.libreUsername, config.librePassword, config.libreDevice, result.libreResetDevice);
      if (!!!auth) {
        console.log('libre auth failed!'.red);

        return;
      }

      await libre.transferLibreView(config.libreDevice, auth, glucoseEntries, foodEntries, insulinEntries);
    }
  })();
});

function onErr(err) {
  console.log(err);
  return 1;
}