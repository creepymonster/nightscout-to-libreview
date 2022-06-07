const axios = require('axios');
const colors = require('colors');

const authLibreView = async function (username, password, device, setDevice) {
  console.log('authLibreView'.blue);

  const data = {
    DeviceId: device,
    GatewayType: "FSLibreLink.iOS",
    SetDevice: setDevice,
    UserName: username,
    Domain: "Libreview",
    Password: password
  };

  const response = await axios.default.post('https://api-eu.libreview.io/lsl/api/nisperson/getauthentication', data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  console.log('authLibreView, response', response.data.gray);

  if (response.data.status !== 0) {
    return;
  }

  return response.data.result.UserToken;
}

const transferLibreView = async function (device, token, glucoseEntries, foodEntries, insulinEntries) {
  console.log('transferLibreView'.blue);

  console.log('glucose entries', (glucoseEntries || []).length.toString().gray);
  console.log('food entries', (foodEntries || []).length.toString().gray);
  console.log('insulin entries', (insulinEntries || []).length.toString().gray);

  const data = {
    UserToken: token,
    GatewayType: "FSLibreLink.iOS",
    DeviceData: {
      header: {
        device: {
          hardwareDescriptor: "iPhone14,2",
          osVersion: "15.4.1",
          modelName: "com.abbott.librelink.de",
          osType: "iOS",
          uniqueIdentifier: device,
          hardwareName: "iPhone"
        }
      },
      measurementLog: {
        capabilities: [
          "scheduledContinuousGlucose",
          "unscheduledContinuousGlucose",
          "bloodGlucose",
          "insulin",
          "food",
          "generic-com.abbottdiabetescare.informatics.exercise",
          "generic-com.abbottdiabetescare.informatics.customnote",
          "generic-com.abbottdiabetescare.informatics.ondemandalarm.low",
          "generic-com.abbottdiabetescare.informatics.ondemandalarm.high",
          "generic-com.abbottdiabetescare.informatics.ondemandalarm.projectedlow",
          "generic-com.abbottdiabetescare.informatics.ondemandalarm.projectedhigh",
          "generic-com.abbottdiabetescare.informatics.sensorstart",
          "generic-com.abbottdiabetescare.informatics.error",
          "generic-com.abbottdiabetescare.informatics.isfGlucoseAlarm",
          "generic-com.abbottdiabetescare.informatics.alarmSetting"
        ],
        bloodGlucoseEntries: [],
        genericEntries: [],
        scheduledContinuousGlucoseEntries: glucoseEntries || [],
        insulinEntries: insulinEntries || [],
        foodEntries: foodEntries || [],
        unscheduledContinuousGlucoseEntries: []
      }
    },
    Domain: "Libreview"
  };

  const response = await axios.default.post('https://api-eu.libreview.io/lsl/api/measurements', data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  console.log('transferLibreView, response', response.data.gray);
};

exports.authLibreView = authLibreView;
exports.transferLibreView = transferLibreView;