require 'sinatra'
require 'sinatra/json'
require 'httparty'

post '/crypto-prices/:ticker' do |t|
  # Perform HTTPS request to CoinMarketCap API
  # Handle the case where ticker symbol does not correspond to a listed currency in the API.

  # NOTE: coinmarketcap dasherizes all the ticker symbols
  ticker = t.tr("_", "-")
  price_response =  HTTParty.get("https://api.coinmarketcap.com/v1/ticker/#{ticker}")
  price = JSON.parse(price_response.body)[0]["price_btc"]

  webhook_response = HTTParty.post("https://hooks.slack.com/services/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", {
    body: { text: price }.to_json,
    headers: { 'Content-Type' => 'application/json', 'Accept' => 'application/json' }
  })

  [ webhook_response.code, {}, webhook_response.body ]
end
