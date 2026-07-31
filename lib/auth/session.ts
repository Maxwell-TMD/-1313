const COOKIE_NAME = "gongkao_session";
const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export async function createSessionToken() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return "";
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode("gongkao-single-user-session-v1"),
  );
  return toBase64Url(new Uint8Array(signature));
}

export function isAccessProtectionEnabled() {
  return Boolean(process.env.APP_PASSWORD && process.env.SESSION_SECRET);
}

export { COOKIE_NAME };
