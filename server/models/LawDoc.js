const mongoose = require('mongoose');

const LawDocSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  title: { type: String, required: true },
  chunkIndex: { type: Number, default: 0 },
  chunkTotal: { type: Number, default: 1 },
  content: { type: String, required: true },
  importedAt: { type: Date, default: Date.now },
});

LawDocSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('LawDoc', LawDocSchema);
