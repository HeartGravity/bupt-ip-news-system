"""
  将 data/ 目录下的 .docx 法规文件转换为 ml/data/laws/*.txt
  用法: python ml/data/convert_docx.py
  """
from pathlib import Path
from docx import Document
import re

# data/ 目录（项目根目录下）
SRC_DIR = Path(__file__).resolve().parents[2] / "data"
DST_DIR = Path(__file__).resolve().parent / "laws"
DST_DIR.mkdir(exist_ok=True)

def docx_to_txt(docx_path: Path, txt_path: Path):
    doc = Document(docx_path)
    lines = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
    txt_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"  {docx_path.name} → {txt_path.name}  ({len(lines)} 段)")

files = list(SRC_DIR.glob("*.docx"))
print(f"找到 {len(files)} 个 docx 文件")
for f in files:
    out = DST_DIR / (f.stem + ".txt")
    docx_to_txt(f, out)
print("转换完成")