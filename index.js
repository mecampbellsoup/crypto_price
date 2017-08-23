/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */

const yaml = require('js-yaml');
const fs = require('fs');
const https = require("https");

//////////////////////
// fetchCryptoChart //
//////////////////////
//
exports.fetchCryptoChart = function fetchCryptoChart (req, res) {
  const cryptoCompareTickersMap = yaml.load(fs.readFileSync('cc-dictionary.yml'));
  // Log request details
  if (req.body.text === undefined) {
    // This is an error case, as "text" is required
    res.status(400).send('No text defined!');
  } else {
    // Get the ticker from params
    var tickerParam = req.body.text;

    console.log("tickerParam", tickerParam);
    console.log("req.body", req.body);

    ticker = cryptoCompareTickersMap[tickerParam];

    // POST to the Sinatra app to update chart.png
    // Once finished, send the GET /chart.png URL back to
    // responseUrl.
    var request = require('request');
    const url = require('url');

    const updateChartUrl = 'https://young-sierra-83280.herokuapp.com/chart/' + ticker;
    const notifySlackUrl = req.body.response_url;
    console.log("notifySlackUrl", notifySlackUrl);

    // Respond 200 OK immediately.
    // Slack times out after 3000ms.
    console.log("Ending the initial request from Slack...");
    res.status(200).json({ text: "Fetching your " + ticker + " chart..." }).end();
    console.log("Still executing despite ending the first Slack response...");

    request.post(updateChartUrl, function (error, response, body) {
      if (error) {
        console.log("Update chart response errored: ", error);
      } else {
        var chartJson = {
          "text": "Boom!",
          "attachments": [{ "image_url": 'https://young-sierra-83280.herokuapp.com/chart.png' }]
        };

        request.post(
          notifySlackUrl, { json: chartJson }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
              console.log(body)
            }
          }
        );
      };
    });
  };
};

//////////////////////
// fetchCryptoPrice //
//////////////////////
//
exports.fetchCryptoPrice = function fetchCryptoPrice (req, res) {
  const coinMarketCapTickersMap = yaml.load(fs.readFileSync('cmc-dictionary.yml'));

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
