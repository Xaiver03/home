'use strict';

const tables = [
  'admin',
  'article',
  'article_type',
  'comment',
  'configuration',
  'friend_link',
  'question',
  'user',
];

const isRedundantIdIndex = (index) => {
  const fields = (index.fields || []).map((field) => field.attribute || field.name);
  return index.name !== 'PRIMARY' && fields.length === 1 && fields[0] === 'id';
};

module.exports = {
  async up(queryInterface) {
    const existingTables = new Set(
      (await queryInterface.showAllTables()).map((table) =>
        typeof table === 'string' ? table : table.tableName,
      ),
    );

    for (const table of tables.filter((table) => existingTables.has(table))) {
      const indexes = await queryInterface.showIndex(table);
      for (const index of indexes.filter(isRedundantIdIndex)) {
        await queryInterface.removeIndex(table, index.name);
      }
    }
  },

  async down() {
    // The removed indexes duplicate the table primary key and should not be recreated.
  },
};
