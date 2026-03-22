/**
 * 重新分配封面图：使用新下载的120张图片
 * 运行: node data/reassign-covers.js
 */
const fs = require('fs');
const path = require('path');

const newsFile = path.join(__dirname, 'bupt_ip_news.news.json');
const news = JSON.parse(fs.readFileSync(newsFile, 'utf8'));

const CATEGORY_PREFIX = {
  '专利法规': 'patent-law',
  '专利申请': 'patent-app',
  '专利案例': 'patent-case',
  '商标法规': 'trademark',
  '著作权法规': 'copyright',
  '国际知识产权': 'intl-ip',
  '知识产权保护': 'ip-protect',
  '知识产权动态': 'ip-news',
};

const IMAGES_PER_CATEGORY = 15;

// 保留原始6条种子新闻的封面图不变
const SEED_IMAGES = new Set([
  'patent-law.jpg', 'huawei-5g.jpg', 'jordan-trademark.jpg',
  'china-us-trade.jpg', 'nft-copyright.jpg', 'ai-copyright.jpg',
]);

// 按分类分组并分配
const categoryCounters = {};
let updated = 0;

news.forEach((article) => {
  // 保留种子数据的原始封面图
  if (SEED_IMAGES.has(article.coverImage)) return;

  const cat = article.category;
  const prefix = CATEGORY_PREFIX[cat];
  if (!prefix) {
    article.coverImage = 'default-news.jpg';
    return;
  }

  if (!categoryCounters[cat]) categoryCounters[cat] = 0;
  categoryCounters[cat]++;

  const idx = ((categoryCounters[cat] - 1) % IMAGES_PER_CATEGORY) + 1;
  article.coverImage = `${prefix}-${idx}.jpg`;
  updated++;
});

// 统计
console.log(`已更新 ${updated} 条新闻的封面图`);
console.log('\n各分类分配情况:');
Object.entries(categoryCounters).forEach(([cat, count]) => {
  const prefix = CATEGORY_PREFIX[cat];
  console.log(`  ${cat}: ${count} 篇 → ${prefix}-1.jpg ~ ${prefix}-${IMAGES_PER_CATEGORY}.jpg`);
});

// 写回
fs.writeFileSync(newsFile, JSON.stringify(news, null, 2), 'utf8');
console.log(`\n已保存到 ${newsFile}`);
