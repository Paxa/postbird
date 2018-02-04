class EditValue extends Dialog {

  constructor(handler, params) {
    params.title = `Edit ${params.fieldName}`;
    params.dialogClass = "edit-value";
    if (typeof params.value == "string" && params.value.length > 50) {
      params.dialogClass += " edit-value-wide";
    }
    super(handler, params);
    this.showWindow();
  }

  showWindow () {
    var nodes = App.renderView('dialogs/edit_value', {
      value: this.value,
      fieldName: this.fieldName,
      fieldType: this.fieldType
    });

    this.content = this.renderWindow(this.title, nodes);

    this.content.find('textarea').forEach(el => {
      $u.textareaAutoSize(el);
    });

    var valueBeforeNull = null;
    var input = this.content.find('[name=value]');

    this.content.find('.value-is-null').on('change', event => {
      console.log('value-is-null', event.target.checked);
      if (event.target.checked) {
        valueBeforeNull = input.val();
        input.val("").prop('disabled', true);
      } else {
        input.val(valueBeforeNull).prop('disabled', false).focus();
      }
    });

    this.bindFormSubmitting();
  }

  onSubmit (data) {
    if (this.validate(data)) {
      this.processData(data);
    }
  }

  async processData (data) {
    console.log('processData', data);
    App.stopLoading();
  }

  validate (data) {
    return true;
  }
}

global.Dialog.EditValue = EditValue;
module.exports = EditValue;
