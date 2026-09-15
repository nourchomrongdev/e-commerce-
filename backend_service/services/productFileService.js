const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const storageDirectory = path.resolve(__dirname, "../uploads/products");

async function saveProductFile(dataUrl, fileName, mimeType) {
  const match = String(dataUrl || "").match(/^data:[^;]+;base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error("Invalid product file data.");
  const buffer = Buffer.from(match[1], "base64");
  if (!buffer.length || buffer.length > 10 * 1024 * 1024) throw new Error("Product files must be smaller than 10 MB.");
  const extension = path.extname(String(fileName || "")).toLowerCase().replace(/[^a-z0-9.]/g, "") || ".bin";
  const storageKey = `${crypto.createHash("sha256").update(buffer).digest("hex")}${extension}`;
  await fs.mkdir(storageDirectory, { recursive: true });
  await fs.writeFile(path.join(storageDirectory, storageKey), buffer, { flag: "a" });
  return { fileName: String(fileName || storageKey).slice(0, 255), storageKey, fileSize: buffer.length, mimeType: String(mimeType || "application/octet-stream") };
}

module.exports = { saveProductFile };
