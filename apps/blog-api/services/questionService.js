const { Question } = require("../models");
const utils = require("../utils");
const { Op } = require("sequelize");

const publicAttributes = [
  "id",
  "question",
  "answer",
  "nickname",
  "status",
  "isPublic",
  "answerTime",
  "createTime",
  "updatedTime",
];

const trackingAttributes = [
  "id",
  "trackingCode",
  "question",
  "answer",
  "nickname",
  "status",
  "isPublic",
  "answerTime",
  "createTime",
  "updatedTime",
];

const applyQuestionFilters = (selectOptions, options = {}) => {
  for (let key in options) {
    if (utils.isNullOrEmpty(options[key])) continue;
    if (key == "question") {
      selectOptions.where.question = { [Op.like]: "%" + options[key] + "%" };
    } else if (key == "answer") {
      if (options[key] === '__ANSWERED__') {
        selectOptions.where.answer = { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] };
      } else if (options[key] === '__UNANSWERED__') {
        selectOptions.where[Op.and] = [
          ...(selectOptions.where[Op.and] || []),
          {
            [Op.or]: [{ answer: null }, { answer: "" }],
          },
        ];
      } else {
        selectOptions.where.answer = { [Op.like]: "%" + options[key] + "%" };
      }
    } else if (key == "keyword") {
      selectOptions.where[Op.or] = [
        { question: { [Op.like]: "%" + options[key] + "%" } },
        { answer: { [Op.like]: "%" + options[key] + "%" } },
      ];
    } else if (key == "time") {
      selectOptions.where.createTime = {
        [Op.between]: [new Date(options[key][0]), new Date(options[key][1])],
      };
    } else {
      selectOptions.where[key] = options[key];
    }
  }
};

module.exports = {
  publicAttributes,
  trackingAttributes,

  generateTrackingCode: async () => {
    const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    const randomCode = () => {
      let code = "QA";
      for (let i = 0; i < 10; i++) {
        code += alphabet[Math.floor(Math.random() * alphabet.length)];
      }
      return code;
    };

    for (let i = 0; i < 10; i++) {
      const trackingCode = randomCode();
      const existing = await Question.findOne({ where: { trackingCode } });
      if (!existing) return trackingCode;
    }
    throw new Error("追踪码生成失败，请稍后重试");
  },

  createQuestion: async (question) => {
    return await Question.create(question);
  },

  getQuestionByTrackingCode: async (trackingCode) => {
    return await Question.findOne({
      where: { trackingCode },
      attributes: trackingAttributes,
    });
  },

  getAllQuestion: async (currentPage = 1, pageSize = 10, options = {}) => {
    let offset = (currentPage - 1) * pageSize;
    let selectOptions = {
      offset,
      limit: parseInt(pageSize),
      where: {},
      order: [["createTime", "DESC"]],
    };
    if (options.order) {
      selectOptions.order = JSON.parse(options.order);
    }
    delete options.order;
    applyQuestionFilters(selectOptions, options);
    return await Question.findAndCountAll(selectOptions);
  },

  searchQuestion: async (currentPage = 1, pageSize = 10, options = {}) => {
    return await module.exports.getAllQuestion(currentPage, pageSize, options);
  },

  searchPublicQuestion: async (currentPage = 1, pageSize = 10, options = {}) => {
    let offset = (currentPage - 1) * pageSize;
    let selectOptions = {
      offset,
      limit: parseInt(pageSize),
      where: {
        status: "approved",
        isPublic: true,
        answer: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] },
      },
      attributes: publicAttributes,
      order: [["answerTime", "DESC"], ["createTime", "DESC"]],
    };
    if (options.order) {
      selectOptions.order = JSON.parse(options.order);
    }
    delete options.order;
    applyQuestionFilters(selectOptions, options);
    return await Question.findAndCountAll(selectOptions);
  },

  updateQuestion: async (question) => {
    const currentQuestion = await Question.findByPk(question.id);
    if (!currentQuestion) {
      throw new Error("问答不存在或已删除🤷‍♂️");
    }
    const nextQuestion = { ...currentQuestion.get({ plain: true }), ...question };
    if (nextQuestion.isPublic && nextQuestion.status !== "approved") {
      throw new Error("问答必须审核通过后才能公开展示");
    }
    if (nextQuestion.isPublic && utils.isNullOrEmpty(nextQuestion.answer)) {
      throw new Error("问答必须完成回答后才能公开展示");
    }
    if (!utils.isNullOrEmpty(question.answer) && utils.isNullOrEmpty(currentQuestion.answerTime)) {
      question.answerTime = new Date();
    }
    return await Question.update(question, { where: { id: question.id } });
  },

  deleteQuestionById: async (id) => {
    return await Question.destroy({ where: { id } });
  },
};
