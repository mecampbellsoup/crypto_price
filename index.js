/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */

const tickersMap = {
  // BTC
  bitcoin: 'bitcoin',
  btc:     'bitcoin',
  xbt:     'bitcoin',

  // BCC
  'bitcoin-cash': 'bitcoin-cash',
  bcc:            'bitcoin-cash',
  bch:            'bitcoin-cash',

  // altcoins
  ethereum: 'ethereum',
  eth:      'ethereum',
  dash:     'dash',
  dsh:      'dash',
  monero:   'monero',
  xmr:      'monero'
};

exports.fetchPrice = function fetchPrice (req, res) {
  // Log request details
  console.log(req);
  console.log(req.body);

  if (req.body.text === undefined) {
    // This is an error case, as "text" is required
    res.status(400).send('No text defined!');
  } else {
    // Get the ticker from params
    var ticker = req.body.text;
    console.log(ticker);

    // Fetch the price from that ticker
    var https = require("https");
    var currency;

    const https = require('https');
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

    https.get(options, (res) => {
      console.log('statusCode:', res.statusCode);
      console.log('headers:', res.headers);

      res.on('data', (d) => {
        currency += d;
        console.log(currency);
      });
    });

    console.log(currency);
    console.log(JSON.parse(currency));

    btcPrice = JSON.parse(currency)[0].price_btc);
    usdPrice = JSON.parse(currency)[0].price_usd);

    human_readable_price_with_timestamp =
      "The price of " + ticker + " in USD is:" + usdPrice + ".\n" +
      "The price of " + ticker + " in BTC is:" + btcPrice + "."

    res.status(200).send(humanReadablePrice);
  }
};
