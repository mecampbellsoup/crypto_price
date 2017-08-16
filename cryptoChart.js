// Deps
var yaml = require('js-yaml');
var fs = require('fs');
var moment = require('moment');

var endDate = moment();
var startDate = moment().subtract(1, 'months');

var startDateUnix = startDate.unix();
var endDateUnix = endDate.unix();

console.log("Start date:", startDate);
console.log("End date:", endDate);
console.log("Start date UNIX:", startDateUnix);
console.log("End date UNIX:", endDateUnix);

// Fetch the price from that ticker
var https = require("https");
ticker = 'ETH';
var historicalData = {};

for (var m = startDate; m.isBefore(endDate); m.add(1, 'days')) {
  mAsUnix = m.unix();
  prices = getDayPrice(ticker, mAsUnix);
  console.log(prices);
  historicalData[mAsUnix] = prices;
};

//https://min-api.cryptocompare.com/data/pricehistorical?fsym=ETH&tsyms=BTC,USD&ts=1452680400
function getDayPrice(ticker, timestamp) {
  var rawData = '';

  const options = {
    hostname: 'min-api.cryptocompare.com',
    port: 443,
    path: '/data/pricehistorical?fsym=' + ticker + '&tsyms=BTC,USD&ts=' + timestamp,
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  };

  https.get(options, (priceResponse) => {
    priceResponse.on('data', (d) => { rawData += d; });
    priceResponse.on('end', () => {
      try {
        parsedJson = JSON.parse(rawData)[ticker];
        btcPrice = parsedJson['BTC'];
        usdPrice = parsedJson['USD'];
        return([btcPrice, usdPrice]);
      } catch (e) {
        console.error(`Got error: ${e.message}`);
      }
    });
  }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
  });
};
