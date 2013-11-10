#!/bin/bash

echo "This script requires node-webkit.app in your applications folder"

#read -p "Is node-webkit.app in your applications folder (y/n)? " -n 1 -r
#if [[ $REPLY =~ ^[Yy]$ ]]
#then
    # node-webkit exists continue build
    cp -r /Applications/node-webkit.app ~/postbird.app

    # create app.nw and move to correct location
    cp -r . ~/postbird.app/Contents/Resources/app.nw

    # copy icon and plist file
    cp ./gisto.icns ~/postbird.app/Contents/Resources
    cp ./info.plist ~/postbird.app/Contents

    # mv gisto.app ../../bin/

    echo -e "\ngisto.app copied to home directory"
#else
#  echo -e "\nPlease place node-webkit.app in your applications folder and run the script again"
#fi