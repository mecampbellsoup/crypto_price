# Crypto Price Fetcher


## `fetchCryptoPrice`

Defined in `index.js`, the `fetchCryptoPrice` function is a [Google Cloud Function](https://cloud.google.com/functions/), i.e. an ephemeral HTTP endpoint, which accepts an HTTP request containing the cryptocurrency ticker whose price (in USD and BTC both) will be fetched and returned to the Slack [slash command response URL](https://api.slack.com/slash-commands#responding_to_a_command).

The first request from the Slack slash command is responded to immediately. The prices are then fetched from the [CoinMarketCap API](https://coinmarketcap.com/api/) asynchronously and sent back to the Slack user, at which point the update prices are displayed in the user's Slack channel.

## Usage

#### 1. Request updated prices for *[ticker]*

![](https://user-images.githubusercontent.com/2043821/29779156-b5caa5e4-8bdf-11e7-908e-dd48d5a16979.png)

#### 2. Wait a bit...

![](https://user-images.githubusercontent.com/2043821/29779253-fb959fca-8bdf-11e7-985f-8e1b3275dd81.png)

#### 3. *Voila!*

![](https://user-images.githubusercontent.com/2043821/29779297-213faa40-8be0-11e7-9c6d-91b51f45b19b.png)

## Supported tickers

See the [dictionary](https://github.com/mecampbellsoup/crypto_price/blob/master/cmc-dictionary.yml). Please submit a [pull request](https://github.com/mecampbellsoup/crypto_price/pulls) to add tickers that you would like to use to this list.

## `fetchCryptoChart`

> STATUS: **In progress/not finished.**

In addition to the `/price btc` Slack slach command, I'd like to have a `/chart btc` command which responds to the user with an image of the recent (1 month) price history chart for the requested ticker.