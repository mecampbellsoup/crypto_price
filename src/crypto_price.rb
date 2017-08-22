require 'sinatra'
require 'sinatra/json'
require 'sinatra/reloader' if development?
require 'pry' if development?
require 'httparty'

class CryptoPrice < Sinatra::Base
  CRYPTO_DICTIONARY = {
    # BTC
    bitcoin: 'bitcoin',
    btc:     'bitcoin',
    xbt:     'bitcoin',

    # BCC
    'bitcoin-cash': 'bitcoin-cash',
    bcc:            'bitcoin-cash',
    bch:            'bitcoin-cash',

    # alts
    ethereum: 'ethereum',
    eth:      'ethereum',
    dash:     'dash',
    monero:   'monero',
    xmr:      'monero'
  }.freeze

  post '/crypto-prices' do
    log(ticker)

    # Enforce JSON Accept header from clients
    pass unless request.accept?('application/json')

    if ticker
      btc_price = JSON.parse(currency.body)[0].fetch('price_btc')
      usd_price = JSON.parse(currency.body)[0].fetch('price_usd')
      timestamp = Time.now.iso8601

      human_readable_price_with_timestamp =
        "As of #{timestamp},\n" \
        "The price of #{ticker} in USD is: #{usd_price}.\n" \
        "The price of #{ticker} in BTC is: #{btc_price}."

      [ 200, {}, human_readable_price_with_timestamp ]
    else
      [ 404, {}, not_found_response_body(ticker) ]
    end
  end

  private

  def ticker
    CRYPTO_DICTIONARY.fetch(raw_ticker.to_sym, nil)
  end

  def raw_ticker
    @raw_ticker ||= params.fetch(:text)
  end

  def params
    if @params.empty?
      begin
        # If params empty, read the request body.
        # Otherwise use the present params.
        @params = super.empty? ? Sinatra::IndifferentHash[JSON(request.body.read)] : super
      end
    else
      @params
    end
  end

  def log(contents)
    # NOTE: our 'logger' is just writing to STDOUT
    puts contents
  end

  def currency
    HTTParty.get("https://api.coinmarketcap.com/v1/ticker/#{ticker}")
  end

  def cryptocurrencies(tickers_only: false)
    @cryptocurrencies ||= JSON(all_currencies.body).sort_by { |hash| hash["rank"].to_i }

    if tickers_only
      @cryptocurrencies.map { |fx| fx['id'] }
    else
      @cryptocurrencies
    end
  end

  def all_currencies
    @all_currencies ||= HTTParty.get("https://api.coinmarketcap.com/v1/ticker")
  end

  def not_found_response_body(ticker)
    "#{ticker} not a valid cryptocurrency option. Try one of these instead:\n" \
      "#{cryptocurrencies(tickers_only: true)[0, 20].join("\n")}."
  end
end
