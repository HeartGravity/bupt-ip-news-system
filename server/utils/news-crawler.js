const axios = require('axios');
const Parser = require('rss-parser');
const connectDB = require('../db');
const User = require('../models/User');
const News = require('../models/News');

const parser = new Parser({
  customFields: {
    item: ['description', 'summary']
  }
});

const VALID_CATEGORIES = new Set([
  '专利法规',
  '商标法规',
  '著作权法规',
  '知识产权保护',
  '专利申请',
  '专利案例',
  '知识产权动态',
  '国际知识产权'
]);

function parseArgs(argv) {
  const args = { maxPerSource: 30, dryRun: false };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--max-per-source') {
      const value = Number(argv[i + 1]);
      if (!Number.isNaN(value) && value > 0) {
        args.maxPerSource = value;
      }
      i += 1;
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    }
  }

  return args;
}

function truncate(text = '', max = 500) {
  const clean = String(text).replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}…`;
}

function stripHtml(input = '') {
  return String(input)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeDate(rawDate) {
  if (!rawDate) return new Date();
  const dt = new Date(rawDate);
  return Number.isNaN(dt.getTime()) ? new Date() : dt;
}

function ensureCategory(category) {
  if (VALID_CATEGORIES.has(category)) return category;
  return '知识产权动态';
}

function loadSourcesFromEnv() {
  // 通过 NEWS_FEEDS 传入抓取源配置，示例：
  // NEWS_FEEDS='[{"name":"WIPO News","url":"https://example.com/rss.xml","category":"国际知识产权","tags":["WIPO","国际"]}]'
  if (!process.env.NEWS_FEEDS) {
    throw new Error('缺少 NEWS_FEEDS 环境变量。请在 .env 中配置 RSS 源 JSON 数组。');
  }

  let sources;
  try {
    sources = JSON.parse(process.env.NEWS_FEEDS);
  } catch (err) {
    throw new Error(`NEWS_FEEDS 不是合法 JSON: ${err.message}`);
  }

  if (!Array.isArray(sources) || sources.length === 0) {
    throw new Error('NEWS_FEEDS 必须是非空数组。');
  }

  const normalized = sources.map((source, idx) => {
    if (!source || typeof source !== 'object') {
      throw new Error(`NEWS_FEEDS[${idx}] 必须是对象。`);
    }

    const { name, url, category, tags = [] } = source;

    if (!name || !url) {
      throw new Error(`NEWS_FEEDS[${idx}] 缺少 name 或 url。`);
    }

    return {
      name: String(name).trim(),
      url: String(url).trim(),
      category: ensureCategory(category),
      tags: Array.isArray(tags) ? tags.map(String).filter(Boolean) : []
    };
  });

  return normalized;
}

function buildNewsDoc(item, source, authorId) {
  const title = truncate(item.title || '未命名新闻', 200);
  const rawText = stripHtml(item.contentSnippet || item.summary || item.description || '');
  const summary = truncate(rawText || '暂无摘要', 500);

  const link = item.link ? String(item.link).trim() : '';
  const contentBody = rawText || summary;
  const content = link
    ? `# ${title}\n\n${contentBody}\n\n原文链接：${link}`
    : `# ${title}\n\n${contentBody}`;

  return {
    title,
    summary,
    content,
    category: source.category,
    tags: [...new Set([...source.tags, source.name])].slice(0, 15),
    publishDate: normalizeDate(item.isoDate || item.pubDate),
    coverImage: 'default-news.jpg',
    author: authorId
  };
}

async function fetchFeedItems(source) {
  try {
    const feed = await parser.parseURL(source.url);
    return feed.items || [];
  } catch (rssErr) {
    // 某些源会拦截默认 UA，回退到 axios 手动拉取
    const res = await axios.get(source.url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; bupt-ip-news-crawler/1.0)'
      }
    });
    const feed = await parser.parseString(res.data);
    return feed.items || [];
  }
}

async function upsertNews(newsDoc, dryRun) {
  const existing = await News.findOne({ title: newsDoc.title }).lean();
  if (existing) return { status: 'skipped' };

  if (dryRun) return { status: 'prepared' };

  await News.create(newsDoc);
  return { status: 'inserted' };
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const sources = loadSourcesFromEnv();

  await connectDB();

  const admin = await User.findOne({ role: 'admin' }).select('_id').lean();
  const fallbackUser = await User.findOne().select('_id').lean();
  const authorId = admin?._id || fallbackUser?._id;

  if (!authorId) {
    throw new Error('未找到可用用户，请先创建至少一个用户。');
  }

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const source of sources) {
    console.log(`\n[Source] ${source.name} - ${source.url}`);

    try {
      const items = await fetchFeedItems(source);
      const selected = items.slice(0, args.maxPerSource);

      for (const item of selected) {
        try {
          const newsDoc = buildNewsDoc(item, source, authorId);
          const result = await upsertNews(newsDoc, args.dryRun);
          if (result.status === 'inserted' || result.status === 'prepared') {
            inserted += 1;
          } else {
            skipped += 1;
          }
        } catch (itemErr) {
          failed += 1;
          console.warn(`  - 条目处理失败: ${itemErr.message}`);
        }
      }
    } catch (sourceErr) {
      failed += 1;
      console.warn(`  - 源抓取失败: ${sourceErr.message}`);
    }
  }

  console.log('\n抓取完成');
  console.log(`新增/预览: ${inserted}`);
  console.log(`跳过去重: ${skipped}`);
  console.log(`失败数量: ${failed}`);

  process.exit(0);
}

run().catch((err) => {
  console.error(`抓取任务失败: ${err.message}`);
  process.exit(1);
});
