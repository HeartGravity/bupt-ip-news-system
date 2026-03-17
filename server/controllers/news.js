const News = require('../models/News');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// 转义正则表达式特殊字符，防止 ReDoS 攻击
const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    获取所有新闻
// @route   GET /api/news
// @access  Public
exports.getNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const category = req.query.category;
    const tag = req.query.tag;

    // 构建查询条件
    const query = {};
    if (category) query.category = category;
    if (tag) query.tags = tag;

    // 执行查询
    const count = await News.countDocuments(query);
    const news = await News.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('author', 'username');

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: news
    });
  } catch (err) {
    console.error('获取新闻列表错误:', err.message);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// @desc    获取单个新闻
// @route   GET /api/news/:id
// @access  Public
exports.getNewsById = async (req, res) => {
  try {
    // 检查ID格式是否有效
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.error('无效的新闻ID格式:', req.params.id);
      return res.status(400).json({
        success: false,
        message: '无效的新闻ID格式'
      });
    }

    const news = await News.findById(req.params.id)
      .populate('author', 'username')
      .populate('comments.user', 'username');

    if (!news) {
      console.error('未找到新闻，ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: '未找到该新闻'
      });
    }

    // 更新浏览次数（原子操作，避免竞态条件）
    await News.updateOne({ _id: news._id }, { $inc: { views: 1 } });

    res.status(200).json({
      success: true,
      data: news
    });
  } catch (err) {
    console.error('获取单个新闻错误:', err.message, '新闻ID:', req.params.id);
    res.status(500).json({
      success: false,
      message: '服务器错误，无法获取新闻详情'
    });
  }
};

// @desc    创建新闻
// @route   POST /api/news
// @access  Private (Admin)
exports.createNews = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    // 白名单过滤，防止 Mass Assignment
    const { title, summary, content, category, tags, coverImage, publishDate } = req.body;
    const newsData = { title, summary, content, category, tags, coverImage, publishDate, author: req.user.id };

    const news = await News.create(newsData);

    res.status(201).json({
      success: true,
      data: news
    });
  } catch (err) {
    console.error('创建新闻错误:', err.message);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// @desc    更新新闻
// @route   PUT /api/news/:id
// @access  Private (Admin)
exports.updateNews = async (req, res) => {
  try {
    let news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: '未找到该新闻'
      });
    }

    // 白名单过滤更新字段，防止 Mass Assignment
    const { title, summary, content, category, tags, coverImage, publishDate } = req.body;
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (summary !== undefined) updateData.summary = summary;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (publishDate !== undefined) updateData.publishDate = publishDate;

    // 更新新闻
    news = await News.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: news
    });
  } catch (err) {
    console.error('更新新闻错误:', err.message);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// @desc    删除新闻
// @route   DELETE /api/news/:id
// @access  Private (Admin)
exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: '未找到该新闻'
      });
    }

    await news.deleteOne();

    res.status(200).json({
      success: true,
      message: '新闻已删除'
    });
  } catch (err) {
    console.error('删除新闻错误:', err.message);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// @desc    搜索新闻
// @route   GET /api/news/search
// @access  Public
exports.searchNews = async (req, res) => {
  try {
    const { q, category, tag } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    let query = {};
    let sortOptions = { createdAt: -1 }; // 默认按创建时间降序排序
    let projection = undefined;
    let searchMethod = "basic";

    // 1. 应用基础过滤条件 (分类, 标签)
    if (category) query.category = category;
    if (tag) query.tags = { $in: [tag] }; // 假设 tags 是数组

    // 存储基础过滤条件，供后续使用
    const baseFilters = { ...query };

    // 2. 如果有搜索关键词，构建搜索查询
    if (q && q.trim() !== '') {
      const trimmedQuery = q.trim();

      // 只有当搜索词长度 >= 2 时才尝试全文搜索
      if (trimmedQuery.length >= 2) {
        try {
          // 构建包含基础过滤和文本搜索的查询
          const textQuery = { 
            ...baseFilters, // 合并基础过滤
            $text: { $search: trimmedQuery } 
          };
          
          // 尝试执行一次 count 来判断是否使用全文搜索
          // 这可以避免在没有结果时仍然尝试按 score 排序
          const textSearchCount = await News.countDocuments(textQuery);

          if (textSearchCount > 0) {
            searchMethod = "fulltext";
            query = textQuery; // 使用包含 $text 的完整查询
            sortOptions = { score: { $meta: "textScore" } }; // 按相关度排序
            projection = { score: { $meta: "textScore" } }; // 必须投影 score 才能排序
          } else {
            // 全文搜索无结果，回退到正则
            searchMethod = "regex";
            const regex = new RegExp(escapeRegExp(trimmedQuery), 'i');
            query = {
              ...baseFilters,
              $or: [
                { title: regex }, { content: regex }, { summary: regex }, { tags: regex }
              ]
            };
            // sortOptions 和 projection 保持默认 (按时间排序，无特殊投影)
          }
        } catch (err) {
          // 全文搜索失败 (例如无索引)，回退到正则
          searchMethod = "regex (fallback)";
          const regex = new RegExp(escapeRegExp(trimmedQuery), 'i');
          query = {
            ...baseFilters,
            $or: [
              { title: regex }, { content: regex }, { summary: regex }, { tags: regex }
            ]
          };
        }
      } else {
        // 搜索词太短，直接使用正则
        searchMethod = "regex (short query)";
        const regex = new RegExp(escapeRegExp(trimmedQuery), 'i');
        query = {
          ...baseFilters,
          $or: [
            { title: regex }, { content: regex }, { summary: regex }, { tags: regex }
          ]
        };
      }
    } else {
      // 没有关键词，仅使用基础过滤
      searchMethod = "basic";
      query = baseFilters; // 使用基础过滤
    }

    // 3. 执行最终查询 (使用构建好的 query, projection, sortOptions)
    const count = await News.countDocuments(query);
    const news = await News.find(query, projection)
      .sort(sortOptions)
      .skip(startIndex)
      .limit(limit)
      .populate('author', 'username');

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: news,
      searchMethod
    });

  } catch (err) {
    console.error('搜索新闻错误:', err.message);
    // 可以在这里记录更详细的错误信息，例如查询条件 query
    // console.error('出错时的查询条件:', JSON.stringify(query)); 
    res.status(500).json({
      success: false,
      message: '服务器错误，无法执行搜索'
    });
  }
};

// @desc    添加评论
// @route   POST /api/news/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: '未找到该新闻'
      });
    }

    const { text } = req.body;

    const newComment = {
      user: req.user.id,
      text,
      createdAt: new Date()
    };

    news.comments.push(newComment);
    await news.save();

    // 返回新评论（包含用户信息）
    const addedComment = news.comments[news.comments.length - 1];
    await news.populate('comments.user', 'username avatar');

    res.status(201).json({
      success: true,
      data: addedComment
    });
  } catch (err) {
    console.error('添加评论错误:', err.message);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// @desc    点赞新闻
// @route   PUT /api/news/:id/like
// @access  Private
exports.likeNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: '未找到该新闻'
      });
    }

    // 使用原子操作增加点赞数，避免竞态条件
    const updatedNews = await News.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      likes: updatedNews.likes,
      message: '点赞成功'
    });

  } catch (err) {
    console.error('点赞新闻错误:', err.message);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// @desc    收藏新闻
// @route   PUT /api/news/:id/favorite
// @access  Private
exports.favoriteNews = async (req, res) => {
  try {
    const newsId = req.params.id;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const news = await News.findById(newsId);

    if (!user) {
      return res.status(404).json({ success: false, message: '用户未找到' });
    }
    if (!news) {
      return res.status(404).json({ success: false, message: '新闻未找到' });
    }

    // 确保用户的 favorites 字段是数组
    if (!Array.isArray(user.favorites)) {
      user.favorites = [];
    }

    const isFavorited = user.favorites.some(favId => favId.equals(newsId));
    let updatedUser;

    if (isFavorited) {
      // 取消收藏
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { favorites: newsId } },
        { new: true }
      );
    } else {
      // 添加收藏
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { favorites: newsId } }, // 使用 $addToSet 防止重复添加
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      isFavorite: !isFavorited, // 返回操作后的状态
      message: !isFavorited ? '收藏成功' : '已取消收藏',
      favorites: updatedUser.favorites // 可选：返回更新后的收藏列表
    });

  } catch (err) {
    console.error('收藏/取消收藏新闻错误:', err.message);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
}; 