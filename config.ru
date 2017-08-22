# NOTE: Necessary to us Heroku's realtime logging.
# https://devcenter.heroku.com/articles/getting-started-with-ruby-o#logging
$stdout.sync = true
$stderr.sync = true

require './src/crypto_price'
run CryptoPrice
