require('./base');

module.exports = {
  DefProcedure:     require('./def_procedure'),
  EditColumn:       require('./edit_column'),
  EditProcedure:    require('./edit_procedure'),
  EditUser:         require('./edit_user'),
  EditValue:        require('./edit_value'),
  ExportFile:       require('./export_file'),
  HerokuConnection: require('./heroku_connection'),
  ImportFile:       require('./import_file'),
  ListLanguages:    require('./list_languages'),
  NewColumn:        require('./new_column'),
  NewDatabase:      require('./new_database'),
  NewIndex:         require('./new_index'),
  NewSnippet:       require('./new_snippet'),
  NewTable:         require('./new_table'),
  NewUser:          require('./new_user'),
  RelatedRecords:   require('./related_records'),
  ShowSql:          require('./show_sql'),
  UserGrants:       require('./user_grants'),
};
