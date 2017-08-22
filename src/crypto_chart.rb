require 'googlecharts'
require 'yaml'
require 'active_support/core_ext/date/calculations'
require 'httparty'

#https://min-api.cryptocompare.com/data/pricehistorical?fsym=ETH&tsyms=BTC,USD&ts=1452680400
def get_price(ticker, timestamp)
  HTTParty.get(
    "https://min-api.cryptocompare.com/data/pricehistorical?fsym=#{ticker}&tsyms=BTC,USD&ts=#{timestamp}"
  )
end

end_date    = Date.today
start_date  = end_date.months_ago(1)
dates_range = (start_date .. end_date)
dates_list = dates_range.to_a
timestamps  = dates_list.map { |d| d.to_time.utc.to_i }
ticker      = ARGV[0]

usd_prices = []
btc_prices = []

timestamps.map do |timestamp|
  response = get_price(ticker, timestamp)
  prices = response.parsed_response[ticker]
  usd_prices << prices.fetch("USD")
  btc_prices << prices.fetch("BTC")
end

filename = 'chart.png'

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
puts filename
