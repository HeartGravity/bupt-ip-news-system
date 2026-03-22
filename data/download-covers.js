/**
 * 从 LoremFlickr 为每个新闻分类批量下载相关图片
 * 运行: node data/download-covers.js
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const COVERS_DIR = path.join(__dirname, '..', 'client', 'public', 'Images', 'covers');
const IMAGES_PER_CATEGORY = 15;

// 每个分类对应多组关键词（增加图片多样性）
const CATEGORY_KEYWORDS = {
  '专利法规': [
    'law,legislation',
    'legal,document',
    'gavel,justice',
    'parliament,government',
    'contract,signing',
  ],
  '专利申请': [
    'technology,research',
    'laboratory,science',
    'engineering,blueprint',
    'invention,prototype',
    'microscope,research',
  ],
  '专利案例': [
    'courtroom,trial',
    'judge,court',
    'lawyer,attorney',
    'courthouse,building',
    'law,justice',
  ],
  '商标法规': [
    'brand,business',
    'marketing,advertising',
    'shopping,retail',
    'logo,design',
    'store,commercial',
  ],
  '著作权法规': [
    'books,library',
    'writing,pen',
    'music,art',
    'cinema,film',
    'painting,creative',
  ],
  '国际知识产权': [
    'globe,world',
    'international,trade',
    'diplomacy,summit',
    'flags,nations',
    'handshake,business',
  ],
  '知识产权保护': [
    'security,lock',
    'shield,protection',
    'cybersecurity,digital',
    'safe,vault',
    'privacy,data',
  ],
  '知识产权动态': [
    'newspaper,media',
    'conference,meeting',
    'office,workspace',
    'presentation,seminar',
    'city,skyline',
  ],
};

// 分类名 → 文件名前缀映射
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

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const doRequest = (reqUrl, redirects = 0) => {
      if (redirects > 5) return reject(new Error('Too many redirects'));
      const mod = reqUrl.startsWith('https') ? https : http;
      mod.get(reqUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          let loc = res.headers.location;
          if (loc.startsWith('/')) loc = `https://loremflickr.com${loc}`;
          return doRequest(loc, redirects + 1);
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
        file.on('error', reject);
      }).on('error', reject);
    };
    doRequest(url);
  });
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const categories = Object.keys(CATEGORY_KEYWORDS);
  let totalDownloaded = 0;
  let totalFailed = 0;

  for (const cat of categories) {
    const prefix = CATEGORY_PREFIX[cat];
    const keywords = CATEGORY_KEYWORDS[cat];
    console.log(`\n[${cat}] 下载中... (前缀: ${prefix})`);

    for (let i = 1; i <= IMAGES_PER_CATEGORY; i++) {
      const kw = keywords[(i - 1) % keywords.length];
      const lock = Math.floor((i - 1) / keywords.length) + 1;
      const url = `https://loremflickr.com/800/400/${kw}?lock=${lock + i * 7}`;
      const filename = `${prefix}-${i}.jpg`;
      const dest = path.join(COVERS_DIR, filename);

      // 跳过已存在的文件
      if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) {
        console.log(`  ✓ ${filename} (已存在，跳过)`);
        totalDownloaded++;
        continue;
      }

      try {
        await downloadFile(url, dest);
        const size = fs.statSync(dest).size;
        if (size < 5000) {
          fs.unlinkSync(dest);
          throw new Error('文件太小，可能不是有效图片');
        }
        console.log(`  ✓ ${filename} (${Math.round(size / 1024)}KB)`);
        totalDownloaded++;
      } catch (e) {
        console.log(`  ✗ ${filename} 失败: ${e.message}`);
        totalFailed++;
      }

      // 避免请求太快
      await sleep(500);
    }
  }

  console.log(`\n===== 下载完成 =====`);
  console.log(`成功: ${totalDownloaded}, 失败: ${totalFailed}`);
  console.log(`图片目录: ${COVERS_DIR}`);
}

main().catch(console.error);
