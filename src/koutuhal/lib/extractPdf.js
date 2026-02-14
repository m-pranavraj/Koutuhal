// Standalone PDF text extractor — runs outside Next.js/Webpack
// Usage: node lib/extractPdf.js <path-to-pdf>

const fs = require("fs");
const pdfParse = require("pdf-parse");

const filePath = process.argv[2];
if (!filePath) {
  process.stderr.write("No file path provided\n");
  process.exit(1);
}

const buffer = fs.readFileSync(filePath);
pdfParse(buffer)
  .then((data) => {
    process.stdout.write(data.text || "");
  })
  .catch((err) => {
    process.stderr.write("PDF parse error: " + err.message + "\n");
    process.exit(1);
  });
