module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "question",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        comment: "匿名问答id",
      },
      trackingCode: {
        type: DataTypes.STRING(32),
        allowNull: false,
        unique: true,
        comment: "追踪码",
      },
      question: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: "问题内容",
      },
      answer: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "回答内容",
      },
      nickname: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "匿名昵称",
      },
      contact: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "联系方式",
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected", "archived"),
        allowNull: false,
        defaultValue: "pending",
        comment: "审核状态",
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "是否公开展示",
      },
      answerTime: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "回答时间",
      },
      ip: {
        type: DataTypes.STRING(64),
        allowNull: true,
        comment: "提交IP",
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "提交UA",
      },
      remark: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "后台备注",
      },
      createTime: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "创建时间",
      },
      updatedTime: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "更新时间",
      },
    },
    {
      sequelize,
      tableName: "question",
      timestamps: true,
      createdAt: "createTime",
      updatedAt: "updatedTime",
      indexes: [
        {
          name: "idxTrackingCode",
          unique: true,
          using: "BTREE",
          fields: [{ name: "trackingCode" }],
        },
        {
          name: "idxStatus",
          using: "BTREE",
          fields: [{ name: "status" }],
        },
        {
          name: "idxIsPublic",
          using: "BTREE",
          fields: [{ name: "isPublic" }],
        },
        {
          name: "idxCreateTime",
          using: "BTREE",
          fields: [{ name: "createTime" }],
        },
      ],
      hooks: {
        beforeCreate: async (question) => {
          const utils = require("../utils/index");
          const currentQuestion = question.get({ plain: true });
          if (utils.isNullOrEmpty(currentQuestion.question)) {
            throw new Error("问题内容不能为空哦🚦");
          }
          if (currentQuestion.question.length > 1500) {
            throw new Error("问题内容限制大小为1500字符哦😵");
          }
          if (!utils.isNullOrEmpty(currentQuestion.nickname) && currentQuestion.nickname.length > 100) {
            throw new Error("昵称限制大小为100字符哦😵");
          }
          if (!utils.isNullOrEmpty(currentQuestion.contact) && currentQuestion.contact.length > 255) {
            throw new Error("联系方式限制大小为255字符哦😵");
          }
          question.status = "pending";
          question.isPublic = false;
        },
        beforeUpdate: async (question) => {
          const utils = require("../utils/index");
          const currentQuestion = question.get({ plain: true });
          if (utils.isNullOrEmpty(currentQuestion.question)) {
            throw new Error("问题内容不能为空哦🚦");
          }
          if (currentQuestion.question.length > 1500) {
            throw new Error("问题内容限制大小为1500字符哦😵");
          }
          if (currentQuestion.isPublic && currentQuestion.status !== "approved") {
            throw new Error("问答必须审核通过后才能公开展示");
          }
          if (currentQuestion.isPublic && utils.isNullOrEmpty(currentQuestion.answer)) {
            throw new Error("问答必须完成回答后才能公开展示");
          }
        },
      },
    }
  );
};
