// Deps
var yaml = require('js-yaml');
var fs = require('fs');
var moment = require('moment');

var endDate = moment();
var startDate = moment().subtract(1, 'months');

var startDateUnix = startDate.unix();
var endDateUnix = endDate.unix();

// Fetch the price from that ticker
var https = require("https");
ticker = 'ETH';
var historicalData = {};

for (var m = startDate; m.isSameOrBefore(endDate); m.add(1, 'days')) {
  mAsUnix = m.unix();

  Promise.resolve(getDayPrice(ticker, mAsUnix)).then(function(data) {
    timestamp = data[0];
    prices = data[1];

    // m is not changing
    // but data is
    console.log("Promise data", data);
    console.log("m", m);
    // m moment("2017-08-17T11:40:20.412")
    //Promise data [ 1502725220, { btc: 0.06919, usd: 299.16 } ]
    //m moment("2017-08-17T11:40:20.412")
    //Promise data [ 1500392420, { btc: 0.09854, usd: 227.09 } ]
    //m moment("2017-08-17T11:40:20.412")
    //Promise data [ 1501170020, { btc: 0.07626, usd: 202.93 } ]
    //m moment("2017-08-17T11:40:20.412")
    //Promise data [ 1502206820, { btc: 0.08662, usd: 296.51 } ]
    //m moment("2017-08-17T11:40:20.412")
    //Promise data [ 1502811620, { btc: 0.06897, usd: 286.52 } ]
    //m moment("2017-08-17T11:40:20.412")
    //Promise data [ 1501602020, { btc: 0.08285, usd: 225.9 } ]
    //m moment("2017-08-17T11:40:20.412")

    if (m.isSameOrBefore(endDate)) {
      console.log(historicalData);
      var priceHistoryChart = new Chart(ctx, {
        type: 'line',
        data: historicalData
      });
    };
  });
};

//https://min-api.cryptocompare.com/data/pricehistorical?fsym=ETH&tsyms=BTC,USD&ts=1452680400
function getDayPrice(ticker, timestamp) {
  const options = {
    hostname: 'min-api.cryptocompare.com',
    port: 443,
    path: '/data/pricehistorical?fsym=' + ticker + '&tsyms=BTC,USD&ts=' + timestamp,
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  };

  return new Promise(function(resolve, reject) {
    var rawData = '';
    var parsedJson = '';

    https.get(options, (priceResponse) => {
      priceResponse.on('data', (d) => {
        rawData += d;
      });

      priceResponse.on('end', () => {
        try {
          parsedJson = JSON.parse(rawData)[ticker];
          btcPrice = parsedJson['BTC'];
          usdPrice = parsedJson['USD'];
          historicalData[timestamp] = {};
          historicalData[timestamp].btc = btcPrice;
          historicalData[timestamp].usd = usdPrice;
          resolve([timestamp, historicalData[timestamp]]);
        } catch (e) {
          console.error(`Got error: ${e.message}`);
          reject(e);
        }
      });
    }).on('error', (e) => {
      console.error(`Got error: ${e.message}`);
    });
  })
};
