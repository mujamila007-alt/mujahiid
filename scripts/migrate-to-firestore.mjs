import admin from 'firebase-admin';
import { Pool } from '@neondatabase/serverless';

const COLLECTIONS = ['access_tokens','ai_chat_logs','app_installs','app_stats','collection_items','deleted_accounts','email_logs','leaderboard','manual_members','orders','poin_products','poin_redeems','products','registered_emails','registrations','sections','settings','user_poins'];
const IMAGE_FIELDS = new Set(['image','imageUrl','imageURL','photo','photoUrl','photoURL','avatar','avatarUrl','banner','bannerUrl','logo','logoUrl','paymentProof','proofImage','thumbnail','thumbnailUrl']);
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL Neon belum diisi.');

function credential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) return admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) return admin.credential.cert({projectId:process.env.FIREBASE_PROJECT_ID,clientEmail:process.env.FIREBASE_CLIENT_EMAIL,privateKey:process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g,'\n')});
  throw new Error('Isi FIREBASE_SERVICE_ACCOUNT_JSON atau tiga environment variable Firebase.');
}
function convert(value) {
  if (Array.isArray(value)) return value.map(convert);
  if (value && typeof value === 'object') {
    if (value.__mujaType === 'timestamp' && value.iso) return admin.firestore.Timestamp.fromDate(new Date(value.iso));
    const out={}; for (const [k,v] of Object.entries(value)) out[k]=convert(v); return out;
  }
  return value;
}

admin.initializeApp({credential:credential(),projectId:process.env.FIREBASE_PROJECT_ID});
const firestore=admin.firestore();
const pool=new Pool({connectionString:process.env.DATABASE_URL});
const client=await pool.connect();
try {
  await client.query(`CREATE TABLE IF NOT EXISTS muja_images (collection_name TEXT NOT NULL,document_id TEXT NOT NULL,field_name TEXT NOT NULL,value TEXT NOT NULL,updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),PRIMARY KEY(collection_name,document_id,field_name))`);
  let total=0, images=0;
  for (const collection of COLLECTIONS) {
    const {rows}=await client.query('SELECT document_id,data FROM muja_documents WHERE collection_name=$1',[collection]);
    for (let start=0; start<rows.length; start+=400) {
      const batch=firestore.batch();
      for (const row of rows.slice(start,start+400)) {
        const clean={};
        for (const [field,value] of Object.entries(row.data||{})) {
          if (IMAGE_FIELDS.has(field) && typeof value === 'string') {
            if (value) await client.query(`INSERT INTO muja_images(collection_name,document_id,field_name,value,updated_at) VALUES($1,$2,$3,$4,NOW()) ON CONFLICT(collection_name,document_id,field_name) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()`,[collection,row.document_id,field,value]);
            images++;
          } else clean[field]=convert(value);
        }
        batch.set(firestore.collection(collection).doc(row.document_id),clean);
        total++;
      }
      await batch.commit();
    }
    console.log(`${collection}: ${rows.length} dokumen`);
  }
  console.log(`Selesai: ${total} dokumen ke Firestore, ${images} field gambar tetap di Neon.`);
} finally { client.release(); await pool.end(); await admin.app().delete(); }
