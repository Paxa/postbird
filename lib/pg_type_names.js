/*::
interface PgTypeNames {
  dataType: (typeId: number) => string;
  extendFields: (result: any) => void;
  hash: any;
}
*/

global.PgTypeNames = {
  hash: {
    20:   'int8',
    21:   'int2',
    23:   'int4',
    26:   'oid',
    700:  'float4', // real
    701:  'float8', // double
    16:   'bool',
    1082: 'date',
    600: 'point',
    718: 'circle',
    1000: 'bool[]',
    1001: 'byte[]',
    1114: 'date',
    1184: 'timestamp', // timestamp
    1007: '_int4',
    1005: '_int2',
    1028: 'oid[]',
    1016: '_int8',
    1021: '_float4',
    1022: '_float8',
    1231: '_numeric',
    1014: 'char',
    1015: 'varchar',
    1008: 'text',
    1009: 'text',
    1115: 'timestamp[]',
    1185: 'timestampz[]',
    1186: 'interval',
    114: 'json',
    3802: 'jsonb',
    199: 'json[]',
    3807: 'jsonb[]',
    2951: 'uuid[]',
    791: 'money[]',
    1183: 'time[]',

    142: 'xml',
  },

  dataType: function (typeId) {
    var arrayTypes = [1005, 1007, 1008, 1009, 1014, 1015, 1016, 1021, 1022, 1231, 1182, 1185];
    var integerTypes = [20, 21, 23, 26, 700, 701];

    if (arrayTypes.indexOf(typeId) != -1) return "ARRAY";
    if (integerTypes.indexOf(typeId) != -1) return "INTEGER";
    return "STRING";
  },

  extendFields: function (result) {
    if (!result.fields) return;

    result.fields.forEach((field) => {
      if (!('data_type' in field)) {
        field.data_type = PgTypeNames.dataType(field.dataTypeID);
      }
      if (!('udt_name' in field)) {
        field.udt_name = PgTypeNames.hash[field.dataTypeID];
      }
    });
  }
};
