'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('question', {
      id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        comment: '匿名问答id',
      },
      trackingCode: {
        type: Sequelize.STRING(32),
        allowNull: false,
        comment: '追踪码',
      },
      question: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: '问题内容',
      },
      answer: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '回答内容',
      },
      nickname: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: '匿名昵称',
      },
      contact: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: '联系方式',
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'archived'),
        allowNull: false,
        defaultValue: 'pending',
        comment: '审核状态',
      },
      isPublic: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否公开展示',
      },
      answerTime: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: '回答时间',
      },
      ip: {
        type: Sequelize.STRING(64),
        allowNull: true,
        comment: '提交IP',
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '提交UA',
      },
      remark: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '后台备注',
      },
      createTime: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: '创建时间',
      },
      updatedTime: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: '更新时间',
      },
    });

    await queryInterface.addIndex('question', ['trackingCode'], {
      unique: true,
      name: 'idxTrackingCode',
    });
    await queryInterface.addIndex('question', ['status'], { name: 'idxStatus' });
    await queryInterface.addIndex('question', ['isPublic'], { name: 'idxIsPublic' });
    await queryInterface.addIndex('question', ['createTime'], { name: 'idxCreateTime' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('question');
  }
};
