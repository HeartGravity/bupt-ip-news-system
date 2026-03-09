const axios = require("axios");
const cheerio = require("cheerio");
const connectDB = require("../db");
const User = require("../models/User");
const News = require("../models/News");

const BASE_URL = "https://www.cnipa.gov.cn";
const DATAPROXY_URL = `${BASE_URL}/module/web/jpage/dataproxy.jsp`;
const PER_PAGE = 15; // dataproxy 接口每页固定 15 条
const FETCH_PAGES = 60; // 爬取页数（34 页 × 15 = 510 条），最大 163 页(共 2443 条)
const PICK_TOTAL = 2000; // 从获取的文章中随机抽取数量

const VALID_CATEGORIES = [
  "专利法规",
  "商标法规",
  "著作权法规",
  "知识产权保护",
  "专利申请",
  "专利案例",
  "知识产权动态",
  "国际知识产权",
];

const DELAY_MS = 1000; // 每次请求之间的延迟，避免被封

function randomCategory() {
  return VALID_CATEGORIES[Math.floor(Math.random() * VALID_CATEGORIES.length)];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 从数组中随机选取 n 个元素（不重复）
function pickRandom(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function normalizeDate(rawDate) {
  if (!rawDate) return new Date();
  const dt = new Date(rawDate);
  return isNaN(dt.getTime()) ? new Date() : dt;
}

function stripHtml(html = "") {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text = "", max = 500) {
  const clean = String(text).replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1)}…`;
}

const httpClient = axios.create({
  timeout: 20000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML,like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9",
    Referer: BASE_URL,
  },
});

// 通过 dataproxy 接口获取指定页的文章链接列表（每页 15 条）
async function fetchPageLinks(pageNum = 1) {
  const start = (pageNum - 1) * PER_PAGE + 1;
  const end = pageNum * PER_PAGE;
  const url = `${DATAPROXY_URL}?startrecord=${start}&endrecord=${end}&perpage=${PER_PAGE}&webid=1&path=%2Fcol%2Fcol55%2F&columnid=55&unitid=669&webname=&permcolumnid=55&otype=title&dtype=`;
  const res = await httpClient.get(url);
  const html = res.data;

  const items = [];

  // dataproxy 接口直接返回 XML，每条 <record> 包含 CDATA
  const xmlScript = html;

  // 提取所有 <record><![CDATA[...]]></record> 块
  const recordRegex = /<record><!\[CDATA\[([\s\S]*?)\]\]><\/record>/g;
  let match;
  while ((match = recordRegex.exec(xmlScript)) !== null) {
    const fragment = match[1];
    const $frag = cheerio.load(fragment);
    const $a = $frag("a").first();
    const href = $a.attr("href");
    const title = $a.text().trim();
    const dateText = $frag("span").last().text().trim();

    if (href && title && title.length > 2) {
      // /col/colXX/art/... 需去掉 /col/colXX 前缀，否则服务器返回 404
      const cleanHref = href.replace(/^\/col\/col\d+/, "");
      const fullUrl = cleanHref.startsWith("http")
        ? cleanHref
        : `${BASE_URL}${cleanHref}`;
      items.push({ title, url: fullUrl, dateText });
    }
  }

  return items;
}

// 获取文章详情页内容
async function fetchArticleContent(articleUrl) {
  await sleep(DELAY_MS);
  const res = await httpClient.get(articleUrl);
  const html = res.data;

  const $ = cheerio.load(html);

  // 文章内容在 .article-content 内，ContentStart/ContentEnd 标记之间
  let rawContent = $(".article-content").html() || "";

  // 获取发布日期：.article-info 内 span 文本，格式"发布时间：2026-03-06"
  let dateText = "";
  $(".article-info span").each((i, el) => {
    const text = $(el).text().trim();
    if (text.includes("发布时间")) {
      dateText = text.replace("发布时间：", "").trim();
      return false; // break
    }
  });

  // 清理 script/style 标签
  rawContent = rawContent
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");

  // 去掉 HTML 注释（包含 begin-->/end--> 等标记）
  rawContent = rawContent.replace(/<!--[\s\S]*?-->/g, "");

  // 清理多余空行
  rawContent = rawContent.replace(/(\s*\n){3,}/g, "\n\n").trim();

  return { htmlContent: rawContent, dateText };
}

async function run() {
  await connectDB();

  const admin = await User.findOne({ role: "admin" }).select("_id").lean();
  const fallback = await User.findOne().select("_id").lean();
  const authorId = admin?._id || fallback?._id;

  if (!authorId) {
    throw new Error("未找到可用用户，请先运行 seed.js 创建用户。");
  }

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`\n正在获取文章列表（共抓取 ${FETCH_PAGES} 页）...`);

  let allLinks = [];
  try {
    for (let p = 1; p <= FETCH_PAGES; p++) {
      const links = await fetchPageLinks(p);
      allLinks = allLinks.concat(links);
      process.stdout.write(
        `\r  已获取第 ${p}/${FETCH_PAGES} 页，共 ${allLinks.length} 条`,
      );
      if (links.length < PER_PAGE) break; // 已到最后一页
      await sleep(500);
    }
    console.log();
    if (allLinks.length === 0) {
      console.warn(`  未找到文章链接`);
      process.exit(0);
    }
  } catch (err) {
    console.warn(`  列表获取失败: ${err.message}`);
    process.exit(1);
  }

  // 随机选取（若不足则全取）
  const selected = pickRandom(allLinks, Math.min(PICK_TOTAL, allLinks.length));
  console.log(`  共找到 ${allLinks.length} 条，随机选取 ${selected.length} 条`);

  for (const item of selected) {
    try {
      // 去重检查
      const existing = await News.findOne({ title: item.title }).lean();
      if (existing) {
        console.log(`  [跳过] ${item.title}`);
        skipped++;
        continue;
      }

      const { htmlContent, dateText } = await fetchArticleContent(item.url);

      if (!htmlContent || htmlContent.length < 20) {
        console.warn(`  [内容过短，跳过] ${item.title}`);
        skipped++;
        continue;
      }

      const plainText = stripHtml(htmlContent);
      const publishDate = normalizeDate(dateText || item.dateText);

      const newsDoc = {
        title: truncate(item.title, 200),
        summary: truncate(plainText, 100),
        content: truncate(htmlContent, 50000),
        category: randomCategory(),
        tags: [],
        coverImage: "",
        publishDate,
        author: authorId,
      };

      await News.create(newsDoc);
      console.log(`  [新增] ${item.title}`);
      inserted++;
    } catch (err) {
      console.warn(`  [失败] ${item.title}: ${err.message}`);
      failed++;
    }
  }

  console.log("\n========== 爬取完成 ==========");
  console.log(`新增: ${inserted}`);
  console.log(`跳过: ${skipped}`);
  console.log(`失败: ${failed}`);
  process.exit(0);
}

run().catch((err) => {
  console.error(`爬虫任务失败: ${err.message}`);
  process.exit(1);
});
