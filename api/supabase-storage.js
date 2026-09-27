const FIREBASE_WEB_API_KEY = "AIzaSyAcN0uaLfWmxp3ZBbWIomPXHenx3gjr5-w";
const DEFAULT_BUCKET = "blk-assets";
const DEFAULT_SUPABASE_URL = "https://nvvkmdohelulylymlpme.supabase.co";

function json(res, status, payload) {
  res.status(status).json(payload);
}

function safePath(value) {
  const path = String(value || "");
  if (!path || path.length > 500) return false;
  if (path.includes("..") || path.startsWith("/") || path.includes("\\")) return false;
  return path.startsWith("materials/") || path.startsWith("examples/");
}

function encodeStoragePath(path) {
  return String(path)
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

async function verifyFirebaseUser(idToken) {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(FIREBASE_WEB_API_KEY)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );
  if (!response.ok) return null;
  const data = await response.json();
  return data?.users?.[0] || null;
}

async function readSupabaseResponse(response) {
  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }
  if (!response.ok) {
    const message = data?.message || data?.error || data?.error_description || `SUPABASE_HTTP_${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function createSignedUpload({ supabaseUrl, secretKey, bucket, path }) {
  const base = String(supabaseUrl).replace(/\/+$/, "");
  const endpoint = `${base}/storage/v1/object/upload/sign/${encodeURIComponent(bucket)}/${encodeStoragePath(path)}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: secretKey,
      "Content-Type": "application/json",
      "x-upsert": "false",
    },
    body: "{}",
  });
  const data = await readSupabaseResponse(response);
  const returnedUrl = data?.url || data?.signedURL || data?.signedUrl || "";
  if (!returnedUrl) throw new Error("SIGNED_UPLOAD_URL_NOT_RETURNED");
  const signedUrl = /^https?:\/\//i.test(returnedUrl)
    ? returnedUrl
    : `${base}/storage/v1${returnedUrl.startsWith("/") ? returnedUrl : `/${returnedUrl}`}`;
  const token = new URL(signedUrl).searchParams.get("token") || "";
  if (!token) throw new Error("SIGNED_UPLOAD_TOKEN_NOT_RETURNED");
  return { path, token, signedUrl };
}

async function deleteObject({ supabaseUrl, secretKey, bucket, path }) {
  const base = String(supabaseUrl).replace(/\/+$/, "");
  const endpoint = `${base}/storage/v1/object/${encodeURIComponent(bucket)}`;
  const response = await fetch(endpoint, {
    method: "DELETE",
    headers: {
      apikey: secretKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefixes: [path] }),
  });
  await readSupabaseResponse(response);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "METHOD_NOT_ALLOWED" });
  }

  const supabaseUrl = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
  const bucket = process.env.SUPABASE_BUCKET || DEFAULT_BUCKET;
  const allowedEmails = String(process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (!supabaseUrl || !supabaseSecretKey) {
    return json(res, 500, { error: "STORAGE_API_CONFIG" });
  }

  const authorization = String(req.headers.authorization || "");
  const idToken = authorization.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";
  if (!idToken) return json(res, 401, { error: "INVALID_FIREBASE_SESSION" });

  const firebaseUser = await verifyFirebaseUser(idToken);
  if (!firebaseUser?.email || firebaseUser.disabled) {
    return json(res, 401, { error: "INVALID_FIREBASE_SESSION" });
  }

  if (allowedEmails.length && !allowedEmails.includes(firebaseUser.email.toLowerCase())) {
    return json(res, 403, { error: "ADMIN_NOT_ALLOWED" });
  }

  let body = {};
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch {
    return json(res, 400, { error: "INVALID_JSON" });
  }

  const action = String(body.action || "");
  const path = String(body.path || "");
  if (!safePath(path)) return json(res, 400, { error: "INVALID_STORAGE_PATH" });

  try {
    if (action === "sign-upload") {
      const signed = await createSignedUpload({
        supabaseUrl,
        secretKey: supabaseSecretKey,
        bucket,
        path,
      });
      return json(res, 200, signed);
    }

    if (action === "delete") {
      await deleteObject({
        supabaseUrl,
        secretKey: supabaseSecretKey,
        bucket,
        path,
      });
      return json(res, 200, { ok: true });
    }

    return json(res, 400, { error: "UNKNOWN_ACTION" });
  } catch (error) {
    console.error("Supabase Storage API error:", error?.message || error);
    return json(res, Number(error?.status) || 400, {
      error: error?.message || "SUPABASE_STORAGE_FAILED",
    });
  }
}
