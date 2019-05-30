/*
  emulate macos tables where we can highligh row by click and navigate with arrow buttons
*/

/*::
interface GenericTable_EventHandlers {
  [column: string] : Function[]
}
*/
class GenericTable {
  /*::
  static active: GenericTable
  eventHandlers: GenericTable_EventHandlers
  element: HTMLElement
  rows: NodeListOf<HTMLElement>
  selectedRow: HTMLElement
  */

  constructor (element) {
    this.eventHandlers = {};
    this.element = element;

    this.rows = this.element.querySelectorAll('tr');

    this.rows.forEach(row => {
      row.addEventListener('click', () => {
        this.onRowClick(row);
      });
    });

    this.element.addEventListener('click', () => {
      GenericTable.setSelected(this);
    });

    this.bind('key.down', () => {
      this.selectNextRow();
    });

    this.bind('key.up', () => {
      this.selectPrevRow();
    });

    this.bind('selected', () => {
      this.element.classList.add('active');
    });

    this.bind('unselected', () => {
      this.element.classList.remove('active');
    });

    this.element.genericTable = this;
  }

  // support dom element and jquery object
  static getInstance (element) {
    return element.genericTable || element[0] && element[0].genericTable;
  }

  static setSelected (instance) {
    if (this.active == instance) return false;

    if (this.active) {
      this.active.trigger('unselected');
    }
    instance.trigger('selected');
    this.active = instance;
  }

  static keyPressed (key) {
    if (this.active) {
      this.active.trigger('key.' + key);
    }
  }


  onRowClick (row) {
    this.setSelectedRow(row);
  }

  setSelectedRow (row) {
    if (this.selectedRow) {
      this.selectedRow.classList.remove('selected');
    }

    this.selectedRow = row;
    //console.log('selected', this.selectedRow);
    row.classList.add('selected');
  }

  selectNextRow () {
    if (this.selectedRow) {
      var newNext = $u(this.selectedRow).next('tr')[0];
      if (newNext) {
        this.setSelectedRow(newNext);
      }
    }
  }

  selectPrevRow () {
    if (this.selectedRow) {
      var newPrev = $u(this.selectedRow).prev('tr')[0];
      if (newPrev) {
        this.setSelectedRow(newPrev);
      }
    }
  }

  //eventHandlers: {}

  // events:
  // selected
  // unselected
  // key.down
  // key.up
  // 
  trigger (event, data /*:: ?: any */) {
    //console.log('trigger', event, this.element[0]);

    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach((handler) => {
        handler(data);
      });
    }
  }

  bind (type, handler) {
    if (!this.eventHandlers[type]) this.eventHandlers[type] = [];
    this.eventHandlers[type].push(handler);
  }
}

GenericTable.active = null;

window.GenericTable = global.GenericTable = GenericTable;