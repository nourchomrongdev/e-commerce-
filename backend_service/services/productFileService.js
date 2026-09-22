const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const storageDirectory = path.resolve(__dirname, "../uploads/products");

async function saveProductFile(dataUrl, fileName, mimeType, storefrontKey = "default") {
  const match = String(dataUrl || "").match(/^data:[^;]+;base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error("Invalid product file data.");
  const buffer = Buffer.from(match[1], "base64");
  if (!buffer.length) throw new Error("Product file data is empty.");
  const extension = path.extname(String(fileName || "")).toLowerCase().replace(/[^a-z0-9.]/g, "") || ".bin";
  const digest = crypto.createHash("sha256").update(`${String(storefrontKey)}:`).update(buffer).digest("hex");
  const storageKey = `${digest}${extension}`;
  await fs.mkdir(storageDirectory, { recursive: true, mode: 0o700 });
  await fs.chmod(storageDirectory, 0o700);
  await fs.writeFile(path.join(storageDirectory, storageKey), buffer, { flag: "a", mode: 0o600 });
  await fs.chmod(path.join(storageDirectory, storageKey), 0o600);
  return { fileName: String(fileName || storageKey).slice(0, 255), storageKey, fileSize: buffer.length, mimeType: String(mimeType || "application/octet-stream") };
}

module.exports = { saveProductFile };
