//helper class to perform async connection
#include "addon.h"

ConnectAsyncWorker::ConnectAsyncWorker(char* paramString, Connection* conn, NanCallback* callback)
  : NanAsyncWorker(callback), conn(conn), paramString(paramString) { }

  ConnectAsyncWorker::~ConnectAsyncWorker() {}

  //this method fires within the threadpool and does not
  //block the main node run loop
  void ConnectAsyncWorker::Execute() {
    TRACE("ConnectAsyncWorker::Execute");

    bool success = conn->ConnectDB(paramString);

    if(!success) {
      SetErrorMessage(conn->ErrorMessage());
    }
  }
