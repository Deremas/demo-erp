type PdfPage = {
  ops: string[];
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;

function escapePdfText(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
}

function textOp(x: number, y: number, text: string, size = 10, bold = false) {
  const font = bold ? "/F2" : "/F1";
  return `BT ${font} ${size} Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${escapePdfText(text)}) Tj ET`;
}

function textOpWithGray(x: number, y: number, text: string, size = 10, bold = false, gray = 0) {
  const font = bold ? "/F2" : "/F1";
  return `q ${gray.toFixed(2)} g BT ${font} ${size} Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${escapePdfText(text)}) Tj ET Q`;
}

function rotatedTextOp(x: number, y: number, text: string, angleDegrees: number, size = 10, bold = false, gray = 0) {
  const font = bold ? "/F2" : "/F1";
  const radians = (angleDegrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return `q ${gray.toFixed(2)} g BT ${font} ${size} Tf ${cos.toFixed(4)} ${sin.toFixed(4)} ${(-sin).toFixed(4)} ${cos.toFixed(4)} ${x.toFixed(2)} ${y.toFixed(2)} Tm (${escapePdfText(text)}) Tj ET Q`;
}

function lineOp(x1: number, y1: number, x2: number, y2: number) {
  return `${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`;
}

function rectangleOp(x: number, y: number, width: number, height: number) {
  return `${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re S`;
}

function filledRectangleOp(x: number, y: number, width: number, height: number, gray = 0.95) {
  return `q ${gray.toFixed(2)} g ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re f Q`;
}

function wrapText(text: string, maxChars: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

export function makeTextLine(x: number, y: number, text: string, size = 10, bold = false) {
  return textOp(x, y, text, size, bold);
}

export function makeGrayTextLine(x: number, y: number, text: string, size = 10, bold = false, gray = 0.45) {
  return textOpWithGray(x, y, text, size, bold, gray);
}

export function makeRotatedTextLine(
  x: number,
  y: number,
  text: string,
  angleDegrees: number,
  size = 10,
  bold = false,
  gray = 0.9,
) {
  return rotatedTextOp(x, y, text, angleDegrees, size, bold, gray);
}

export function makeRule(x1: number, y1: number, x2: number, y2: number) {
  return lineOp(x1, y1, x2, y2);
}

export function makeBox(x: number, y: number, width: number, height: number) {
  return rectangleOp(x, y, width, height);
}

export function makeFilledBox(x: number, y: number, width: number, height: number, gray = 0.95) {
  return filledRectangleOp(x, y, width, height, gray);
}

export function makeWrappedTextBlock(
  x: number,
  y: number,
  text: string,
  options?: { size?: number; bold?: boolean; maxChars?: number; lineGap?: number },
) {
  const size = options?.size ?? 10;
  const bold = options?.bold ?? false;
  const maxChars = options?.maxChars ?? 60;
  const lineGap = options?.lineGap ?? size + 2;
  return wrapText(text, maxChars).map((line, index) =>
    textOp(x, y - index * lineGap, line, size, bold),
  );
}

export function buildPdfBuffer(pages: PdfPage[], pageSize: { width: number; height: number } = { width: PAGE_WIDTH, height: PAGE_HEIGHT }) {
  const objects: { id: number; body: string }[] = [];
  const offsets: number[] = [];

  const catalogId = 1;
  const pagesId = 2;
  const fontRegularId = 3;
  const fontBoldId = 4;
  const firstContentId = 5;
  const firstPageId = firstContentId + pages.length;

  objects.push({ id: catalogId, body: `<< /Type /Catalog /Pages ${pagesId} 0 R >>` });
  objects.push({
    id: pagesId,
    body: `<< /Type /Pages /Kids [${pages.map((_, index) => `${firstPageId + index} 0 R`).join(" ")}] /Count ${pages.length} >>`,
  });
  objects.push({ id: fontRegularId, body: `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>` });
  objects.push({ id: fontBoldId, body: `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>` });

  pages.forEach((page, index) => {
    const contentId = firstContentId + index;
    const pageId = firstPageId + index;
    const stream = page.ops.join("\n");
    objects.push({
      id: contentId,
      body: `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`,
    });
    objects.push({
      id: pageId,
      body: `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageSize.width} ${pageSize.height}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`,
    });
  });

  let body = "%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n";
  for (const object of objects) {
    offsets.push(Buffer.byteLength(body, "latin1"));
    body += `${object.id} 0 obj\n${object.body}\nendobj\n`;
  }

  const xrefStart = Buffer.byteLength(body, "latin1");
  const size = Math.max(...objects.map((object) => object.id)) + 1;
  body += `xref\n0 ${size}\n0000000000 65535 f \n`;
  const offsetById = new Map(objects.map((object, index) => [object.id, offsets[index]]));
  for (let id = 1; id < size; id += 1) {
    const offset = offsetById.get(id) ?? 0;
    body += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  body += `trailer\n<< /Size ${size} /Root ${catalogId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(body, "latin1");
}

export function createPdfPages(
  buildPage: (page: { ops: string[]; y: number; pageNumber: number }) => void,
  pageSize: { width: number; height: number } = { width: PAGE_WIDTH, height: PAGE_HEIGHT },
) {
  const pages: PdfPage[] = [];
  const page: PdfPage = { ops: [] };
  pages.push(page);
  buildPage({
    ops: page.ops,
    y: pageSize.height - 42,
    pageNumber: 1,
  });
  return pages;
}

export { PAGE_WIDTH, PAGE_HEIGHT, wrapText };