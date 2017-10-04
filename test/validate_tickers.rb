#!/usr/bin/env ruby

# This Ruby script should be run automatically as a build task.
# This build task should apply to pull requests and deployments to Google Cloud Compute (GCC).
# If this script returns a non-zero exit code, nothing should be deployed to GCC.

require 'yaml'
dictionary_path = File.expand_path("../../cmc-dictionary.yml", __FILE__)
dictionary = YAML.load_file(dictionary_path)
tickers = dictionary.values.uniq.sort

require 'httparty'
tickers.each do |ticker|
  puts "Checking ticker symbol #{ticker} is valid in the API..."
  response = HTTParty.get("https://api.coinmarketcap.com/v1/ticker/#{ticker}")
  if !response.ok?
    puts "#{ticker} not a valid cryptocurrency ticker symbol - please check the dictionary."
    exit 1
  end
end

puts "All ticker symbols valid!"
