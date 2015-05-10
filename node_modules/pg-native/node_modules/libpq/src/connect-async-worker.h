#ifndef NODE_LIBPQ_CONNECT_ASYNC_WORKER
#define NODE_LIBPQ_CONNECT_ASYNC_WORKER

#include "addon.h"

class ConnectAsyncWorker : public NanAsyncWorker {
public:
  ConnectAsyncWorker(char* paramString, Connection* conn, NanCallback* callback);
  ~ConnectAsyncWorker();
  void Execute();

private:
  Connection* conn;
  char* paramString;
};

#endif
