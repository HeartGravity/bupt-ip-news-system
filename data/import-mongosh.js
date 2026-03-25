// 用 mongosh 导入数据库（处理 Extended JSON 格式）
// 运行: mongosh --file data/import-mongosh.js
const fs = require('fs');

const dataDir = __dirname.replace(/\\/g, '/');
const db = connect('mongodb://localhost:27017/bupt-ip-news');

// 递归转换 MongoDB Extended JSON → 原生类型
function convert(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(convert);
  if (typeof obj !== 'object') return obj;

  // Extended JSON 类型转换
  if (obj['$oid']) return ObjectId(obj['$oid']);
  if (obj['$date']) return new Date(obj['$date']);
  if (obj['$numberInt']) return parseInt(obj['$numberInt']);
  if (obj['$numberLong']) return parseInt(obj['$numberLong']);
  if (obj['$numberDouble']) return parseFloat(obj['$numberDouble']);

  const result = {};
  for (const key of Object.keys(obj)) {
    result[key] = convert(obj[key]);
  }
  return result;
}

const collections = ['users', 'news', 'chathistories', 'lawdocs'];

collections.forEach(col => {
  const file = `${dataDir}/bupt_ip_news.${col}.json`;
  print(`正在导入 ${col}...`);

  const raw = fs.readFileSync(file, 'utf8');
  const docs = JSON.parse(raw).map(convert);

  db[col].drop();
  if (docs.length > 0) {
    // 分批插入，避免大数组问题
    const batch = 200;
    for (let i = 0; i < docs.length; i += batch) {
      db[col].insertMany(docs.slice(i, i + batch));
    }
  }
  print(`  ✓ ${col}: ${docs.length} 条`);
});

print('\n===== 导入完成 =====');
collections.forEach(col => {
  print(`  ${col}: ${db[col].countDocuments()} 条`);
});
