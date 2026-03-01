const Lecture = require('../models/Lecture');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    获取所有讲座
// @route   GET /api/lectures
// @access  Public
exports.getLectures = asyncHandler(async (req, res, next) => {
  const lectures = await Lecture.find().sort({ lectureTime: -1 }); // 按时间降序排序

  res.status(200).json({
    success: true,
    count: lectures.length,
    data: lectures,
  });
});

// @desc    获取单个讲座
// @route   GET /api/lectures/:id
// @access  Public
exports.getLecture = asyncHandler(async (req, res, next) => {
  const lecture = await Lecture.findById(req.params.id);

  if (!lecture) {
    return next(
      new ErrorResponse(`未找到ID为 ${req.params.id} 的讲座`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: lecture,
  });
});

// @desc    创建新讲座
// @route   POST /api/lectures
// @access  Private (需要管理员权限 - 后续添加)
exports.createLecture = asyncHandler(async (req, res, next) => {
  // TODO: 添加创建者信息 req.body.createdBy = req.user.id;
  const lecture = await Lecture.create(req.body);

  res.status(201).json({
    success: true,
    data: lecture,
  });
});

// @desc    更新讲座信息
// @route   PUT /api/lectures/:id
// @access  Private (需要管理员权限 - 后续添加)
exports.updateLecture = asyncHandler(async (req, res, next) => {
  let lecture = await Lecture.findById(req.params.id);

  if (!lecture) {
    return next(
      new ErrorResponse(`未找到ID为 ${req.params.id} 的讲座`, 404)
    );
  }

  // TODO: 检查用户是否有权限更新

  lecture = await Lecture.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: lecture,
  });
});

// @desc    删除讲座
// @route   DELETE /api/lectures/:id
// @access  Private (需要管理员权限 - 后续添加)
exports.deleteLecture = asyncHandler(async (req, res, next) => {
  const lecture = await Lecture.findById(req.params.id);

  if (!lecture) {
    return next(
      new ErrorResponse(`未找到ID为 ${req.params.id} 的讲座`, 404)
    );
  }

  // TODO: 检查用户是否有权限删除

  await lecture.deleteOne(); // Mongoose v6+ use deleteOne()

  res.status(200).json({
    success: true,
    data: {},
  });
}); 