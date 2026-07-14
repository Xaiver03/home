var express = require("express");
var router = express.Router();
const questionController = require("../controller/questionController");
var { checkPermissions } = require("../middlewares/auth");
var { limitCustomerAction } = require("../middlewares/rateLimit");

// 公用
router.post(
  "/reception/addQuestion",
  limitCustomerAction(3, 600, "customer_add_question", {
    message: "触发限制啦⛔️",
    description: "匿名提问过于频繁，触发防脚本🤖，请稍后重试",
  }),
  questionController.createQuestion
);
router.post(
  "/reception/getQuestionByTrackingCode",
  limitCustomerAction(20, 600, "customer_query_question", {
    message: "触发限制啦⛔️",
    description: "查询过于频繁，请稍后重试",
  }),
  questionController.getQuestionByTrackingCode
);
router.post(
  "/reception/searchPublicQuestion",
  questionController.searchPublicQuestion
);

// 后台
router.get(
  "/getAllQuestion/:currentPage/:pageSize",
  checkPermissions(),
  questionController.getAllQuestion
);
router.post("/searchQuestion", checkPermissions(), questionController.searchQuestion);
router.post("/updateQuestion", checkPermissions(), questionController.updateQuestion);
router.delete("/deleteQuestion", checkPermissions(), questionController.deleteQuestionById);

module.exports = router;
