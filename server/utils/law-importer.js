const path = require('path');
const fs = require('fs');
const mammoth = require('mammoth');
const connectDB = require('../db');
const LawDoc = require('../models/LawDoc');

const DATA_DIR = path.resolve(__dirname, '../../data');
const CHUNK_SIZE = 500; // 每段最大字符数
const CHUNK_OVERLAP = 50;

function chunkText(text, size, overlap) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + size));
    start += size - overlap;
  }
  return chunks;
}

async function importFile(filePath) {
  const filename = path.basename(filePath);
  const title = filename.replace(/\.docx$/i, '');

  const { value: rawText } = await mammoth.extractRawText({ path: filePath });
  const cleaned = rawText.replace(/\s+/g, ' ').trim();
  if (!cleaned) return 0;

  const chunks = chunkText(cleaned, CHUNK_SIZE, CHUNK_OVERLAP);

  await LawDoc.deleteMany({ filename });

  const docs = chunks.map((content, i) => ({
    filename,
    title,
    chunkIndex: i,
    chunkTotal: chunks.length,
    content,
  }));

  await LawDoc.insertMany(docs);
  return chunks.length;
}

async function run() {
  await connectDB();
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.docx'));
  let total = 0;
  for (const f of files) {
    const count = await importFile(path.join(DATA_DIR, f));
    console.log(`  [导入] ${f}  =>  ${count} 段`);
    total += count;
  }
  console.log(`\n导入完成，共 ${total} 段`);
  process.exit(0);
}

run().catch(err => {
  console.error('导入失败:', err.message);
  process.exit(1);
});
