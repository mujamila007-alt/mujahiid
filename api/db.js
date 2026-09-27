import admin from 'firebase-admin';
import { Pool } from '@neondatabase/serverless';
import { readAdminSession } from './_auth.js';

const COLLECTIONS = new Set(['access_tokens','ai_chat_logs','app_installs','app_stats','blk_files','blk_modules','blk_notes','blk_participants','collection_items','deleted_accounts','email_logs','leaderboard','manual_members','orders','poin_products','poin_redeems','products','registered_emails','registrations','sections','settings','user_poins']);
const PUBLIC_READ_ALL = new Set(['products','collection_items','settings','sections','leaderboard','poin_products']);
const PUBLIC_ADD = new Set(['registrations','registered_emails','orders','access_tokens','user_poins','poin_redeems','ai_chat_logs']);
const PUBLIC_UPDATE = new Set(['registrations','registered_emails','access_tokens','poin_products','ai_chat_logs']);
const PUBLIC_SET = new Set(['poin_redeems','ai_chat_logs']);

// Hanya nilai gambar yang tetap disimpan di Neon. Data lain masuk Firestore.
const IMAGE_FIELDS = new Set(['image','imageUrl','imageURL','photo','photoUrl','photoURL','avatar','avatarUrl','banner','bannerUrl','logo','logoUrl','paymentProof','proofImage','thumbnail','thumbnailUrl']);
let neonPool;
let imageSchemaReady;

function getNeonPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!neonPool) neonPool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
  return neonPool;
}

async function ensureImageSchema() {
  const pool = getNeonPool();
  if (!pool) return null;
  if (!imageSchemaReady) imageSchemaReady = pool.query(`CREATE TABLE IF NOT EXISTS muja_images (collection_name TEXT NOT NULL, document_id TEXT NOT NULL, field_name TEXT NOT NULL, value TEXT NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY (collection_name,document_id,field_name))`).catch(e => { imageSchemaReady = null; throw e; });
  await imageSchemaReady;
  return pool;
}

function firebaseCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) return admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return admin.credential.cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') });
  }
  throw new Error('Firebase Admin belum dikonfigurasi. Tambahkan FIREBASE_SERVICE_ACCOUNT_JSON atau FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY di Vercel.');
}

function getFirestore() {
  if (!admin.apps.length) admin.initializeApp({ credential: firebaseCredential(), projectId: process.env.FIREBASE_PROJECT_ID });
  return admin.firestore();
}

function jsonBody(req) { return !req.body ? {} : (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body); }
function validateCollection(name) { if (!COLLECTIONS.has(name)) throw Object.assign(new Error('Collection tidak diizinkan: ' + name), { status: 400 }); }
function validateId(id) { if (!id || !/^[A-Za-z0-9_.:@+-]{1,220}$/.test(String(id))) throw Object.assign(new Error('Document ID tidak valid.'), { status: 400 }); }

function decode(value) {
  if (Array.isArray(value)) return value.map(decode);
  if (value && typeof value === 'object') {
    if (value.__mujaType === 'timestamp' && value.iso) return admin.firestore.Timestamp.fromDate(new Date(value.iso));
    const out = {}; for (const [k,v] of Object.entries(value)) out[k] = decode(v); return out;
  }
  return value;
}

function encode(value) {
  if (value == null) return value;
  if (value instanceof admin.firestore.Timestamp) return { __mujaType: 'timestamp', iso: value.toDate().toISOString() };
  if (value instanceof Date) return { __mujaType: 'timestamp', iso: value.toISOString() };
  if (Array.isArray(value)) return value.map(encode);
  if (typeof value === 'object') { const out = {}; for (const [k,v] of Object.entries(value)) out[k] = encode(v); return out; }
  return value;
}

function fieldValue(value) {
  if (!value || typeof value !== 'object' || !value.__mujaFieldValue) return decode(value);
  if (value.__mujaFieldValue === 'serverTimestamp') return admin.firestore.FieldValue.serverTimestamp();
  if (value.__mujaFieldValue === 'increment') return admin.firestore.FieldValue.increment(Number(value.amount) || 0);
  if (value.__mujaFieldValue === 'arrayUnion') return admin.firestore.FieldValue.arrayUnion(...(value.values || []).map(decode));
  return decode(value);
}
function decodeWrite(data) { const out = {}; for (const [k,v] of Object.entries(data || {})) out[k] = fieldValue(v); return out; }
function splitImages(data) { const document = {}, images = {}; for (const [k,v] of Object.entries(data || {})) { if (IMAGE_FIELDS.has(k) && typeof v === 'string') images[k] = v; else document[k] = v; } return { document, images }; }

async function saveImages(collection, id, images) {
  const entries = Object.entries(images || {}); if (!entries.length) return;
  const pool = await ensureImageSchema();
  if (!pool) throw Object.assign(new Error('DATABASE_URL Neon wajib diisi untuk menyimpan gambar.'), { status: 500 });
  for (const [field,value] of entries) {
    if (value === '') await pool.query('DELETE FROM muja_images WHERE collection_name=$1 AND document_id=$2 AND field_name=$3', [collection,id,field]);
    else await pool.query(`INSERT INTO muja_images(collection_name,document_id,field_name,value,updated_at) VALUES($1,$2,$3,$4,NOW()) ON CONFLICT(collection_name,document_id,field_name) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()`, [collection,id,field,value]);
  }
}

async function loadImages(collection, ids, excluded = []) {
  if (!ids.length || !getNeonPool()) return new Map();
  const pool = await ensureImageSchema();
  const { rows } = await pool.query('SELECT document_id,field_name,value FROM muja_images WHERE collection_name=$1 AND document_id=ANY($2::text[])', [collection,ids]);
  const map = new Map();
  for (const row of rows) { if (excluded.includes(row.field_name)) continue; if (!map.has(row.document_id)) map.set(row.document_id, {}); map.get(row.document_id)[row.field_name] = row.value; }
  return map;
}

async function hydrateDocs(collection, snapshots, excluded = []) {
  const images = await loadImages(collection, snapshots.map(s => s.id), excluded);
  return snapshots.map(s => { const data = encode(s.data()); for (const field of excluded) delete data[field]; return { id:s.id, data:{...data,...(images.get(s.id)||{})}, version:s.updateTime ? s.updateTime.toMillis() : null, exists:true }; });
}

function hasFilter(filters, fields) { return (filters || []).some(f => fields.includes(f.field) && f.op === '==' && String(f.value || '').length > 0); }
function publicReadAllowed(action, collection, payload) {
  if (PUBLIC_READ_ALL.has(collection)) return true;
  if (action === 'getDoc' && collection === 'ai_chat_logs') return true;
  if (action === 'getDoc' && collection === 'access_tokens') return true;
  if (action !== 'query') return false;
  const filters = payload.filters || [];
  if (collection === 'registrations') return hasFilter(filters,['email','whatsapp']) && (!payload.limit || payload.limit <= 10);
  if (collection === 'registered_emails') return hasFilter(filters,['email']) && (!payload.limit || payload.limit <= 20);
  if (collection === 'access_tokens') return hasFilter(filters,['token']) && (!payload.limit || payload.limit <= 5);
  if (collection === 'deleted_accounts') return hasFilter(filters,['email','whatsapp']) && (!payload.limit || payload.limit <= 10);
  return false;
}
function publicWriteAllowed(op, exists) {
  if (op.type === 'add') return PUBLIC_ADD.has(op.collection);
  if (op.type === 'set') return (!exists && PUBLIC_ADD.has(op.collection)) || PUBLIC_SET.has(op.collection) || (op.collection === 'settings' && op.id === 'canva_config' && !exists);
  if (op.type === 'update') {
    if (!PUBLIC_UPDATE.has(op.collection)) return false;
if (op.collection === 'access_tokens') {
      // Aktivasi pelanggan: hanya boleh mengunci token menjadi status selesai.
      // Izinkan update dari halaman status-aktif melalui compatibility API.
      return ['used','completed'].includes(op.data?.status) ||
             op.data?.source?.startsWith('status-aktif');
    }
    if (op.collection === 'poin_products') return Object.keys(op.data || {}).every(k => ['stock','updatedAt'].includes(k)) && Number(op.data?.stock) >= 0;
    return true;
  }
  return false;
}

async function runQuery(db, payload, isAdmin) {
  validateCollection(payload.collection);
  if (!isAdmin && !publicReadAllowed('query',payload.collection,payload)) throw Object.assign(new Error('Query ini memerlukan login admin.'), {status:403});
  let query = db.collection(payload.collection);
  for (const f of (payload.filters || [])) if (f?.op === '==' && f.field && !IMAGE_FIELDS.has(f.field)) query = query.where(f.field,'==',decode(f.value));
  if (payload.orderBy?.field && !IMAGE_FIELDS.has(payload.orderBy.field)) query = query.orderBy(payload.orderBy.field,payload.orderBy.direction === 'desc' ? 'desc':'asc');
  const max = isAdmin ? 5000 : 500; query = query.limit(Math.min(Math.max(Number(payload.limit)||max,1),max));
  return hydrateDocs(payload.collection,(await query.get()).docs,payload.excludeFields || []);
}

async function authorizeWrite(db, op, isAdmin, current) {
  if (!isAdmin && !publicWriteAllowed(op,current.exists)) throw Object.assign(new Error('Operasi database ini memerlukan login admin.'), {status:403});
  if (op.type === 'delete' && !isAdmin) throw Object.assign(new Error('Hapus data memerlukan login admin.'), {status:403});
  if (op.type === 'update' && !current.exists) throw Object.assign(new Error('Dokumen tidak ditemukan.'), {status:404});
  if (op.expectedVersion != null && current.exists && current.updateTime && Number(op.expectedVersion) !== current.updateTime.toMillis()) throw Object.assign(new Error('DATA_CHANGED'), {status:409,code:'DATA_CHANGED'});
  if (!isAdmin && op.collection === 'poin_products' && op.type === 'update' && Number(op.data?.stock) > Number(current.data()?.stock || 0)) throw Object.assign(new Error('Stok tidak boleh ditambah dari halaman publik.'), {status:403});
}

async function singleWrite(db, op, isAdmin) {
  validateCollection(op.collection); validateId(op.id); const ref = db.collection(op.collection).doc(op.id); const current = await ref.get();
  await authorizeWrite(db,op,isAdmin,current); const {document,images} = splitImages(op.data || {});
  if (op.type === 'delete') { await ref.delete(); const pool = await ensureImageSchema(); if (pool) await pool.query('DELETE FROM muja_images WHERE collection_name=$1 AND document_id=$2',[op.collection,op.id]); return {id:op.id,deleted:true}; }
  const decoded = decodeWrite(document);
  if (op.type === 'update') await ref.update(decoded); else await ref.set(decoded,{merge:op.type === 'set' && !!op.merge});
  await saveImages(op.collection,op.id,images); return {id:op.id};
}

async function batchWrite(db, ops, isAdmin) {
  // Semua pembacaan dilakukan sebelum penulisan seperti syarat transaksi Firestore.
  const prepared = await db.runTransaction(async tx => {
    const items = [];
    for (const op of ops) { validateCollection(op.collection); validateId(op.id); const ref=db.collection(op.collection).doc(op.id); const current=await tx.get(ref); items.push({op,ref,current,...splitImages(op.data||{})}); }
    for (const item of items) {
      await authorizeWrite(db,item.op,isAdmin,item.current);
      if (item.op.type === 'delete') tx.delete(item.ref);
      else if (item.op.type === 'update') tx.update(item.ref,decodeWrite(item.document));
      else tx.set(item.ref,decodeWrite(item.document),{merge:item.op.type === 'set' && !!item.op.merge});
    }
    return items.map(({op,images}) => ({collection:op.collection,id:op.id,deleted:op.type==='delete',images}));
  });
  for (const item of prepared) {
    if (item.deleted) { const pool=await ensureImageSchema(); if (pool) await pool.query('DELETE FROM muja_images WHERE collection_name=$1 AND document_id=$2',[item.collection,item.id]); }
    else await saveImages(item.collection,item.id,item.images);
  }
  return prepared.map(x => ({id:x.id,deleted:x.deleted||undefined}));
}

export default async function handler(req,res) {
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  try {
    const db=getFirestore(), payload=jsonBody(req), action=String(payload.action||''), isAdmin=!!readAdminSession(req);
    if (action === 'getDoc') { validateCollection(payload.collection); validateId(payload.id); if (!isAdmin && !publicReadAllowed(action,payload.collection,payload)) return res.status(403).json({error:'Data ini memerlukan login admin.'}); const snap=await db.collection(payload.collection).doc(payload.id).get(); if (!snap.exists) return res.status(200).json({doc:{id:payload.id,exists:false}}); return res.status(200).json({doc:(await hydrateDocs(payload.collection,[snap]))[0]}); }
    if (action === 'query') return res.status(200).json({docs:await runQuery(db,payload,isAdmin)});
    if (action === 'multiQuery') { if (!isAdmin) return res.status(403).json({error:'Multi query memerlukan login admin.'}); const queries=Array.isArray(payload.queries)?payload.queries.slice(0,12):[]; const results=await Promise.all(queries.map(q=>runQuery(db,q,true))); return res.status(200).json({results:results.map(docs=>({docs}))}); }
    if (['add','set','update','delete'].includes(action)) return res.status(200).json({ok:true,...await singleWrite(db,{type:action,collection:payload.collection,id:payload.id,data:payload.data,merge:payload.merge,expectedVersion:payload.expectedVersion},isAdmin)});
    if (action === 'batch') { const ops=Array.isArray(payload.ops)?payload.ops:[]; if (!ops.length||ops.length>500) return res.status(400).json({error:'Batch kosong atau terlalu besar.'}); return res.status(200).json({ok:true,results:await batchWrite(db,ops,isAdmin)}); }
    return res.status(400).json({error:'Action database tidak dikenal.'});
  } catch(e) { console.error(e); return res.status(e.status||500).json({error:e.message||'Database error.',code:e.code||undefined}); }
}
