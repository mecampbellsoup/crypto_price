# NOTE: Necessary to us Heroku's realtime logging.
# https://devcenter.heroku.com/articles/getting-started-with-ruby-o#logging
$stdout.sync = true

require './crypto_price'
run Sinatra::Application
