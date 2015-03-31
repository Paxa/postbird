module CapybaraHelper
  def reload_page
    evaluate_script(%{require("nw.gui").Window.get().reloadDev()})
  end

  def set_async_timeout(value = 5000)
    page.driver.browser.send(:bridge).setScriptTimeout(value)
  end

  def take_screenshot(file)
    puts "Running script"
    file_abs_path = File.join(Dir.pwd, file)
    js_code = '
      var done = arguments[0];
      require("nw.gui").Window.get().capturePage(function(img) {
        var base64Data = img.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
        require("fs").writeFile("%s", base64Data, "base64", function(err) {
          done(err);
        });
      }, "png");
    ' % file_abs_path

    puts js_code
    page.driver.browser.execute_async_script(js_code.strip)
    puts "Done script"
    #save_screenshot(file)
  end
end