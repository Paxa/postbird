cask "postbird" do
  arch arm: "arm64", intel: "x64"

  version "0.9.1"
  sha256 arm:   "REPLACE_WITH_ARM64_SHA256",
         intel: "REPLACE_WITH_X64_SHA256"

  url "https://github.com/Paxa/postbird/releases/download/v#{version}/Postbird-macos-#{arch}.dmg"
  name "Postbird"
  desc "PostgreSQL GUI client"
  homepage "https://github.com/Paxa/postbird"

  livecheck do
    url :url
    strategy :github_latest
  end

  depends_on macos: ">= :sonoma"

  app "Postbird.app"

  zap trash: [
    "~/Library/Application Support/Postbird",
    "~/Library/Preferences/com.electron.postbird.plist",
    "~/Library/Preferences/org.paxa.postbird.plist",
    "~/Library/Saved Application State/com.electron.postbird.savedState",
    "~/Library/WebKit/org.paxa.postbird",
  ]
end
