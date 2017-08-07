require 'sinatra'
require 'sinatra/json'
require 'sinatra/reloader' if development?
require 'httparty'

def all_cryptocurrencies(tickers_only: false)
  # TODO: fetch all available and sort by rank.
  # Only return the top 20 by market cap.
  #
  all_currencies = HTTParty.get("https://api.coinmarketcap.com/v1/ticker")
  sorted = JSON(all_currencies.body).sort_by { |hash| hash["rank"].to_i }
  tickers_only ? sorted.map { |fx| fx['id'] } : sorted
end

def not_found_response_body(ticker)
  "#{ticker} not a valid cryptocurrency option. Try one of these instead:\n" \
    "#{all_cryptocurrencies(tickers_only: true)[0, 20].join("\n")}."
end

post '/crypto-prices' do
  ticker = params[:text].strip

  if all_cryptocurrencies(tickers_only: true).include?(ticker)

    # Perform HTTPS request to CoinMarketCap API
    # Handle the case where ticker symbol does not correspond to a listed currency in the API.
    price_response =  HTTParty.get("https://api.coinmarketcap.com/v1/ticker/#{ticker}")

    btc_price = JSON.parse(price_response.body)[0].fetch('price_btc')
    usd_price = JSON.parse(price_response.body)[0].fetch('price_usd')

    # TODO: make the Slack identifiers environment variables instead of hardcoded.
    webhook_response = HTTParty.post("https://hooks.slack.com/services/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", {
      body: { text: [ btc_price, usd_price ] }.to_json,
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
    })

    human_readable_price =
      "The price of #{ticker} in USD is: #{usd_price}.\n" \
      "The price of #{ticker} in BTC is: #{btc_price}."

    [ webhook_response.code, {}, human_readable_price ]
  else
    [ 404, {}, not_found_response_body(ticker) ]
  end
end
