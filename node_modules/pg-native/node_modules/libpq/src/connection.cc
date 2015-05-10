#include "addon.h"

Connection::Connection() : ObjectWrap() {
  TRACE("Connection::Constructor");
  pq = NULL;
  lastResult = NULL;
  read_watcher.data = this;
  write_watcher.data = this;
  is_reading = false;
  is_reffed = false;
}

NAN_METHOD(Connection::Create) {
  NanScope();

  TRACE("Building new instance");
  Connection* conn = new Connection();
  conn->Wrap(args.This());

  NanReturnValue(args.This());
}

NAN_METHOD(Connection::ConnectSync) {
  NanScope();
  TRACE("Connection::ConnectSync::begin");

  Connection *self = ObjectWrap::Unwrap<Connection>(args.This());

  char* paramString = NewCString(args[0]);

  self->Ref();
  self->is_reffed = true;
  bool success = self->ConnectDB(paramString);

  delete[] paramString;

  NanReturnValue(success ? NanTrue() : NanFalse());
}

NAN_METHOD(Connection::Connect) {
  NanScope();
  TRACE("Connection::Connect");

  char* paramString = NewCString(args[0]);
  TRACEF("Connection parameters: %s\n", paramString);

  Connection* self = THIS();

  v8::Local<v8::Function> callback = args[1].As<v8::Function>();
  LOG("About to make callback");
  NanCallback* nanCallback = new NanCallback(callback);
  LOG("About to instantiate worker");
  ConnectAsyncWorker* worker = new ConnectAsyncWorker(paramString, self, nanCallback);
  LOG("Instantiated worker, running it...");
  self->Ref();
  self->is_reffed = true;
  NanAsyncQueueWorker(worker);

  NanReturnUndefined();
}

NAN_METHOD(Connection::Socket) {
  NanScope();
  TRACE("Connection::Socket");

  Connection *self = THIS();
  int fd = PQsocket(self->pq);
  TRACEF("Connection::Socket::fd: %d\n", fd);

  NanReturnValue(NanNew<v8::Number>(fd));
}

NAN_METHOD(Connection::GetLastErrorMessage) {
  NanScope();

  Connection *self = THIS();
  char* errorMessage = PQerrorMessage(self->pq);

  NanReturnValue(NanNew(errorMessage));
}

NAN_METHOD(Connection::Finish) {
  NanScope();
  TRACE("Connection::Finish::finish");

  Connection *self = THIS();

  self->ReadStop();
  self->ClearLastResult();
  PQfinish(self->pq);
  self->pq = NULL;
  if(self->is_reffed) {
    self->is_reffed = false;
    //self->Unref();
  }

  NanReturnUndefined();
}

NAN_METHOD(Connection::Exec) {
  NanScope();

  Connection *self = THIS();
  char* commandText = NewCString(args[0]);

  TRACEF("Connection::Exec: %s\n", commandText);
  PGresult* result = PQexec(self->pq, commandText);

  delete[] commandText;

  self->SetLastResult(result);

  NanReturnUndefined();
}

NAN_METHOD(Connection::ExecParams) {
  NanScope();

  Connection *self = THIS();

  char* commandText = NewCString(args[0]);
  TRACEF("Connection::Exec: %s\n", commandText);

  v8::Local<v8::Array> jsParams = v8::Local<v8::Array>::Cast(args[1]);

  int numberOfParams = jsParams->Length();
  char** parameters = NewCStringArray(jsParams);

  PGresult* result = PQexecParams(
      self->pq,
      commandText,
      numberOfParams,
      NULL, //const Oid* paramTypes[],
      parameters, //const char* const* paramValues[]
      NULL, //const int* paramLengths[]
      NULL, //const int* paramFormats[],
      0 //result format of text
      );

  delete [] commandText;
  DeleteCStringArray(parameters, numberOfParams);

  self->SetLastResult(result);

  NanReturnUndefined();
}

NAN_METHOD(Connection::Prepare) {
  NanScope();

  Connection *self = THIS();

  char* statementName = NewCString(args[0]);
  char* commandText = NewCString(args[1]);
  int numberOfParams = args[2]->Int32Value();

  TRACEF("Connection::Prepare: %s\n", statementName);

  PGresult* result = PQprepare(
      self->pq,
      statementName,
      commandText,
      numberOfParams,
      NULL //const Oid* paramTypes[]
      );

  delete [] statementName;
  delete [] commandText;

  self->SetLastResult(result);

  NanReturnUndefined();
}

NAN_METHOD(Connection::ExecPrepared) {
  NanScope();

  Connection *self = THIS();

  char* statementName = NewCString(args[0]);

  TRACEF("Connection::ExecPrepared: %s\n", statementName);

  v8::Local<v8::Array> jsParams = v8::Local<v8::Array>::Cast(args[1]);

  int numberOfParams = jsParams->Length();
  char** parameters = NewCStringArray(jsParams);

  PGresult* result = PQexecPrepared(
      self->pq,
      statementName,
      numberOfParams,
      parameters, //const char* const* paramValues[]
      NULL, //const int* paramLengths[]
      NULL, //const int* paramFormats[],
      0 //result format of text
      );

  delete [] statementName;
  DeleteCStringArray(parameters, numberOfParams);

  self->SetLastResult(result);

  NanReturnUndefined();
}


NAN_METHOD(Connection::Clear) {
  NanScope();

  TRACE("Connection::Clear");
  Connection *self = THIS();

  self->ClearLastResult();

  NanReturnUndefined();
}

NAN_METHOD(Connection::Ntuples) {
  NanScope();

  TRACE("Connection::Ntuples");
  Connection *self = THIS();
  PGresult* res = self->lastResult;
  int numTuples = PQntuples(res);

  NanReturnValue(NanNew<v8::Number>(numTuples));
}

NAN_METHOD(Connection::Nfields) {
  NanScope();

  TRACE("Connection::Nfields");
  Connection *self = THIS();
  PGresult* res = self->lastResult;
  int numFields = PQnfields(res);

  NanReturnValue(NanNew<v8::Number>(numFields));
}

NAN_METHOD(Connection::Fname) {
  NanScope();

  TRACE("Connection::Fname");
  Connection *self = THIS();

  PGresult* res = self->lastResult;

  char* colName = PQfname(res, args[0]->Int32Value());

  if(colName == NULL) {
    NanReturnNull();
  }

  NanReturnValue(NanNew<v8::String>(colName));
}

NAN_METHOD(Connection::Ftype) {
  NanScope();

  TRACE("Connection::Ftype");
  Connection *self = THIS();

  PGresult* res = self->lastResult;

  int colName = PQftype(res, args[0]->Int32Value());

  NanReturnValue(NanNew<v8::Number>(colName));
}

NAN_METHOD(Connection::Getvalue) {
  NanScope();

  TRACE("Connection::Getvalue");
  Connection *self = THIS();

  PGresult* res = self->lastResult;

  int rowNumber = args[0]->Int32Value();
  int colNumber = args[1]->Int32Value();

  char* rowValue = PQgetvalue(res, rowNumber, colNumber);

  if(rowValue == NULL) {
    NanReturnNull();
  }

  NanReturnValue(NanNew<v8::String>(rowValue));
}

NAN_METHOD(Connection::Getisnull) {
  NanScope();

  TRACE("Connection::Getisnull");
  Connection *self = THIS();

  PGresult* res = self->lastResult;

  int rowNumber = args[0]->Int32Value();
  int colNumber = args[1]->Int32Value();

  int rowValue = PQgetisnull(res, rowNumber, colNumber);

  NanReturnValue(NanNew<v8::Boolean>(rowValue == 1));
}

NAN_METHOD(Connection::CmdStatus) {
  NanScope();

  TRACE("Connection::CmdStatus");
  Connection *self = THIS();

  PGresult* res = self->lastResult;
  char* status = PQcmdStatus(res);

  NanReturnValue(NanNew<v8::String>(status));
}

NAN_METHOD(Connection::CmdTuples) {
  NanScope();

  TRACE("Connection::CmdTuples");
  Connection *self = THIS();

  PGresult* res = self->lastResult;
  char* tuples = PQcmdTuples(res);

  NanReturnValue(NanNew<v8::String>(tuples));
}

NAN_METHOD(Connection::ResultStatus) {
  NanScope();

  TRACE("Connection::ResultStatus");
  Connection *self = THIS();

  PGresult* res = self->lastResult;

  char* status = PQresStatus(PQresultStatus(res));

  NanReturnValue(NanNew<v8::String>(status));
}

NAN_METHOD(Connection::ResultErrorMessage) {
  NanScope();

  TRACE("Connection::ResultErrorMessage");
  Connection *self = THIS();

  PGresult* res = self->lastResult;

  char* status = PQresultErrorMessage(res);

  NanReturnValue(NanNew<v8::String>(status));
}

# define SET_E(key, name) \
  field = PQresultErrorField(self->lastResult, key); \
  if(field != NULL) { \
    result->Set(NanNew(name), NanNew(field)); \
  }

NAN_METHOD(Connection::ResultErrorFields) {
  NanScope();

  Connection *self = THIS();

  if(self->lastResult == NULL) {
    NanReturnNull();
  }

  v8::Local<v8::Object> result = NanNew<v8::Object>();
  char* field;
  SET_E(PG_DIAG_SEVERITY, "severity");
  SET_E(PG_DIAG_SQLSTATE, "sqlState");
  SET_E(PG_DIAG_MESSAGE_PRIMARY, "messagePrimary");
  SET_E(PG_DIAG_MESSAGE_DETAIL, "messageDetail");
  SET_E(PG_DIAG_MESSAGE_HINT, "messageHint");
  SET_E(PG_DIAG_STATEMENT_POSITION, "statementPosition");
  SET_E(PG_DIAG_INTERNAL_POSITION, "internalPosition");
  SET_E(PG_DIAG_INTERNAL_QUERY, "internalQuery");
  SET_E(PG_DIAG_CONTEXT, "context");
#ifdef MORE_ERROR_FIELDS_SUPPORTED
  SET_E(PG_DIAG_SCHEMA_NAME, "schemaName");
  SET_E(PG_DIAG_TABLE_NAME, "tableName");
  SET_E(PG_DIAG_COLUMN_NAME, "columnName");
  SET_E(PG_DIAG_DATATYPE_NAME, "dataTypeName");
  SET_E(PG_DIAG_CONSTRAINT_NAME, "constraintName");
#endif
  SET_E(PG_DIAG_SOURCE_FILE, "sourceFile");
  SET_E(PG_DIAG_SOURCE_LINE, "sourceLine");
  SET_E(PG_DIAG_SOURCE_FUNCTION, "sourceFunction");
  NanReturnValue(result);
}

NAN_METHOD(Connection::SendQuery) {
  NanScope();
  TRACE("Connection::SendQuery");

  Connection *self = THIS();
  char* commandText = NewCString(args[0]);

  TRACEF("Connection::SendQuery: %s\n", commandText);
  int success = PQsendQuery(self->pq, commandText);

  delete[] commandText;

  NanReturnValue(success == 1 ? NanTrue() : NanFalse());
}

NAN_METHOD(Connection::SendQueryParams) {
  NanScope();
  TRACE("Connection::SendQueryParams");

  Connection *self = THIS();

  char* commandText = NewCString(args[0]);
  TRACEF("Connection::SendQueryParams: %s\n", commandText);

  v8::Local<v8::Array> jsParams = v8::Local<v8::Array>::Cast(args[1]);

  int numberOfParams = jsParams->Length();
  char** parameters = NewCStringArray(jsParams);

  int success = PQsendQueryParams(
      self->pq,
      commandText,
      numberOfParams,
      NULL, //const Oid* paramTypes[],
      parameters, //const char* const* paramValues[]
      NULL, //const int* paramLengths[]
      NULL, //const int* paramFormats[],
      0 //result format of text
      );

  delete[] commandText;
  DeleteCStringArray(parameters, numberOfParams);

  NanReturnValue(success == 1 ? NanTrue() : NanFalse());
}

NAN_METHOD(Connection::SendPrepare) {
  NanScope();
  TRACE("Connection::SendPrepare");

  Connection *self = THIS();

  char* statementName = NewCString(args[0]);
  char* commandText = NewCString(args[1]);
  int numberOfParams = args[2]->Int32Value();

  TRACEF("Connection::SendPrepare: %s\n", statementName);
  int success = PQsendPrepare(
      self->pq,
      statementName,
      commandText,
      numberOfParams,
      NULL //const Oid* paramTypes
      );


  delete[] statementName;
  delete[] commandText;

  NanReturnValue(success == 1 ? NanTrue() : NanFalse());
}

NAN_METHOD(Connection::SendQueryPrepared) {
  NanScope();
  TRACE("Connection::SendQueryPrepared");

  Connection *self = THIS();

  char* statementName = NewCString(args[0]);
  TRACEF("Connection::SendQueryPrepared: %s\n", statementName);

  v8::Local<v8::Array> jsParams = v8::Local<v8::Array>::Cast(args[1]);

  int numberOfParams = jsParams->Length();
  char** parameters = NewCStringArray(jsParams);

  int success = PQsendQueryPrepared(
      self->pq,
      statementName,
      numberOfParams,
      parameters, //const char* const* paramValues[]
      NULL, //const int* paramLengths[]
      NULL, //const int* paramFormats[],
      0 //result format of text
      );

  delete[] statementName;
  DeleteCStringArray(parameters, numberOfParams);

  NanReturnValue(success == 1 ? NanTrue() : NanFalse());
}

NAN_METHOD(Connection::GetResult) {
  NanScope();
  TRACE("Connection::GetResult");

  Connection *self = THIS();
  PGresult *result = PQgetResult(self->pq);

  if(result == NULL) {
    NanReturnValue(NanFalse());
  }

  self->SetLastResult(result);
  NanReturnValue(NanTrue());
}

NAN_METHOD(Connection::ConsumeInput) {
  NanScope();
  TRACE("Connection::ConsumeInput");

  Connection *self = THIS();

  int success = PQconsumeInput(self->pq);
  NanReturnValue(success == 1 ? NanTrue() : NanFalse());
}

NAN_METHOD(Connection::IsBusy) {
  NanScope();
  TRACE("Connection::IsBusy");

  Connection *self = THIS();

  int isBusy = PQisBusy(self->pq);
  TRACEF("Connection::IsBusy: %d\n", isBusy);

  NanReturnValue(isBusy == 1 ? NanTrue() : NanFalse());
}

NAN_METHOD(Connection::StartRead) {
  NanScope();
  TRACE("Connection::StartRead");

  Connection* self = THIS();

  self->ReadStart();

  NanReturnUndefined();
}

NAN_METHOD(Connection::StopRead) {
  NanScope();
  TRACE("Connection::StopRead");

  Connection* self = THIS();

  self->ReadStop();

  NanReturnUndefined();
}

NAN_METHOD(Connection::StartWrite) {
  NanScope();
  TRACE("Connection::StartWrite");

  Connection* self = THIS();

  self->WriteStart();

  NanReturnUndefined();
}

NAN_METHOD(Connection::SetNonBlocking) {
  NanScope();
  TRACE("Connection::SetNonBlocking");

  Connection* self = THIS();

  int ok = PQsetnonblocking(self->pq, args[0]->Int32Value());

  NanReturnValue(ok == 0 ? NanTrue() : NanFalse());
}

NAN_METHOD(Connection::IsNonBlocking) {
  NanScope();
  TRACE("Connection::IsNonBlocking");

  Connection* self = THIS();

  int status = PQisnonblocking(self->pq);

  NanReturnValue(status == 1 ? NanTrue() : NanFalse());
}

NAN_METHOD(Connection::Flush) {
  NanScope();
  TRACE("Connection::Flush");

  Connection* self = THIS();

  int status = PQflush(self->pq);

  NanReturnValue(NanNew<v8::Number>(status));
}

#ifdef ESCAPE_SUPPORTED
NAN_METHOD(Connection::EscapeLiteral) {
  NanScope();
  TRACE("Connection::EscapeLiteral");

  Connection* self = THIS();

  v8::Local<v8::String> str = args[0]->ToString();
  int len = str->Utf8Length() + 1;
  char* buffer = new char[len];
  str->WriteUtf8(buffer, len);

  TRACEF("Connection::EscapeLiteral:input %s\n", buffer);
  char* result = PQescapeLiteral(self->pq, buffer, len);
  TRACEF("Connection::EscapeLiteral:output %s\n", result);

  delete[] buffer;

  if(result == NULL) {
    NanReturnNull();
  }

  v8::Local<v8::String> toReturn = NanNew<v8::String>(result);

  PQfreemem(result);

  NanReturnValue(toReturn);
}

NAN_METHOD(Connection::EscapeIdentifier) {
  NanScope();
  TRACE("Connection::EscapeIdentifier");

  Connection* self = THIS();

  v8::Local<v8::String> str = args[0]->ToString();
  int len = str->Utf8Length() + 1;
  char* buffer = new char[len];
  str->WriteUtf8(buffer, len);

  TRACEF("Connection::EscapeIdentifier:input %s\n", buffer);
  char* result = PQescapeIdentifier(self->pq, buffer, len);
  TRACEF("Connection::EscapeIdentifier:output %s\n", result);

  delete[] buffer;

  if(result == NULL) {
    NanReturnNull();
  }

  v8::Local<v8::String> toReturn = NanNew<v8::String>(result);

  PQfreemem(result);

  NanReturnValue(toReturn);
}
#endif

NAN_METHOD(Connection::Notifies) {
  NanScope();
  LOG("Connection::Notifies");

  Connection* self = THIS();

  PGnotify* msg = PQnotifies(self->pq);

  if(msg == NULL) {
    LOG("No notification");
    NanReturnUndefined();
  }

  v8::Local<v8::Object> result = NanNew<v8::Object>();
  result->Set(NanNew("relname"), NanNew(msg->relname));
  result->Set(NanNew("extra"), NanNew(msg->extra));
  result->Set(NanNew("be_pid"), NanNew(msg->be_pid));

  PQfreemem(msg);

  NanReturnValue(result);
};

NAN_METHOD(Connection::PutCopyData) {
  NanScope();
  LOG("Connection::PutCopyData");

  Connection* self = THIS();

  v8::Handle<v8::Object> buffer = args[0].As<v8::Object>();

  char* data = node::Buffer::Data(buffer);
  int length = node::Buffer::Length(buffer);

  int result = PQputCopyData(self->pq, data, length);

  NanReturnValue(NanNew<v8::Number>(result));
}

NAN_METHOD(Connection::PutCopyEnd) {
  NanScope();
  LOG("Connection::PutCopyEnd");

  Connection* self = THIS();

  //optional error message

  bool sendErrorMessage = args.Length() > 0;
  char* msg = NULL;
  if(sendErrorMessage) {
    msg = NewCString(args[0]);
    TRACEF("Connection::PutCopyEnd:%s\n", msg);
  }

  int result = PQputCopyEnd(self->pq, msg);

  if(sendErrorMessage) {
    delete[] msg;
  }

  NanReturnValue(NanNew<v8::Number>(result));
}

NAN_METHOD(Connection::GetCopyData) {
  NanScope();

  LOG("Connection::GetCopyData");

  Connection* self = THIS();

  char* buffer = NULL;
  int async = args[0]->IsTrue() ? 1 : 0;

  TRACEF("Connection::GetCopyData:async %d\n", async);

  int length = PQgetCopyData(self->pq, &buffer, async);

  //some sort of failure or not-ready condition
  if(length < 1) {
    NanReturnValue(NanNew<v8::Number>(length));
  }

  v8::Local<v8::Value> nodeBuffer = NanNewBufferHandle(buffer, length);
  PQfreemem(buffer);

  NanReturnValue(nodeBuffer);
}

NAN_METHOD(Connection::Cancel) {
  NanScope();

  LOG("Connection::Cancel");

  Connection* self = THIS();

  PGcancel *cancelStuct = PQgetCancel(self->pq);

  if(cancelStuct == NULL) {
    NanReturnValue(NanNew<v8::String>("Unable to allocate cancel struct"));
  }

  char* errBuff = new char[255];

  LOG("PQcancel");
  int result = PQcancel(cancelStuct, errBuff, 255);

  LOG("PQfreeCancel");
  PQfreeCancel(cancelStuct);

  if(result == 1) {
    delete errBuff;
    NanReturnValue(NanTrue());
  }

  v8::Local<v8::Value> errorMessage = NanNew<v8::String>(errBuff);
  delete errBuff;
  NanReturnValue(errorMessage);
}

bool Connection::ConnectDB(const char* paramString) {
  TRACEF("Connection::ConnectDB:Connection parameters: %s\n", paramString);
  this->pq = PQconnectdb(paramString);

  ConnStatusType status = PQstatus(this->pq);

  if(status != CONNECTION_OK) {
    return false;
  }

  int fd = PQsocket(this->pq);
  uv_poll_init(uv_default_loop(), &(this->read_watcher), fd);
  uv_poll_init(uv_default_loop(), &(this->write_watcher), fd);

  TRACE("Connection::ConnectSync::Success");
  return true;
}

char * Connection::ErrorMessage() {
  return PQerrorMessage(this->pq);
}

void Connection::on_io_readable(uv_poll_t* handle, int status, int revents) {
  LOG("Connection::on_io_readable");
  TRACEF("Connection::on_io_readable:status %d\n", status);
  TRACEF("Connection::on_io_readable:revents %d\n", revents);
  if(revents & UV_READABLE) {
    LOG("Connection::on_io_readable UV_READABLE");
    Connection* self = (Connection*) handle->data;
    LOG("Got connection pointer");
    self->Emit("readable");
  }
}

void Connection::on_io_writable(uv_poll_t* handle, int status, int revents) {
  LOG("Connection::on_io_writable");
  TRACEF("Connection::on_io_writable:status %d\n", status);
  TRACEF("Connection::on_io_writable:revents %d\n", revents);
  if(revents & UV_WRITABLE) {
    LOG("Connection::on_io_readable UV_WRITABLE");
    Connection* self = (Connection*) handle->data;
    self->WriteStop();
    self->Emit("writable");
  }
}

void Connection::ReadStart() {
  LOG("Connection::ReadStart:starting read watcher");
  is_reading = true;
  uv_poll_start(&read_watcher, UV_READABLE, on_io_readable);
  LOG("Connection::ReadStart:started read watcher");
}

void Connection::ReadStop() {
  LOG("Connection::ReadStop:stoping read watcher");
  if(!is_reading) return;
  is_reading = false;
  uv_poll_stop(&read_watcher);
  LOG("Connection::ReadStop:stopped read watcher");
}

void Connection::WriteStart() {
  LOG("Connection::WriteStart:starting write watcher");
  uv_poll_start(&write_watcher, UV_WRITABLE, on_io_writable);
  LOG("Connection::WriteStart:started write watcher");
}

void Connection::WriteStop() {
  LOG("Connection::WriteStop:stoping write watcher");
  uv_poll_stop(&write_watcher);
}


void Connection::ClearLastResult() {
  LOG("Connection::ClearLastResult");
  if(lastResult == NULL) return;
  PQclear(lastResult);
  lastResult = NULL;
}

void Connection::SetLastResult(PGresult* result) {
  LOG("Connection::SetLastResult");
  ClearLastResult();
  lastResult = result;
}

char* Connection::NewCString(v8::Handle<v8::Value> val) {
  NanScope();

  v8::Local<v8::String> str = val->ToString();
  int len = str->Utf8Length() + 1;
  char* buffer = new char[len];
  str->WriteUtf8(buffer, len);
  return buffer;
}

char** Connection::NewCStringArray(v8::Handle<v8::Array> jsParams) {
  NanScope();

  int numberOfParams = jsParams->Length();

  char** parameters = new char*[numberOfParams];

  for(int i = 0; i < numberOfParams; i++) {
    v8::Handle<v8::Value> val = jsParams->Get(i);
    if(val->IsNull()) {
      parameters[i] = NULL;
      continue;
    }
    //expect every other value to be a string...
    //make sure aggresive type checking is done
    //on the JavaScript side before calling
    parameters[i] = NewCString(val);
  }

  return parameters;
}

void Connection::DeleteCStringArray(char** array, int length) {
  for(int i = 0; i < length; i++) {
    delete [] array[i];
  }
  delete [] array;
}

void Connection::Emit(const char* message) {
  NanScope();

  TRACE("ABOUT TO EMIT EVENT");
  v8::Local<v8::Object> jsInstance = NanObjectWrapHandle(this);
  TRACE("GETTING 'emit' FUNCTION INSTANCE");
  v8::Local<v8::Value> emit_v = jsInstance->Get(NanNew<v8::String>("emit"));
  assert(emit_v->IsFunction());
  v8::Local<v8::Function> emit_f = emit_v.As<v8::Function>();

  v8::Local<v8::String> eventName = NanNew<v8::String>(message);
  v8::Handle<v8::Value> args[1] = { eventName };

  TRACE("CALLING EMIT");
  v8::TryCatch tc;
  emit_f->Call(NanObjectWrapHandle(this), 1, args);
  if(tc.HasCaught()) {
    node::FatalException(tc);
  }
}
