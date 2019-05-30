class EditValue extends DialogBase {
  /*::
  value: any
  fieldName: string
  fieldType: string
  onSave: (newValue: string, isNull: boolean) => void
  */
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
      if (event.target.checked) {
        valueBeforeNull = input.val();
        input.val("").prop('disabled', true);
      } else {
        input.val(valueBeforeNull).prop('disabled', false).focus();
      }
    });

    // don't close dialog when press enter in textfield
    this.content.find('textarea').on('keyup', event => {
      if (event.keyCode == 13) {
        event.preventDefault();
        event.stopPropagation();
      }
    })

    this.bindFormSubmitting();
  }

  onSubmit (data) {
    if (this.validate(data)) {
      this.processData(data);
    }
  }

  async processData (data) {
    this.onSave(data.value, data.value_is_null === "true");
  }

  validate (data) {
    return true;
  }
}

/*::
declare var EditValue__: typeof EditValue
*/
module.exports = EditValue;
