#!/bin/bash

echo "This script requires node-webkit.app in your applications folder"

TARGET_DIR="${HOME}/postbird.app"
APP_TARGET_DIR="${TARGET_DIR}/Contents/Resources/app.nw"
echo $TARGET_DIR


if [ -e "$TARGET_DIR" ]; then
  echo "Removing existing build"
  rm -rf $TARGET_DIR
fi

if [ -e "$HOME/postbird.nw" ]; then
  echo "Removing existing nw build"
  rm -rf $HOME/postbird.nw
fi

#read -p "Is node-webkit.app in your applications folder (y/n)? " -n 1 -r
#if [[ $REPLY =~ ^[Yy]$ ]]
#then
    # node-webkit exists continue build
    cp -r /Applications/node-webkit.app ${TARGET_DIR}

    # create app.nw and move to correct location
    git checkout-index -a --prefix="${APP_TARGET_DIR}/"
    #cp -r . ~/postbird.app/Contents/Resources/app.nw

    rm ${APP_TARGET_DIR}/build.sh
    rm ${APP_TARGET_DIR}/run
    rm ${APP_TARGET_DIR}/run_tests
    rm ${APP_TARGET_DIR}/icon.icns
    rm ${APP_TARGET_DIR}/icon.png
    rm ${APP_TARGET_DIR}/info.plist
    rm -rf ${APP_TARGET_DIR}/node_modules/fibers
    rm -rf ${APP_TARGET_DIR}/tests
    rm -rf ${APP_TARGET_DIR}/notifier.app

    # copy icon and plist file
    cp ./icon.icns ${TARGET_DIR}/Contents/Resources
    cp ./info.plist ${TARGET_DIR}/Contents

    cp ./icon.icns ${TARGET_DIR}/Contents/Resources

    # mv postbird.app ../../bin/

    echo -e "\npostbird.app copied to home directory"
    tmp_dir=`pwd`
    cd ${APP_TARGET_DIR}
    zip -r -q ~/postbird.nw *
    cd $tmp_dir
#else
#  echo -e "\nPlease place node-webkit.app in your applications folder and run the script again"
#fi