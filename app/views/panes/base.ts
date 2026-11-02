class PaneBase {

  
  view: DbScreenView
  handler: DbScreen
  lastEvent: Event
  content: JQuery<HTMLElement>
  

  constructor (view) {
    this.view = view;
    this.handler = view.handler;
  }

  executeHandler (exec: string) {
    if (!exec) return;
    const match = exec.trim().match(/^([a-zA-Z0-9_$]+)(?:\((.*)\))?$/s);
    if (!match) return;
    const methodName = match[1];
    const rawArgs = match[2];
    const fn = (this as any)[methodName];
    if (typeof fn !== 'function') {
      console.warn(`[PaneBase] Handler method '${methodName}' not found on`, this);
      return;
    }
    if (!rawArgs || rawArgs.trim() === '') {
      return fn.call(this);
    }
    const args: any[] = [];
    const argRegex = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|[^,]+/g;
    const matches = rawArgs.match(argRegex) || [];
    for (let part of matches) {
      part = part.trim();
      if ((part.startsWith("'") && part.endsWith("'")) || (part.startsWith('"') && part.endsWith('"'))) {
        args.push(part.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"'));
      } else if (!isNaN(Number(part)) && part !== '') {
        args.push(Number(part));
      } else if (part === 'true') {
        args.push(true);
      } else if (part === 'false') {
        args.push(false);
      } else if (part === 'null') {
        args.push(null);
      } else {
        args.push(part);
      }
    }
    return fn.apply(this, args);
  }

  initEvents (content) {
    $u(content).find('a[exec], button[exec], input[type=submit][exec]').each((i, el) => {
      el.addEventListener('click', e => {
        $u.stopEvent(e);
        this.lastEvent = e;
        var exec = el.getAttribute('exec');
        if (exec) {
          if (typeof this.executeHandler === 'function') {
            this.executeHandler(exec);
          } else {
            PaneBase.prototype.executeHandler.call(this, exec);
          }
        }
      });
    });
  }

  setUnchangeable () {
    this.content.attr('unchangeable', 'true');
  }

  renderViewToPane (pane, view_file, options ? : any ) {
    try {
      var node = App.renderView(view_file, options);
      this.view.setTabContent(pane, node);
    } catch (error) {
      errorReporter(error, false);
      var errorMsg = $dom(['div.error',
        ['h4', "Can not render content"],
        ['code',
          ['pre', error.toString()],
          ['pre', error.stack]
        ]
      ]);

      this.view.setTabContent('content', errorMsg);
    }
    this.content = this.view.tabContent(pane);
    this.initEvents(this.content);
  }

  initTables () {
    // heavy stuff, run it with delay
    setTimeout(() => {
      this.content.find('.rescol-wrapper').forEach((table) => {
        new ResizableColumns(table);
      });

      this.content.find('.rescol-content-wrapper table').forEach((table) => {
        if (!table.hasAttribute('native-table-init')) {
          new GenericTable(table);
          $u(table).trigger('generic-table-init');
          table.setAttribute('native-table-init', true);
        }
      });
    }, 10);
  }

  scrollToTop () {
    this.content[0].scrollTop = 0;
  }
}

(global as any).PaneBase = PaneBase;