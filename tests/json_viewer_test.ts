require('./test_helper');

describe('Dialog.JsonViewer', () => {
  const JsonViewer = require('../app/views/dialogs/json_viewer');

  let alertifyContainer: HTMLElement;

  beforeEach(() => {
    alertifyContainer = document.createElement('div');
    alertifyContainer.id = 'alertify';
    alertifyContainer.innerHTML = '<div class="alertify-inner"></div>';
    document.body.appendChild(alertifyContainer);

    (window as any).alertify = {
      alert: (html: string) => {
        alertifyContainer.querySelector('.alertify-inner')!.innerHTML = html;
      },
      hide: () => {}
    };
  });

  afterEach(() => {
    if (alertifyContainer && alertifyContainer.parentNode) {
      alertifyContainer.parentNode.removeChild(alertifyContainer);
    }
  });

  const createMockHandler = () => ({
    renderView: (name: string, data: any) => {
      const div = document.createElement('div');
      div.className = 'mock-view-' + name.replace('/', '-');
      div.innerHTML = `
        <div class="json-viewer-container">
          <div class="json-viewer-toolbar">
            <div class="segmented-control">
              <button class="btn-mode active" data-mode="tree">Tree</button>
              <button class="btn-mode" data-mode="code">Code</button>
            </div>
            <div class="json-toolbar-actions">
              <div class="tree-actions">
                <input class="json-search-input" />
                <button class="btn-expand-all">Expand All</button>
                <button class="btn-collapse-all">Collapse All</button>
              </div>
              <div class="code-actions" style="display:none;">
                <button class="btn-code-prettify">Prettify</button>
                <button class="btn-code-minify">Minify</button>
              </div>
              <button class="btn-copy-json">Copy</button>
            </div>
          </div>
          <div class="json-validation-error" style="display:none;"></div>
          <div class="json-viewer-body">
            <div class="json-tree-wrapper">
              <div class="json-tree-content"></div>
            </div>
            <div class="json-code-wrapper" style="display:none;">
              <textarea class="json-code-textarea"></textarea>
            </div>
          </div>
          <div class="json-viewer-footer">
            <div class="json-footer-left">
              <label class="json-null-label"><input type="checkbox" class="value-is-null" /> Set NULL</label>
              <span class="json-path-breadcrumb">Path: $</span>
            </div>
            <div class="json-footer-right">
              <button class="ok">Save</button>
              <button class="cancel">Cancel</button>
            </div>
          </div>
        </div>
      `;
      return $u(div);
    }
  });

  it('parses objects, valid JSON strings, and null correctly', () => {
    const handler = createMockHandler();
    const viewer = new JsonViewer(handler, {
      fieldName: 'payload',
      value: { a: 1, b: 'two' },
      readOnly: true
    });

    assert.deepEqual(viewer.parseInitialValue({ x: 10 }), { x: 10 });
    assert.deepEqual(viewer.parseInitialValue('{"city":"Paris"}'), { city: 'Paris' });
    assert.equal(viewer.parseInitialValue(null), null);
    assert.equal(viewer.parseInitialValue('not json'), 'not json');
    viewer.close();
  });

  it('renders interactive tree nodes with keys, values, and types', () => {
    const handler = createMockHandler();
    const data = {
      username: 'johndoe',
      age: 30,
      active: true,
      notes: null,
      tags: ['admin', 'moderator']
    };

    const viewer = new JsonViewer(handler, {
      fieldName: 'metadata',
      value: data,
      readOnly: false
    });

    const root = viewer.getRoot();
    const tree = root.querySelector('.json-tree-content');
    assert(tree, 'Tree content container must exist');

    // Check presence of keys and typed spans
    assert(tree.textContent.includes('username'), 'Tree must display username key');
    assert(tree.textContent.includes('johndoe'), 'Tree must display username value');
    assert(tree.querySelector('.val-string'), 'Must have string value class');
    assert(tree.querySelector('.val-number'), 'Must have number value class');
    assert(tree.querySelector('.val-boolean'), 'Must have boolean value class');
    assert(tree.querySelector('.val-null'), 'Must have null value class');

    // Check array representation
    assert(tree.textContent.includes('tags'), 'Must include tags array');
    assert(tree.textContent.includes('2 items'), 'Must indicate 2 items in array');
    viewer.close();
  });

  it('updates path breadcrumb when navigating tree nodes', () => {
    const handler = createMockHandler();
    const viewer = new JsonViewer(handler, {
      fieldName: 'config',
      value: { settings: { theme: 'dark' } },
      readOnly: true
    });

    viewer.updateSelectedPath('$.settings.theme');
    const root = viewer.getRoot();
    const breadcrumb = root.querySelector('.json-path-breadcrumb');
    assert.equal(breadcrumb.textContent, 'Path: $.settings.theme');
    assert.equal(viewer.selectedPath, '$.settings.theme');
    viewer.close();
  });

  it('filters tree nodes dynamically using search query', () => {
    const handler = createMockHandler();
    const viewer = new JsonViewer(handler, {
      fieldName: 'data',
      value: {
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@example.com'
      },
      readOnly: true
    });

    const root = viewer.getRoot();
    const searchInput = root.querySelector('.json-search-input');
    searchInput.value = 'email';
    searchInput.dispatchEvent(new Event('input'));

    const tree = root.querySelector('.json-tree-content');
    assert(tree.textContent.includes('email'), 'Should match email');
    assert(tree.innerHTML.includes('<mark>email</mark>'), 'Should highlight matched term');
    viewer.close();
  });

  it('expands and collapses all tree nodes', () => {
    const handler = createMockHandler();
    const viewer = new JsonViewer(handler, {
      fieldName: 'data',
      value: {
        user: { profile: { details: { role: 'lead' } } }
      },
      readOnly: true
    });

    const root = viewer.getRoot();
    viewer.expandAllTreeNodes(false);
    const children = root.querySelectorAll('.json-node-children');
    children.forEach((child: any) => {
      assert.equal(child.style.display, 'none', 'Child nodes should be hidden when collapsed');
    });

    viewer.expandAllTreeNodes(true);
    children.forEach((child: any) => {
      assert.equal(child.style.display, 'block', 'Child nodes should be visible when expanded');
    });
    viewer.close();
  });

  it('formats code with prettify and minify', () => {
    const handler = createMockHandler();
    const viewer = new JsonViewer(handler, {
      fieldName: 'doc',
      value: { a: 1, b: 2 },
      readOnly: false
    });

    viewer.switchMode('code');
    const root = viewer.getRoot();
    const textarea = root.querySelector('.json-code-textarea') as HTMLTextAreaElement;

    viewer.formatCode(0);
    assert.equal(viewer.getCodeContent(), '{"a":1,"b":2}', 'Minify should output single line');

    viewer.formatCode(2);
    assert(viewer.getCodeContent().includes('\n  "a": 1'), 'Prettify should indent with 2 spaces');
    viewer.close();
  });

  it('detects invalid JSON syntax and prevents switching from code to tree', () => {
    const handler = createMockHandler();
    const viewer = new JsonViewer(handler, {
      fieldName: 'doc',
      value: { key: 'value' },
      readOnly: false
    });

    viewer.switchMode('code');
    const root = viewer.getRoot();
    const textarea = root.querySelector('.json-code-textarea') as HTMLTextAreaElement;
    textarea.value = '{ invalid json: ';
    if (viewer.editor) viewer.editor.setValue('{ invalid json: ');

    viewer.switchMode('tree');
    assert.equal(viewer.mode, 'code', 'Should stay in code mode on syntax error');

    const errBanner = root.querySelector('.json-validation-error');
    assert(errBanner.style.display !== 'none', 'Error banner should be displayed');
    assert(errBanner.textContent.includes('Invalid JSON syntax'), 'Error message should explain syntax error');
    viewer.close();
  });

  it('saves parsed JSON or null via onSave callback', () => {
    const handler = createMockHandler();
    let savedValue: any = null;
    let savedIsNull = false;

    const viewer = new JsonViewer(handler, {
      fieldName: 'settings',
      fieldType: { is_nullable: true, data_type: 'json' },
      value: { theme: 'light' },
      readOnly: false,
      onSave: (val, isNull) => {
        savedValue = val;
        savedIsNull = isNull;
      }
    });

    viewer.handleSave();
    assert.equal(savedIsNull, false);
    assert.equal(savedValue, JSON.stringify({ theme: 'light' }));

    // Test Set to NULL
    const root = viewer.getRoot();
    const nullCheckbox = root.querySelector('.value-is-null') as HTMLInputElement;
    nullCheckbox.checked = true;
    viewer.handleSave();
    assert.equal(savedIsNull, true);
    assert.equal(savedValue, null);
    viewer.close();
  });
});
