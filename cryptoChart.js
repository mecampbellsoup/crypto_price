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

var pricePromises = [];

for (var m = startDate; m.isSameOrBefore(endDate); m.add(1, 'days')) {
  mAsUnix = m.unix();
  console.log("Pushing getDayPrice for " + mAsUnix + " into pricePromises...");
  pricePromises.push(getDayPrice(ticker, mAsUnix));
};

Promise.resolve(pricePromises).then(function(data) {
  console.log("Resolving price promises...");
  console.log(data);
});

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
