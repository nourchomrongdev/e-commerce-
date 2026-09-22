const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const storageDirectory = path.resolve(__dirname, "../uploads/storefronts");
const encryptionKey = crypto.createHash("sha256").update(process.env.JWT_SECRET || "local-development-secret-change-me").digest();
const supportedTypes = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
]);

function storedFileName(value) {
  if (typeof value !== "string") return null;
  let pathname = value;
  try {
    pathname = new URL(value).pathname;
  } catch {}
  const match = pathname.match(/^\/api\/media\/storefronts\/([a-f0-9]{64}\.(png|jpg|webp))$/);
  return match?.[1] || null;
}

function isStoredImageUrl(value) {
  return Boolean(storedFileName(value));
}

function parseDataUrl(value) {
  const match = String(value || "").match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error("Store logo must be a PNG, JPG, or WEBP image.");
  const extension = supportedTypes.get(match[1]);
  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length || buffer.length > 2 * 1024 * 1024) throw new Error("Store logo must be smaller than 2MB.");
  return { buffer, mimeType: match[1], extension };
}

async function saveEncryptedImage(dataUrl, storefrontKey = "default") {
  if (isStoredImageUrl(dataUrl)) return dataUrl;
  const { buffer, mimeType, extension } = parseDataUrl(dataUrl);
  const digest = crypto.createHash("sha256").update(`${String(storefrontKey)}:`).update(buffer).digest("hex");
  const fileName = `${digest}.${extension}`;
  const filePath = path.join(storageDirectory, `${fileName}.enc`);

  await fs.mkdir(storageDirectory, { recursive: true, mode: 0o700 });
  await fs.chmod(storageDirectory, 0o700);
  try {
    await fs.access(filePath);
  } catch {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const envelope = JSON.stringify({
      version: 1,
      mimeType,
      iv: iv.toString("base64"),
      tag: cipher.getAuthTag().toString("base64"),
      data: encrypted.toString("base64"),
    });
    await fs.writeFile(filePath, envelope, { flag: "wx", mode: 0o600 });
  }
  await fs.chmod(filePath, 0o600);

  return `/api/media/storefronts/${fileName}`;
}

async function readEncryptedImage(fileName) {
  if (!/^[a-f0-9]{64}\.(png|jpg|webp)$/.test(fileName)) throw new Error("Invalid image name");
  const envelope = JSON.parse(await fs.readFile(path.join(storageDirectory, `${fileName}.enc`), "utf8"));
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey, Buffer.from(envelope.iv, "base64"));
  decipher.setAuthTag(Buffer.from(envelope.tag, "base64"));
  return { mimeType: envelope.mimeType, buffer: Buffer.concat([decipher.update(Buffer.from(envelope.data, "base64")), decipher.final()]) };
}

async function deleteEncryptedImage(imageUrl) {
  if (!isStoredImageUrl(imageUrl)) return;
  const fileName = storedFileName(imageUrl);
  await fs.rm(path.join(storageDirectory, `${fileName}.enc`), { force: true });
}

module.exports = { deleteEncryptedImage, isStoredImageUrl, readEncryptedImage, saveEncryptedImage };
