const migration = require('../migrations/20260715000000-cleanup-redundant-primary-key-indexes');

describe('cleanup redundant primary key indexes migration', () => {
  it('removes only non-primary indexes covering id alone', async () => {
    const removed = [];
    const queryInterface = {
      showAllTables: jest.fn(async () => ['article']),
      showIndex: jest.fn(async (tableName) => {
        if (tableName === 'article') {
          return [
            { name: 'PRIMARY', fields: [{ attribute: 'id' }] },
            { name: 'article_id', fields: [{ attribute: 'id' }] },
            { name: 'idxArticleType', fields: [{ attribute: 'typeId' }] },
            { name: 'idxIdAndStatus', fields: [{ attribute: 'id' }, { attribute: 'status' }] },
          ];
        }
        return [];
      }),
      removeIndex: jest.fn(async (tableName, indexName) => {
        removed.push([tableName, indexName]);
      }),
    };

    await migration.up(queryInterface);

    expect(removed).toEqual([['article', 'article_id']]);
  });

  it('skips tables that do not exist yet', async () => {
    const queryInterface = {
      showAllTables: jest.fn(async () => ['article']),
      showIndex: jest.fn(async () => []),
      removeIndex: jest.fn(),
    };

    await migration.up(queryInterface);

    expect(queryInterface.showIndex).toHaveBeenCalledTimes(1);
    expect(queryInterface.showIndex).toHaveBeenCalledWith('article');
  });
});
