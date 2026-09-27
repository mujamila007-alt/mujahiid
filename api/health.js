import admin from 'firebase-admin';

function credential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) return admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) return admin.credential.cert({ projectId:process.env.FIREBASE_PROJECT_ID, clientEmail:process.env.FIREBASE_CLIENT_EMAIL, privateKey:process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g,'\n') });
  return admin.credential.applicationDefault();
}

export default async function handler(req,res) {
  try {
    if (!admin.apps.length) admin.initializeApp({credential:credential(),projectId:process.env.FIREBASE_PROJECT_ID});
    await admin.firestore().collection('settings').limit(1).get();
    return res.status(200).json({ok:true,database:'firestore',imageStorage:process.env.DATABASE_URL?'neon':'not_configured'});
  } catch(error) { return res.status(503).json({ok:false,database:'firestore',message:error.message}); }
}
