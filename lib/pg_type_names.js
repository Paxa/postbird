global.PgTypeNames = {
  20:   'int8',
  21:   'int2',
  23:   'int4',
  26:   'oid',
  700:  'float4', // real
  701:  'float8', // double
  16:   'bool',
  1082: 'date',
  1114: 'date',
  1184: 'timestamp',// timestamp
  1007: '_int4',
  1005: '_int2',
  1008: 'text',
  1009: 'text',
  /*
  register(600, parsePoint); // point
  register(718, parseCircle); // circle
  register(1000, parseBoolArray);
  register(1005, parseIntegerArray); // _int2
  register(1007, parseIntegerArray); // _int4
  register(1016, parseBigIntegerArray); // _int8
  register(1021, parseFloatArray); // _float4
  register(1022, parseFloatArray); // _float8
  register(1231, parseFloatArray); // _numeric
  register(1014, parseStringArray); //char
  register(1015, parseStringArray); //varchar
  register(1008, parseStringArray);
  register(1009, parseStringArray);
  register(1115, parseDateArray); // timestamp without time zone[]
  register(1182, parseDateArray); // _date
  register(1185, parseDateArray); // timestamp with time zone[]
  register(1186, parseInterval);
  register(17, parseByteA);
  register(114, JSON.parse.bind(JSON));
  register(3802, JSON.parse.bind(JSON));
  register(199, parseJsonArray); // json[]
  register(2951, parseStringArray); // uuid[]
  */

  dataType: function (typeId) {
    var arrayTypes = [1005, 1007, 1008, 1009, 1014, 1015, 1016, 1021, 1022, 1231, 1182, 1185];
    var integerTypes = [20, 21, 23, 26, 700, 701];

    if (arrayTypes.indexOf(typeId) != -1) return "ARRAY";
    if (integerTypes.indexOf(typeId) != -1) return "INTEGER";
    return "STRING";
  },

  extendFields: function (result) {
    result.fields.forEach(function (field, i) {
      if (!('data_type' in field)) {
        field.data_type = PgTypeNames.dataType(field.dataTypeID);
      }
      if (!('udt_name' in field)) {
        field.udt_name = PgTypeNames[field.dataTypeID];
      }
    });
  }
};
