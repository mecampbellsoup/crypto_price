/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */

const yaml = require('js-yaml');
const fs = require('fs');
const coinMarketCapTickersMap = yaml.load(fs.readFileSync('cmc-dictionary.yml'));
const cryptoCompareTickersMap = yaml.load(fs.readFileSync('cc-dictionary.yml'));
const moment = require('moment');
const https = require("https");

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
    // Get the ticker from params
    var tickerParam = req.body.text;
    ticker = cryptoCompareTickersMap[tickerParam];

    Promise.resolve(exec('ruby src/crypto_chart.rb ' + ticker, function (err, stdout, stderr) {
      console.log('stdout:', stdout);

      var chartJson = {
        "text": ,
        "attachments": [
          {
            "image_url": 'chart.png'
          }
        ]
      };
      res.status(200).json(chartJson);
    }));
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
    ticker = coinMarketCapTickersMap[tickerParam];

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
