require "capybara"
require "selenium-webdriver"
require "rspec"
require "looksee"

require "capybara_helper"

class Selenium::WebDriver::Chrome::Bridge < Selenium::WebDriver::Remote::Bridge
  alias_method :orig_create_capabilities, :create_capabilities

  def create_capabilities(opts)
    binary = opts.delete(:binary)
    caps = orig_create_capabilities(opts)
    caps['chromeOptions']['binary'] = binary if binary

    caps
  end
end

ENV["PATH"] = "/Users/pavel/Downloads/chromedriver:" + ENV["PATH"]

Capybara.register_driver :chrome do |app|
  Capybara::Selenium::Driver.new(app,
    browser: :chrome,
    binary: "/Users/pavel/Postbird.app/Contents/MacOS/nwjs",
    detach: false
  )
end

Capybara.javascript_driver = :chrome

Capybara.configure do |config|
  config.current_driver = :chrome
  config.run_server = false
  #config.app_host   = 'http://en.wikipedia.org'
end


RSpec.configure do |config|
  #config.use_transactional_fixtures = false
  config.mock_with :rspec

  config.expect_with :rspec do |c|
    c.syntax = [:should, :expect]
  end

  config.mock_with :rspec do |c|
    c.syntax = [:should, :expect]
  end

  config.include Capybara::DSL
  config.include CapybaraHelper
end

# https://code.google.com/p/selenium/wiki/JsonWireProtocol