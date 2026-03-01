const express = require("express");
const router = express.Router();

// 引入你的权限保护中间件（请确认 ../middleware/auth 中确实实现了这两个）
const { protect, authorize } = require("../middleware/auth");
const { getAiAnalytics } = require("../controllers/adminAnalyticsController");

// 只有管理员 (admin) 或者对应角色的用户才能访问分析接口
router.use(protect);
router.use(authorize("admin"));

router.route("/analytics/ai").get(getAiAnalytics);

module.exports = router;
