const axios = require('axios');
const dayjs = require('dayjs');
const colors = require('colors');

const getNightscoutToken = function (token) {
  if (token.trim() !== '') {
    return `&token=${token.trim()}`
  }

  return '';
};

const getNightscoutFoodEntries = async function (baseUrl, token, fromDate, toDate) {
  const url1 = `${baseUrl}/api/v1/treatments.json?find[created_at][$gte]=${fromDate}&find[created_at][$lte]=${toDate}&find[eventType]=Meal%20Bolus&count=131072${getNightscoutToken(token)}`;
  console.log('entries url', url1.gray);

  const response1 = await axios.get(url1, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const data1 = response1.data.map(d => {
    return {
      id: parseInt(`2${dayjs(d['created_at']).format('YYYYMMDDHHmmss')}`),
      timestamp: d['created_at'],
      carbs: d.carbs,
      absorptionTime: d.absorptionTime,
      foodType: d.foodType
    };
  });

  const url2 = `${baseUrl}/api/v1/treatments.json?find[created_at][$gte]=${fromDate}&find[created_at][$lte]=${toDate}&find[eventType]=Carb%20Correction&count=131072${getNightscoutToken(token)}`;
  console.log('entries url', url2.gray);

  const response2 = await axios.get(url2, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const data2 = response2.data.map(d => {
    return {
      id: parseInt(`2${dayjs(d['created_at']).format('YYYYMMDDHHmmss')}`),
      timestamp: d['created_at'],
      carbs: d.carbs,
      absorptionTime: d.absorptionTime,
      foodType: d.foodType
    };
  });

  return [...data1, ...data2].map(e => {
    return {
      extendedProperties: {
        factoryTimestamp: e.timestamp
      },
      recordNumber: e.id,
      timestamp: e.timestamp,
      gramsCarbs: e.carbs,
      foodType: "Unknown"
    };
  });
};

const getNightscoutGlucoseEntries = async function (baseUrl, token, fromDate, toDate) {
  const url = `${baseUrl}/api/v1/entries.json?find[dateString][$gte]=${fromDate}&find[dateString][$lte]=${toDate}&count=131072${getNightscoutToken(token)}`;
  console.log('glucose entries url', url.gray);

  const response = await axios.get(url, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const data = response.data.filter(function (value, index, Arr) {
    return index % 3 == 0;
  }).map(d => {
    return {
      id: parseInt(`1${dayjs(d.dateString).format('YYYYMMDDHHmmss')}`),
      sysTime: d.sysTime,
      dateString: d.dateString,
      sgv: d.sgv,
      delta: d.delta,
      direction: d.direction
    };
  });

  return data.map(e => {
    return {
      "extendedProperties": {
        "highOutOfRange": e.sgv >= 400 ? "true" : "false",
        "canMerge": "true",
        "isFirstAfterTimeChange": false,
        "factoryTimestamp": e.sysTime,
        "lowOutOfRange": e.sgv <= 40 ? "true" : "false"
      },
      "recordNumber": e.id,
      "timestamp": e.dateString,
      "valueInMgPerDl": e.sgv
    };
  });
};

const getNightscoutInsulinEntries = async function (baseUrl, token, fromDate, toDate) {
  const url1 = `${baseUrl}/api/v1/treatments.json?find[created_at][$gte]=${fromDate}&find[created_at][$lte]=${toDate}&find[eventType]=Correction%20Bolus&count=131072${getNightscoutToken(token)}`;
  console.log('insulin entries url', url1.gray);

  const response1 = await axios.get(url1, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const data1 = response1.data.map(d => {
    return {
      id: parseInt(`4${dayjs(d['created_at']).format('YYYYMMDDHHmmss')}`),
      timestamp: d['created_at'],
      insulin: d.insulin,
      duration: d.duration
    };
  });

  const url2 = `${baseUrl}/api/v1/treatments.json?find[created_at][$gte]=${fromDate}&find[created_at][$lte]=${toDate}&find[eventType]=Bolus&count=131072${getNightscoutToken(token)}`;
  console.log('insulin entries url', url2.gray);

  const response2 = await axios.get(url2, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const data2 = response2.data.map(d => {
    return {
      id: parseInt(`4${dayjs(d['created_at']).format('YYYYMMDDHHmmss')}`),
      timestamp: d['created_at'],
      insulin: d.insulin,
      duration: d.duration
    };
  });

  return [...data1, ...data2].map(e => {
    return {
      extendedProperties: {
        factoryTimestamp: e.timestamp
      },
      recordNumber: e.id,
      timestamp: e.timestamp,
      units: e.insulin,
      insulinType: "RapidActing"
    };
  });
};

exports.getNightscoutFoodEntries = getNightscoutFoodEntries;
exports.getNightscoutGlucoseEntries = getNightscoutGlucoseEntries;
exports.getNightscoutInsulinEntries = getNightscoutInsulinEntries;