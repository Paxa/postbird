#include "addon.h"

// Initialize the node addon
void InitAddon(v8::Handle<v8::Object> exports) {

  v8::Local<v8::FunctionTemplate> tpl = NanNew<v8::FunctionTemplate>(Connection::Create);
  tpl->SetClassName(NanNew("PQ"));
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  //connection initialization & management functions
  NODE_SET_PROTOTYPE_METHOD(tpl, "$connectSync", Connection::ConnectSync);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$connect", Connection::Connect);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$finish", Connection::Finish);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$getLastErrorMessage", Connection::GetLastErrorMessage);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$resultErrorFields", Connection::ResultErrorFields);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$socket", Connection::Socket);

  //sync query functions
  NODE_SET_PROTOTYPE_METHOD(tpl, "$exec", Connection::Exec);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$execParams", Connection::ExecParams);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$prepare", Connection::Prepare);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$execPrepared", Connection::ExecPrepared);

  //async query functions
  NODE_SET_PROTOTYPE_METHOD(tpl, "$sendQuery", Connection::SendQuery);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$sendQueryParams", Connection::SendQueryParams);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$sendPrepare", Connection::SendPrepare);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$sendQueryPrepared", Connection::SendQueryPrepared);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$getResult", Connection::GetResult);

  //async i/o control functions
  NODE_SET_PROTOTYPE_METHOD(tpl, "$startRead", Connection::StartRead);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$stopRead", Connection::StopRead);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$startWrite", Connection::StartWrite);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$consumeInput", Connection::ConsumeInput);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$isBusy", Connection::IsBusy);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$setNonBlocking", Connection::SetNonBlocking);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$isNonBlocking", Connection::IsNonBlocking);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$flush", Connection::Flush);

  //result accessor functions
  NODE_SET_PROTOTYPE_METHOD(tpl, "$clear", Connection::Clear);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$ntuples", Connection::Ntuples);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$nfields", Connection::Nfields);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$fname", Connection::Fname);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$ftype", Connection::Ftype);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$getvalue", Connection::Getvalue);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$getisnull", Connection::Getisnull);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$cmdStatus", Connection::CmdStatus);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$cmdTuples", Connection::CmdTuples);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$resultStatus", Connection::ResultStatus);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$resultErrorMessage", Connection::ResultErrorMessage);

  //string escaping functions
#ifdef ESCAPE_SUPPORTED
  NODE_SET_PROTOTYPE_METHOD(tpl, "$escapeLiteral", Connection::EscapeLiteral);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$escapeIdentifier", Connection::EscapeIdentifier);
#endif

  //async notifications
  NODE_SET_PROTOTYPE_METHOD(tpl, "$notifies", Connection::Notifies);

  //COPY IN/OUT
  NODE_SET_PROTOTYPE_METHOD(tpl, "$putCopyData", Connection::PutCopyData);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$putCopyEnd", Connection::PutCopyEnd);
  NODE_SET_PROTOTYPE_METHOD(tpl, "$getCopyData", Connection::GetCopyData);

  //Cancel
  NODE_SET_PROTOTYPE_METHOD(tpl, "$cancel", Connection::Cancel);

  exports->Set(NanNew<v8::String>("PQ"), tpl->GetFunction());
}

NODE_MODULE(addon, InitAddon)

