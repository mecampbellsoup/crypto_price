require 'sinatra'
require 'sinatra/json'
require 'sinatra/reloader' if development?
require 'pry' if development?
require 'httparty'
require 'googlecharts'
require 'yaml'
require 'active_support/core_ext/date/calculations'

#https://min-api.cryptocompare.com/data/pricehistorical?fsym=ETH&tsyms=BTC,USD&ts=1452680400
def get_price(ticker, timestamp)
  HTTParty.get(
    "https://min-api.cryptocompare.com/data/pricehistorical?fsym=#{ticker}&tsyms=BTC,USD&ts=#{timestamp}"
  )
end

class CryptoPrice < Sinatra::Base
  CRYPTO_DICTIONARY = YAML.load_file('cmc-dictionary.yml')

  # Any GET request to the root endpoint will serve chart.png from public dir
  get '/*.*' do
    send_file('public/chart.png')
  end

  post '/chart/:ticker' do |ticker|
    end_date    = Date.today
    start_date  = end_date.months_ago(1)
    dates_range = (start_date .. end_date)
    dates_list  = dates_range.to_a
    timestamps  = dates_list.map { |d| d.to_time.utc.to_i }

    usd_prices = []
    btc_prices = []

    timestamps.map do |timestamp|
      response = get_price(ticker, timestamp)
      prices = response.parsed_response[ticker]
      usd_prices << prices.fetch("USD")
      btc_prices << prices.fetch("BTC")
    end

    # Chart file to be written to public/chart.png
    filename = 'public/chart.png'

    # NOTE: Only charting USD prices for now.
    chart = Gchart.new(
      type:     :line,
      theme:    :thirty7signals,
      title:    "#{ticker} 1m price history",
      data:     [usd_prices],
      filename: filename,
      axis_with_labels: [['x'], ['y']],
      axis_labels: [dates_list.join("|")]
    )
    chart.file
    200
  end

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
