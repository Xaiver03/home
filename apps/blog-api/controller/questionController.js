const utils = require("../utils/index");
const questionService = require("../services/questionService");

module.exports = {
  createQuestion: async (req, res) => {
    try {
      const trackingCode = await questionService.generateTrackingCode();
      const question = await questionService.createQuestion({
        trackingCode,
        question: req.body.question,
        nickname: req.body.nickname,
        contact: req.body.contact,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
      });
      res.json(
        utils.postMessage(
          undefined,
          {
            message: "提交成功✅",
            description: "请妥善保存追踪码，后续可凭此查询回答。内容审核通过后才可能公开展示。",
          },
          {
            trackingCode: question.trackingCode,
            status: question.status,
            createTime: question.createTime,
          }
        )
      );
    } catch (err) {
      res.json(utils.postMessage(-1, err.message, {}));
    }
  },

  getQuestionByTrackingCode: async (req, res) => {
    try {
      const trackingCode = String(req.body.trackingCode || "").trim().toUpperCase();
      if (utils.isNullOrEmpty(trackingCode)) {
        throw new Error("请输入追踪码");
      }
      const question = await questionService.getQuestionByTrackingCode(trackingCode);
      if (!question) {
        res.json(utils.postMessage(-1, "未查询到该追踪码，请检查后重试", {}));
        return;
      }
      res.json(utils.postMessage(undefined, "查询成功✅", question));
    } catch (err) {
      res.json(utils.postMessage(-1, err.message, {}));
    }
  },

  searchPublicQuestion: async (req, res) => {
    const options = req.body.data || {};
    res.json(
      await questionService.searchPublicQuestion(
        req.body.currentPage,
        req.body.pageSize,
        options
      )
    );
  },

  getAllQuestion: async (req, res) => {
    res.json(
      await questionService.getAllQuestion(
        req.params.currentPage,
        req.params.pageSize,
        req.query
      )
    );
  },

  searchQuestion: async (req, res) => {
    res.json(
      await questionService.searchQuestion(
        req.body.currentPage,
        req.body.pageSize,
        req.body.data
      )
    );
  },

  updateQuestion: async (req, res) => {
    try {
      res.json(
        utils.postMessage(
          undefined,
          "保存成功✅",
          await questionService.updateQuestion(req.body)
        )
      );
    } catch (err) {
      res.json(utils.postMessage(-1, err.message, {}));
    }
  },

  deleteQuestionById: async (req, res) => {
    try {
      res.json(
        utils.postMessage(
          undefined,
          "删除成功✅",
          await questionService.deleteQuestionById(req.query.id)
        )
      );
    } catch (err) {
      res.json(utils.postMessage(-1, err.message, {}));
    }
  },
};
