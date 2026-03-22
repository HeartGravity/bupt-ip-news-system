// 按分类轮换分配封面图（每个分类15张图片轮换）
const fs = require('fs');
const path = require('path');

const newsFile = path.join(__dirname, 'bupt_ip_news.news.json');
const news = JSON.parse(fs.readFileSync(newsFile, 'utf8'));

// 分类 → 图片前缀（每个分类有 prefix-1.jpg ~ prefix-15.jpg）
const categoryPrefixMap = {
  '专利法规': 'patent-law',
  '专利申请': 'patent-app',
  '专利案例': 'patent-case',
  '商标法规': 'trademark',
  '著作权法规': 'copyright',
  '国际知识产权': 'intl-ip',
  '知识产权保护': 'ip-protect',
  '知识产权动态': 'ip-news',
};

// 每个分类的计数器
const counters = {};

let updated = 0;

news.forEach((article) => {
  const cat = article.category;
  const prefix = categoryPrefixMap[cat];

  if (!prefix) {
    article.coverImage = 'default-news.jpg';
    updated++;
    return;
  }

  // 计数器递增，1-15 轮换
  counters[cat] = ((counters[cat] || 0) % 15) + 1;
  article.coverImage = `${prefix}-${counters[cat]}.jpg`;
  updated++;
});

// 统计
const result = {};
news.forEach(n => {
  const img = n.coverImage || 'default-news.jpg';
  result[img] = (result[img] || 0) + 1;
});

console.log(`已更新 ${updated} 条新闻的封面图`);
console.log(`共使用 ${Object.keys(result).length} 张不同的图片`);
console.log('\n每个分类的分配情况:');
Object.entries(categoryPrefixMap).forEach(([cat, prefix]) => {
  const count = news.filter(n => n.category === cat).length;
  const imgs = new Set(news.filter(n => n.category === cat).map(n => n.coverImage));
  console.log(`  ${cat}: ${count}篇 → ${imgs.size}张不同图片`);
});

fs.writeFileSync(newsFile, JSON.stringify(news, null, 2), 'utf8');
console.log(`\n已保存到 ${newsFile}`);
