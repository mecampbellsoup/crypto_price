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