task :build do
  exec "./build_files/build.sh"
end

task :build_dmg do
  file_name = "Postbird-0.3.dmg"
  File.delete("~/#{file_name}") if File.exist?("~/#{file_name}")

  exec %{
    ./build_files/yoursway-create-dmg/create-dmg \
      --volname "Postbird 0.3" \
      --volicon "./build_files/icon.icns" \
      --icon Postbird.app 50 50 \
      --app-drop-link 300 50 \
      ~/#{file_name} \
      ~/Postbird.app
  }
end