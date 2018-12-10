desc "Build ~/Postbird.nw and ~/Postbird.app"

task :build do
  exec "./build_files/build.sh"
end

desc "Build ~/Postbird.dmg"

task :build_dmg do
  require 'json'
  version = JSON.parse(File.read('package.json'))['version']
  puts "Creating Postbird #{version}..."

  file_name = "Postbird-#{version}.dmg"
  File.delete("~/#{file_name}") if File.exist?("~/#{file_name}")

  exec %{
    ./build_files/yoursway-create-dmg/create-dmg \
      --volname "Postbird #{version}" \
      --volicon "./build_files/icon.icns" \
      --icon Postbird.app 50 50 \
      --app-drop-link 300 50 \
      ~/#{file_name} \
      ~/Postbird_release/Postbird-darwin-x64/Postbird.app
  }
end

task :build_dev do
  source = ENV['PWD']
  target = "~/Postbird.app"

  # rm -f #{target}/Contents/Resources/icon.icns
  # ln -s #{source}/build_files/icon.icns     #{target}/Contents/Resources

  puts %x{
    rm -rf #{target}/Contents/Resources/app.nw
    rm -f #{target}/Contents/Resources/Credits.html
    rm -f #{target}/Contents/info.plist
    rm -f #{target}/Contents/Resources/icon.icns

    ln -s #{source}                           #{target}/Contents/Resources/app.nw
    ln -s #{source}/build_files/Credits.html  #{target}/Contents/Resources
    ln -s #{source}/build_files/info.plist    #{target}/Contents
    ln -s #{source}/build_files/icon.icns     #{target}/Contents/Resources
  }
  puts "Complete"
end


desc "Build and install"
task :build_install do
  system "rm -rf /Users/pavel/Postbird_release"
  system "node packager.js"
  system "rm -rf /Applications/Postbird.app"
  system "mv /Users/pavel/Postbird_release/Postbird-darwin-x64/Postbird.app /Applications/"
end