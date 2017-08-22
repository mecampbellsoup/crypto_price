/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */

const yaml = require('js-yaml');
const fs = require('fs');
const tickersMap = yaml.load(fs.readFileSync('dictionary.yml'));
const moment = require('moment');
const https = require("https");

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
          resolve([timestamp, { btc: btcPrice, usd: usdPrice }]);
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

//////////////////////
// fetchCryptoChart //
//////////////////////
//
exports.fetchCryptoChart = function fetchCryptoChart (req, res) {
  // Log request details
  if (req.body.text === undefined) {
    // This is an error case, as "text" is required
    res.status(400).send('No text defined!');
  } else {
    var endDate = moment();
    var startDate = moment().subtract(1, 'months');

    var startDateUnix = startDate.unix();
    var endDateUnix = endDate.unix();

    // Fetch the price from that ticker
    ticker = 'ETH';

    var pricePromises = [];

    for (var m = startDate; m.isSameOrBefore(endDate); m.add(1, 'days')) {
      mAsUnix = m.unix();
      console.log("Pushing getDayPrice for " + mAsUnix + " into pricePromises...");
      pricePromises.push(getDayPrice(ticker, mAsUnix));
    };

    Promise.all(pricePromises).then(function(data) {
      var timestamps = [];
      var btcPrices = [];
      var usdPrices = [];

      data.forEach(function(datumWithTimestamp) {
        timestamps.push(datumWithTimestamp[0]);
        btcPrices.push(datumWithTimestamp[1].btc);
        usdPrices.push(datumWithTimestamp[1].usd);
      });

      var exec = require("child_process").exec;
      var result = exec('ruby src/crypto_chart.rb '+ ticker, function (err, stdout, stderr) {
        // crypto_chart.rb will write the image file to disk
        // read it from the filesystem and serve it with the chartJson response
      });

      var chartJson = {
        "text": result,
        "attachments": [
          {
            "image_url": "http://bitcoinmacroeconomics.com/wp-content/uploads/2014/11/doge1115.png"
          }
        ]
      };
      console.log("Here is the chartJson: ", chartJson);
      res.status(200).json(chartJson);
    });
  };
};

//////////////////////
// fetchCryptoPrice //
//////////////////////
//
exports.fetchCryptoPrice = function fetchCryptoPrice (req, res) {
  // Log request details
  if (req.body.text === undefined) {
    // This is an error case, as "text" is required
    res.status(400).send('No text defined!');
  } else {
    // Get the ticker from params
    var tickerParam = req.body.text;
    ticker = tickersMap[tickerParam];

    // Fetch the price from that ticker
    var https = require("https");

    const options = {
      hostname: 'api.coinmarketcap.com',
      port: 443,
      path: '/v1/ticker/' + ticker + '/',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    var rawData = '';

    https.get(options, (priceResponse) => {
      priceResponse.on('data', (d) => {
        rawData += d;
      });

      priceResponse.on('end', () => {
        try {
          console.log('Raw data:', rawData);
          console.log('Parsed JSON:', JSON.parse(rawData));

          btcPrice = JSON.parse(rawData)[0].price_btc;
          usdPrice = JSON.parse(rawData)[0].price_usd;

          var prices = "The price of " + ticker + " in USD is: $" + usdPrice + ".\n" + "The price of " + ticker + " in BTC is: " + btcPrice + "."
          console.log('Human readable prices: ', prices);

          res.status(200).send(prices);
        } catch (e) {
          console.error(`Got error: ${e.message}`);
        }
      });
    }).on('error', (e) => {
      console.error(`Got error: ${e.message}`);
    });
  }
};
