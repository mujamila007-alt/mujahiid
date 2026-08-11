import { createClient } from "@supabase/supabase-js";

const FIREBASE_WEB_API_KEY = "AIzaSyAcN0uaLfWmxp3ZBbWIomPXHenx3gjr5-w";
const DEFAULT_BUCKET = "blk-assets";

function json(res, status, payload) {
  res.status(status).json(payload);
}

function safePath(value) {
  const path = String(value || "");
  if (!path || path.length > 500) return false;
  if (path.includes("..") || path.startsWith("/") || path.includes("\\")) return false;
  return path.startsWith("materials/") || path.startsWith("examples/");
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "METHOD_NOT_ALLOWED" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
  const bucket = process.env.SUPABASE_BUCKET || DEFAULT_BUCKET;
  const allowedEmails = String(process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
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

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const action = String(body.action || "");
  const path = String(body.path || "");
  if (!safePath(path)) return json(res, 400, { error: "INVALID_STORAGE_PATH" });

  const supabase = createClient(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (action === "sign-upload") {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path, { upsert: false });
    if (error) return json(res, 400, { error: error.message || "SIGNED_UPLOAD_FAILED" });
    return json(res, 200, { path, token: data?.token });
  }

  if (action === "delete") {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) return json(res, 400, { error: error.message || "DELETE_FAILED" });
    return json(res, 200, { ok: true });
  }

  return json(res, 400, { error: "UNKNOWN_ACTION" });
}
