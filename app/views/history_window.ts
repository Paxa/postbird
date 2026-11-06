class HistoryWindow {
  private eventListener: ((event: any) => void) | null = null;
  private isOpen = false;

  constructor() {
    if (App.historyWin) {
      App.historyWin.focus();
      return;
    }

    this.isOpen = true;
    App.historyWin = {
      focus: () => {},
      close: () => this.close(),
    };

    this.openModal();
  }

  private buildBodyHtml(): string {
    const nodes = App.renderView("history", { events: App.logEvents || [] });
    const el = $u("<div>").append(nodes);
    const titleHtml = $u("<h3>").addClass("window-title").text("Console — SQL & Event History")[0].outerHTML;
    return titleHtml + el.html();
  }

  private bindEvents(container: JQuery<HTMLElement>): void {
    const ulEl = container.find(".history-window ul")[0];
    if (ulEl) {
      ulEl.scrollTop = ulEl.scrollHeight;
    }

    container.find(".reload-btn").off("click").on("click", (e) => {
      e.preventDefault();
      this.refreshContent();
    });

    container.find(".clear-btn").off("click").on("click", (e) => {
      e.preventDefault();
      App.logEvents = [];
      this.refreshContent();
    });

    container.find(".close-history-btn, button.cancel").off("click").on("click", (e) => {
      e.preventDefault();
      this.close();
    });
  }

  private refreshContent(): void {
    if (!this.isOpen) return;
    const container = $u("#alertify .alertify-inner");
    if (!container.length) return;
    const msgEl = container.find(".alertify-message");
    if (msgEl.length) {
      msgEl.html(this.buildBodyHtml());
      this.bindEvents(container);
    }
  }

  private openModal(): void {
    const windowHtml = this.buildBodyHtml();

    window.alertify.alert(
      windowHtml,
      () => {
        this.cleanup();
      },
      "custom-window history-dialog"
    );

    $u("#alertify").addClass("history-dialog");
    const container = $u("#alertify .alertify-inner");
    container.addClass("history-dialog");
    this.bindEvents(container);

    this.eventListener = () => {
      this.refreshContent();
    };
    App.on("log.message", this.eventListener);
  }

  close(): void {
    if (!this.isOpen) return;
    this.cleanup();
    window.alertify.hide();
  }

  private cleanup(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    $u("#alertify").removeClass("history-dialog");
    if (this.eventListener) {
      App.removeListener("log.message", this.eventListener);
      this.eventListener = null;
    }
    App.historyWin = null;
  }
}

(global as any).HistoryWindow = HistoryWindow;
