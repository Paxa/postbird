require('./test_helper');

describe('Model.User', () => {

  before(async () => {
    await testConnection();
    await Model.User.drop('postbird_tester', {ifExists: true});
  });

  afterEach(async () => {
    await cleanupSchema();
    await Model.User.drop('postbird_tester', {ifExists: true});
  });

  it('should create user', async () => {
    var user = await Model.User.create({username: 'postbird_tester'});

    assert.equal(user.username, 'postbird_tester');
  });

  it('should list users', async () => {
    await Model.User.create({username: 'postbird_tester', superuser: true});
    var user = (await Model.User.findAll()).find(u => {
      return u.rolname == 'postbird_tester'
    });

    assert.equal(user.rolname, 'postbird_tester');
    assert(user.rolsuper);
    assert.equal(user.owned_dbs, '');
  });

  it('should update user', async () => {
    var user = await Model.User.create({username: 'postbird_tester1', superuser: true});
    await user.update({username: 'postbird_tester', superuser: false})

    user = (await Model.User.findAll()).find(u => {
      return u.rolname == 'postbird_tester'
    });

    assert.equal(user.rolname, 'postbird_tester');
    assert(!user.rolsuper);
  });

  it('should get user grands', async () => {
    var user = await Model.User.create({username: 'postbird_tester', superuser: true});
    var table = await Model.Table.create('public', 'test_table');

    await ModelBase.q('GRANT UPDATE,SELECT,DELETE ON test_table TO postbird_tester;');

    var grants = await user.getGrants();

    assert.deepEqual(grants.rows, [{
      grantee: 'postbird_tester',
      table_name: 'test_table',
      table_schema: 'public',
      privileges: 'rwd',
      table_type: 'r'
    }]);

    await table.drop()
  });
});