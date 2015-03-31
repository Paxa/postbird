require "test_helper"

describe "show login form" do
  before do
    #reload_page
    set_async_timeout
  end

  it "should something" do
    #puts page.title
    page.title.should == "Postbird"
    #p page.driver.browser.send(:bridge).ls
    #sleep 1000
    p :take_screenshot
    take_screenshot("1.png")
  end
end

