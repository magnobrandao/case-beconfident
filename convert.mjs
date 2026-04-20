import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

const pdfPath = 'c:/Users/magno/Downloads/case_beconfident_completo.pdf';
const data = new Uint8Array(fs.readFileSync(pdfPath));
const doc = await getDocument({ data }).promise;

console.log(`Total pages: ${doc.numPages}`);

for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i);
  const viewport = page.getViewport({ scale: 2.0 });
  
  // Get text content with positions
  const textContent = await page.getTextContent();
  const items = textContent.items.map(item => ({
    text: item.str,
    x: Math.round(item.transform[4]),
    y: Math.round(viewport.height - item.transform[5]),
    fontSize: Math.round(item.transform[0]),
    fontName: item.fontName
  }));
  
  fs.writeFileSync(`c:/Users/magno/Downloads/pdf-beconfident/page_${i}.json`, JSON.stringify(items, null, 2));
  console.log(`Page ${i}: ${items.length} text items extracted`);
}
