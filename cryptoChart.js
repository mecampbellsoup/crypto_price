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
  getDayPrice(ticker, mAsUnix);
};

// At this point all historical data should be set in historicalData...
// But it isn't because this line is reached before the async https.get
// calls inside of getDayPrice have not finished yet.
// What to do?
console.log("Historical data: ", historicalData);

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

  return https.get(options, (priceResponse) => {
    priceResponse.on('data', (d) => { rawData += d; });
    priceResponse.on('end', () => {
      try {
        parsedJson = JSON.parse(rawData)[ticker];
        btcPrice = parsedJson['BTC'];
        usdPrice = parsedJson['USD'];
        historicalData[timestamp] = {};
        historicalData[timestamp].btc = btcPrice;
        historicalData[timestamp].usd = usdPrice;
      } catch (e) {
        console.error(`Got error: ${e.message}`);
      }
    });
  }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
  });
};
