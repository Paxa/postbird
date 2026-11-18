var electronRemote = require('@electron/remote');
var formatUtil: typeof import('../../../lib/format_util') = require('../../../lib/format_util');

interface ErrorReportPayload {
  title: string;
  reportText: string;
  githubUrl: string;
  mailtoUrl: string;
}

class ErrorReport extends DialogBase {
  payload: ErrorReportPayload;
  onCloseCallback?: () => void;

  constructor(payload: ErrorReportPayload, onClose?: () => void) {
    super(null, {
      dialogClass: "show-sql-dialog error-report-dialog",
      title: "Unexpected Error",
      payload,
    });
    this.payload = payload;
    this.onCloseCallback = onClose;
    this.showWindow();
  }

  showWindow() {
    var nodes = App.renderView('dialogs/error_report', {
      reportText: this.payload.reportText,
    });
    this.content = this.renderWindow(this.title, nodes);

    this.content.find('button.btn-report-github').bind('click', (e) => {
      e && e.preventDefault();
      electronRemote.shell.openExternal(this.payload.githubUrl);
    });

    this.content.find('button.btn-report-email').bind('click', (e) => {
      e && e.preventDefault();
      electronRemote.shell.openExternal(this.payload.mailtoUrl);
    });

    this.content.find('button.btn-copy-error').bind('click', (e) => {
      e && e.preventDefault();
      formatUtil.copyWithFeedback(this.payload.reportText, e?.currentTarget as HTMLElement, 'Copied!');
    });
  }

  close() {
    super.close();
    if (this.onCloseCallback) {
      const cb = this.onCloseCallback;
      this.onCloseCallback = undefined;
      cb();
    }
  }
}

module.exports = ErrorReport;
