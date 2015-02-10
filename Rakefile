desc "Build ~/Postbird.nw and ~/Postbird.app"

task :build do
  exec "./build_files/build.sh"
end

desc "Build ~/Postbird.dmg"

task :build_dmg do
  file_name = "Postbird-0.4rc1.dmg"
  File.delete("~/#{file_name}") if File.exist?("~/#{file_name}")

  exec %{
    ./build_files/yoursway-create-dmg/create-dmg \
      --volname "Postbird 0.4rc1" \
      --volicon "./build_files/icon.icns" \
      --icon Postbird.app 50 50 \
      --app-drop-link 300 50 \
      ~/#{file_name} \
      ~/Postbird.app
  }
end