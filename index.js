/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */

const yaml = require('js-yaml');
const fs = require('fs');
const request = require('request');

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
      console.log("Updating the chart...");

      if (error) {
        console.log("Update chart response errored: ", error);
      } else {
        console.log("Chart updated!");
        var readChartUrl = 'https://young-sierra-83280.herokuapp.com/chart.png';
        var chartJson = {
          "text": readChartUrl,
          "attachments": [{ "image_url": readChartUrl }],
          "unfurl_media": true,
          "unfurl_links": true
        };

        request.post(notifySlackUrl, { json: chartJson }, function (error, response, body) {
            console.log("Notifying Slack...");
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
    // This is an error case, as "text" is required.
    // Respond w/ 200 status so the message below is displayed to the user.
    res.status(200).send('No text defined!');
  } else {
    // Get the ticker from params
    var tickerParam = req.body.text;
    ticker = coinMarketCapTickersMap[tickerParam];

    // Fetch the price from that ticker
    const cryptoPriceUrl = 'https://api.coinmarketcap.com/v1/ticker/' + ticker + '/'
    const notifySlackUrl = req.body.response_url;
    console.log("notifySlackUrl", notifySlackUrl);

    // Respond 200 OK immediately.
    // Slack times out after 3000ms.
    console.log("Ending the initial request from Slack...");
    res.status(200).json({ text: "Fetching the freshest " + ticker + " price..." }).end();
    console.log("Still executing despite ending the first Slack response...");

    request(cryptoPriceUrl, function (error, response, body) {
      var parsedJson = JSON.parse(body);
      console.log("parsedJson", parsedJson);
      btcPrice = parsedJson[0].price_btc;
      usdPrice = parsedJson[0].price_usd;

      var prices = "The price of " + ticker + " in USD is: $" + usdPrice + ".\n" + "The price of " + ticker + " in BTC is: " + btcPrice + "."
      var priceJson = { "text": prices };
      console.log('Human readable prices: ', prices);

      if (error) {
        console.log("Update price response errored: ", error);
      } else {
        request.post(notifySlackUrl, { json: priceJson }, function (error, response, body) {
          console.log("Notifying Slack...");
          if (!error && response.statusCode == 200) {
            console.log(body)
          }
        });
      };
    });
  }
};
