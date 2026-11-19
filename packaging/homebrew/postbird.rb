cask "postbird" do
  arch arm: "arm64", intel: "x64"

  version "0.9.2"
  sha256 arm:   "d9ff6a3ea3a4002f7e3b77363aee365e75ca8b27a4128e868ef4fa571574bbc7",
         intel: "eb1e70b36aa19ce5b55452ea1a89e24d6795b570ca35d975c7ab88ef28d034d3"

  url "https://github.com/Paxa/postbird/releases/download/v#{version}/Postbird-macos-#{arch}.dmg"
  name "Postbird"
  desc "PostgreSQL GUI client"
  homepage "https://github.com/Paxa/postbird"

  auto_updates true
  depends_on macos: :sonoma

  app "Postbird.app"

  uninstall launchctl: "application.org.paxa.postbird.*",
            quit:      "org.paxa.postbird"

  zap trash: [
    "~/Library/Application Support/org.paxa.postbird",
    "~/Library/Application Support/Postbird",
    "~/Library/Preferences/com.electron.postbird.plist",
    "~/Library/Preferences/org.paxa.postbird.plist",
    "~/Library/Saved Application State/com.electron.postbird.savedState",
    "~/Library/WebKit/org.paxa.postbird",
  ]
end
