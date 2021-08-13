const axios = require('axios');
// const smooth = require('array-smooth');
const dayjs = require('dayjs');
const colors = require('colors');

const authLibreView = async function (username, password, device) {
  const data = {
    DeviceId: device,
    Domain: "Libreview",
    GatewayType: "FSLibreLink.iOS",
    Password: password,
    SetDevice: true,
    UserName: username
  };

  const response = await axios.default.post('https://api-eu.libreview.io/lsl/api/nisperson/getauthentication', data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (response.data.status !== 0) {
    return;
  }

  return response.data.result.UserToken;
};

const getLibreViewDevice = async function (email, password) {
  const data = {
    'email': email,
    'password': password
  };

  const response = await axios.default.post('https://api-eu.libreview.io/auth/login', data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (response.data.status !== 0) {
    return;
  }

  const devices = response.data.data.user.devices;
  for (const propertyName in devices) {
    if (devices.hasOwnProperty(propertyName) && devices[propertyName].sn) {
      return devices[propertyName].sn;
    }
  }
};

const transferLibreView = async function (device, auth, glucoseEntries, foodEntries, insulinEntries) {
  console.log('glucose entries', (glucoseEntries || []).length.toString().gray);
  console.log('food entries', (foodEntries || []).length.toString().gray);
  console.log('insulin entries', (insulinEntries || []).length.toString().gray);

  const data = {
    DeviceData: {
      header: {
        device: {
          modelName: "com.freestylelibre.app.de",
          uniqueIdentifier: device
        }
      },
      measurementLog: {
        capabilities: ["scheduledContinuousGlucose", "unscheduledContinuousGlucose", "bloodGlucose", "insulin", "food", "generic-com.abbottdiabetescare.informatics.exercise", "generic-com.abbottdiabetescare.informatics.customnote", "generic-com.abbottdiabetescare.informatics.ondemandalarm.low", "generic-com.abbottdiabetescare.informatics.ondemandalarm.high", "generic-com.abbottdiabetescare.informatics.ondemandalarm.projectedlow", "generic-com.abbottdiabetescare.informatics.ondemandalarm.projectedhigh", "generic-com.abbottdiabetescare.informatics.sensorstart", "generic-com.abbottdiabetescare.informatics.error", "generic-com.abbottdiabetescare.informatics.isfGlucoseAlarm", "generic-com.abbottdiabetescare.informatics.alarmSetting"],
        bloodGlucoseEntries: [],
        genericEntries: [],
        scheduledContinuousGlucoseEntries: glucoseEntries || [],
        insulinEntries: insulinEntries || [],
        foodEntries: foodEntries || [],
        unscheduledContinuousGlucoseEntries: []
      }
    },
    UserToken: auth,
    Domain: "Libreview",
    GatewayType: "FSLibreLink.iOS"
  }

  const response = await axios.default.post('https://api-eu.libreview.io/lsl/api/measurements', data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  console.log('transfer response', response.data.gray);
};

exports.authLibreView = authLibreView;
exports.getLibreViewDevice = getLibreViewDevice;
exports.transferLibreView = transferLibreView;