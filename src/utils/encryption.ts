import crypto from "crypto";
const algorithm = "aes-256-cbc";

const getKey = () => {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY is not set in environment variables!");
  }

  return Buffer.from(process.env.ENCRYPTION_KEY, "hex");
};

export const encrypt = (text: string) => {
  const key = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    iv: iv.toString("hex"),
    content: encrypted,
  };
};

export const decrypt = (hash: { iv: string; content: string }) => {
  const key = getKey();
  const iv = Buffer.from(hash.iv, "hex");

  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(hash.iv, "hex")
  );

  let decrypted = decipher.update(hash.content, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};



export const hashSha256 = (value: string) => {
  return crypto.createHash("sha256").update(value).digest("hex");
};
