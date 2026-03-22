const Lecture = require("../models/Lecture");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");

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
    return next(new ErrorResponse(`未找到ID为 ${req.params.id} 的讲座`, 404));
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
  // 白名单过滤，防止 Mass Assignment
  const {
    title,
    description,
    speaker,
    lectureTime,
    location,
    category,
    maxAttendees,
    coverImage,
  } = req.body;
  const lectureData = {
    title,
    description,
    speaker,
    lectureTime,
    location,
    category,
    maxAttendees,
    coverImage,
  };
  const lecture = await Lecture.create(lectureData);

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
    return next(new ErrorResponse(`未找到ID为 ${req.params.id} 的讲座`, 404));
  }

  // 白名单过滤更新字段
  const {
    title,
    description,
    speaker,
    lectureTime,
    location,
    category,
    maxAttendees,
    coverImage,
  } = req.body;
  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (speaker !== undefined) updateData.speaker = speaker;
  if (lectureTime !== undefined) updateData.lectureTime = lectureTime;
  if (location !== undefined) updateData.location = location;
  if (category !== undefined) updateData.category = category;
  if (maxAttendees !== undefined) updateData.maxAttendees = maxAttendees;
  if (coverImage !== undefined) updateData.coverImage = coverImage;

  lecture = await Lecture.findByIdAndUpdate(req.params.id, updateData, {
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
    return next(new ErrorResponse(`未找到ID为 ${req.params.id} 的讲座`, 404));
  }

  // TODO: 检查用户是否有权限删除

  await lecture.deleteOne(); // Mongoose v6+ use deleteOne()

  res.status(200).json({
    success: true,
    data: {},
  });
});
