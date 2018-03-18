class Procedures extends Pane {

  async renderTab (callback) {
    App.startLoading("Loading procedures...");

    var procs = await Model.Procedure.findAllWithExtensions();
    var triggers = await Model.Trigger.findAll();

    App.stopLoading();

    this.renderViewToPane('procedures', 'procedures_tab', {
      procs: procs,
      triggers: triggers
    });

    this.initTables();
    if (callback) callback();
  }

  async editProc (poid, procName) {
    var proc = await Model.Procedure.find(poid);

    var dialog = new Dialog.EditProcedure(this.handler, proc, async (updated) => {
      if (updated != proc.full_prosrc) {
        await this.updateProc(poid, updated);
        $u.alert(`Procedure ${proc.name}(${proc.arg_list}) updated`);
        dialog.close();
        this.renderTab();
      } else {
        $u.alert("Procedure code not changed");
      }
    });
  }

  updateProc (poid, newSource) {
    return Model.Procedure.update(poid, newSource);
  }

  async removeProc (poid, procName) {
    var proc = await Model.Procedure.find(poid);

    if (await $u.confirm(`Delete procedure ${proc.name}(${proc.arg_list})?`)) {
      await proc.drop();

      $u.alert(`Procedure ${proc.name}(${proc.arg_list}) deleted`);
      this.renderTab();
    }
  }

  async procDefinition (poid, name) {
    var proc = await Model.Procedure.find(poid);
    var data = await proc.getDefinition();
    new Dialog.DefProcedure(this.handler, proc, data.source);
  }

  editTrigger (triggerName) {
    throw new Error("Not Implemented");
  }

  removeTrigger (triggerName) {
    throw new Error("Not Implemented");
  }

  async listLanguages () {
    App.startLoading("Fetching config...");
    var langs = await Model.Procedure.listLanguages();
    App.stopLoading();

    new Dialog.ListLanguages(this.hadler, langs);;
  }

}

module.exports = Procedures;
