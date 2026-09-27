// Muja Prime - Firestore compatibility layer.
// Data aplikasi masuk Firestore; field gambar tetap disimpan di Neon.
(function () {
  'use strict';

  const API_URL = '/api/db';

  class MujaTimestamp {
    constructor(value) {
      const d = value instanceof Date ? value : new Date(value);
      this._date = Number.isNaN(d.getTime()) ? new Date(0) : d;
      this.seconds = Math.floor(this._date.getTime() / 1000);
      this.nanoseconds = (this._date.getTime() % 1000) * 1000000;
    }
    toDate() { return new Date(this._date.getTime()); }
    toMillis() { return this._date.getTime(); }
    toJSON() { return { __mujaType: 'timestamp', iso: this._date.toISOString() }; }
  }

  function randomId() {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
      return globalThis.crypto.randomUUID().replace(/-/g, '');
    }
    return 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 14);
  }

  function isPlainObject(v) {
    return v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date) && !(v instanceof MujaTimestamp);
  }

  function serialize(value) {
    if (value instanceof MujaTimestamp) return value.toJSON();
    if (value instanceof Date) return { __mujaType: 'timestamp', iso: value.toISOString() };
    if (Array.isArray(value)) return value.map(serialize);
    if (isPlainObject(value)) {
      if (value.__mujaFieldValue) {
        const out = { __mujaFieldValue: value.__mujaFieldValue };
        if ('amount' in value) out.amount = value.amount;
        if ('values' in value) out.values = serialize(value.values);
        return out;
      }
      const out = {};
      Object.keys(value).forEach(k => { out[k] = serialize(value[k]); });
      return out;
    }
    return value;
  }

  function revive(value) {
    if (Array.isArray(value)) return value.map(revive);
    if (value && typeof value === 'object') {
      if (value.__mujaType === 'timestamp' && value.iso) return new MujaTimestamp(value.iso);
      const out = {};
      Object.keys(value).forEach(k => { out[k] = revive(value[k]); });
      return out;
    }
    return value;
  }

  const CACHEABLE_COLLECTIONS = new Set(['products','collection_items','settings','sections','leaderboard','poin_products']);
  const memoryReadCache = new Map();
  const inflightReads = new Map();
  const READ_CACHE_TTL = 45000;
  const CACHE_PREFIX = 'muja_db_v2_';

  function hashText(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36);
  }

  function cacheKeyFor(payload) {
    return CACHE_PREFIX + hashText(JSON.stringify(serialize(payload)));
  }

  function docCacheKey(collection, id) {
    return CACHE_PREFIX + 'doc_' + hashText(String(collection) + '/' + String(id));
  }

  function isCacheableRead(payload) {
    return !!(payload && (payload.action === 'query' || payload.action === 'getDoc') && CACHEABLE_COLLECTIONS.has(payload.collection));
  }

  function readStored(key) {
    const now = Date.now();
    const mem = memoryReadCache.get(key);
    if (mem && mem.expires > now) return mem.data;
    if (mem) memoryReadCache.delete(key);
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;
      const item = JSON.parse(raw);
      if (!item || item.expires <= now) { sessionStorage.removeItem(key); return null; }
      memoryReadCache.set(key, item);
      return item.data;
    } catch (_) { return null; }
  }

  function writeStored(key, data) {
    const item = { expires: Date.now() + READ_CACHE_TTL, data };
    memoryReadCache.set(key, item);
    try { sessionStorage.setItem(key, JSON.stringify(item)); } catch (_) {}
  }

  function getCachedRead(payload) {
    if (!isCacheableRead(payload)) return null;
    if (payload.action === 'getDoc' && payload.id) {
      const docCached = readStored(docCacheKey(payload.collection, payload.id));
      if (docCached) return { doc: docCached };
    }
    return readStored(cacheKeyFor(payload));
  }

  function cacheRead(payload, data) {
    if (!isCacheableRead(payload) || !data) return;
    writeStored(cacheKeyFor(payload), data);
    if (payload.action === 'getDoc' && data.doc && data.doc.id) {
      writeStored(docCacheKey(payload.collection, data.doc.id), data.doc);
    }
    if (payload.action === 'query' && Array.isArray(data.docs)) {
      data.docs.forEach(doc => { if (doc && doc.id) writeStored(docCacheKey(payload.collection, doc.id), doc); });
    }
  }

  function clearReadCache() {
    memoryReadCache.clear();
    try {
      const keys = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith(CACHE_PREFIX)) keys.push(k);
      }
      keys.forEach(k => sessionStorage.removeItem(k));
    } catch (_) {}
  }

  async function api(payload) {
    const isSafeRead = payload && (payload.action === 'query' || payload.action === 'getDoc');
    const cacheable = isCacheableRead(payload);
    const cached = cacheable ? getCachedRead(payload) : null;
    if (cached) return cached;

    const inflightKey = isSafeRead ? cacheKeyFor(payload) : null;
    if (inflightKey && inflightReads.has(inflightKey)) return inflightReads.get(inflightKey);

    const perform = async () => {
      const attempts = isSafeRead ? 2 : 1;
      let lastError = null;
      for (let attempt = 1; attempt <= attempts; attempt++) {
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timeoutMs = isSafeRead ? 10000 : 30000;
        const timeout = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
        try {
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            credentials: 'same-origin',
            cache: 'no-store',
            signal: controller ? controller.signal : undefined,
            body: JSON.stringify(serialize(payload))
          });
          let data = null;
          try { data = await response.json(); } catch (_) {}
          if (!response.ok) {
            const err = new Error((data && (data.error || data.message)) || ('Database error HTTP ' + response.status));
            err.status = response.status;
            err.code = data && data.code;
            if (isSafeRead && attempt < attempts && [429, 502, 503, 504].includes(response.status)) {
              await new Promise(r => setTimeout(r, 200 * attempt));
              continue;
            }
            throw err;
          }
          const result = data || {};
          if (cacheable) cacheRead(payload, result);
          if (!isSafeRead) clearReadCache();
          return result;
        } catch (err) {
          lastError = err;
          const temporary = err && (err.name === 'AbortError' || err instanceof TypeError);
          if (isSafeRead && attempt < attempts && temporary) {
            await new Promise(r => setTimeout(r, 200 * attempt));
            continue;
          }
          if (err && err.name === 'AbortError') {
            const timeoutErr = new Error(isSafeRead ? 'Koneksi database terlalu lama. Silakan coba lagi.' : 'Penyimpanan data terlalu lama. Silakan coba lagi.');
            timeoutErr.code = 'REQUEST_TIMEOUT';
            throw timeoutErr;
          }
          throw err;
        } finally {
          if (timeout) clearTimeout(timeout);
        }
      }
      throw lastError || new Error('Database tidak dapat dihubungi.');
    };

    const promise = perform();
    if (inflightKey) inflightReads.set(inflightKey, promise);
    try { return await promise; }
    finally { if (inflightKey) inflightReads.delete(inflightKey); }
  }

  class DocumentSnapshot {
    constructor(collection, row) {
      this.id = row && row.id ? String(row.id) : '';
      this.exists = !!(row && row.exists !== false && row.data != null);
      this._data = this.exists ? revive(row.data) : undefined;
      this._version = row && row.version != null ? Number(row.version) : null;
      this.ref = new DocumentReference(collection, this.id);
      this.ref._version = this._version;
    }
    data() { return this._data; }
  }

  class QuerySnapshot {
    constructor(collection, rows) {
      this.docs = (rows || []).map(row => new DocumentSnapshot(collection, row));
      this.empty = this.docs.length === 0;
      this.size = this.docs.length;
    }
    forEach(cb, thisArg) { this.docs.forEach(cb, thisArg); }
  }

  class Query {
    constructor(collection, state) {
      this.collectionName = collection;
      this.state = state || { filters: [], orderBy: null, limit: null, excludeFields: [] };
    }
    _clone() {
      return new Query(this.collectionName, {
        filters: this.state.filters.slice(),
        orderBy: this.state.orderBy ? { ...this.state.orderBy } : null,
        limit: this.state.limit,
        excludeFields: (this.state.excludeFields || []).slice()
      });
    }
    where(field, op, value) {
      const q = this._clone();
      q.state.filters.push({ field, op, value });
      return q;
    }
    orderBy(field, direction) {
      const q = this._clone();
      q.state.orderBy = { field, direction: String(direction || 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc' };
      return q;
    }
    limit(n) {
      const q = this._clone();
      q.state.limit = Math.max(1, Number(n) || 1);
      return q;
    }
    exclude(...fields) {
      const q = this._clone();
      q.state.excludeFields = (q.state.excludeFields || []).concat(fields.map(String));
      return q;
    }
    async get() {
      const result = await api({
        action: 'query',
        collection: this.collectionName,
        filters: this.state.filters,
        orderBy: this.state.orderBy,
        limit: this.state.limit,
        excludeFields: (this.state.excludeFields || []).slice()
      });
      return new QuerySnapshot(this.collectionName, result.docs || []);
    }
    onSnapshot(next, error) {
      let stopped = false;
      let lastSignature = null;
      const run = async () => {
        if (stopped || (typeof document !== 'undefined' && document.hidden)) return;
        try {
          const snap = await this.get();
          const signature = JSON.stringify(snap.docs.map(d => [d.id, d._version]));
          if (signature !== lastSignature) {
            lastSignature = signature;
            next(snap);
          }
        } catch (e) {
          if (typeof error === 'function') error(e);
        }
      };
      run();
      const timer = setInterval(run, 5000);
      return function unsubscribe() { stopped = true; clearInterval(timer); };
    }
  }

  class DocumentReference {
    constructor(collection, id) {
      this.collectionName = collection;
      this.id = id || randomId();
      this._version = null;
    }
    async get() {
      const result = await api({ action: 'getDoc', collection: this.collectionName, id: this.id });
      const snap = new DocumentSnapshot(this.collectionName, result.doc || { id: this.id, exists: false });
      this._version = snap._version;
      return snap;
    }
    async set(data, options) {
      const result = await api({ action: 'set', collection: this.collectionName, id: this.id, data, merge: !!(options && options.merge) });
      this._version = result.version == null ? this._version : Number(result.version);
      return undefined;
    }
    async update(data) {
      const result = await api({ action: 'update', collection: this.collectionName, id: this.id, data });
      this._version = result.version == null ? this._version : Number(result.version);
      return undefined;
    }
    async delete() {
      await api({ action: 'delete', collection: this.collectionName, id: this.id });
      return undefined;
    }
  }

  class CollectionReference extends Query {
    constructor(collection) { super(collection); this.id = collection; }
    doc(id) { return new DocumentReference(this.collectionName, id || randomId()); }
    async add(data) {
      const id = randomId();
      const result = await api({ action: 'add', collection: this.collectionName, id, data });
      const ref = new DocumentReference(this.collectionName, result.id || id);
      ref._version = result.version == null ? null : Number(result.version);
      return ref;
    }
  }

  class WriteBatch {
    constructor() { this.ops = []; }
    set(ref, data, options) {
      this.ops.push({ type: 'set', collection: ref.collectionName, id: ref.id, data, merge: !!(options && options.merge), expectedVersion: ref._version });
      return this;
    }
    update(ref, data) {
      this.ops.push({ type: 'update', collection: ref.collectionName, id: ref.id, data, expectedVersion: ref._version });
      return this;
    }
    delete(ref) {
      this.ops.push({ type: 'delete', collection: ref.collectionName, id: ref.id, expectedVersion: ref._version });
      return this;
    }
    async commit() { await api({ action: 'batch', ops: this.ops }); return []; }
  }

  class FirestoreCompat {
    collection(name) { return new CollectionReference(String(name)); }
    batch() { return new WriteBatch(); }
    async runTransaction(callback) {
      const ops = [];
      const versions = new Map();
      const tx = {
        get: async (ref) => {
          const snap = await ref.get();
          versions.set(ref.collectionName + '/' + ref.id, snap._version);
          return snap;
        },
        update: (ref, data) => {
          const key = ref.collectionName + '/' + ref.id;
          ops.push({ type: 'update', collection: ref.collectionName, id: ref.id, data, expectedVersion: versions.get(key) ?? ref._version });
          return tx;
        },
        set: (ref, data, options) => {
          const key = ref.collectionName + '/' + ref.id;
          ops.push({ type: 'set', collection: ref.collectionName, id: ref.id, data, merge: !!(options && options.merge), expectedVersion: versions.get(key) ?? ref._version });
          return tx;
        },
        delete: (ref) => {
          const key = ref.collectionName + '/' + ref.id;
          ops.push({ type: 'delete', collection: ref.collectionName, id: ref.id, expectedVersion: versions.get(key) ?? ref._version });
          return tx;
        }
      };
      const value = await callback(tx);
      if (ops.length) await api({ action: 'batch', ops, transaction: true });
      return value;
    }
  }

  const FieldValue = {
    serverTimestamp: () => ({ __mujaFieldValue: 'serverTimestamp' }),
    increment: amount => ({ __mujaFieldValue: 'increment', amount: Number(amount) || 0 }),
    arrayUnion: (...values) => ({ __mujaFieldValue: 'arrayUnion', values })
  };

  const db = new FirestoreCompat();
  // Digunakan admin dashboard untuk menggabungkan beberapa read menjadi satu request Vercel.
  globalThis.mujaDbApi = api;

  // Minimal Firebase Auth compatibility for adminuser-aktif page.
  let authUser = null;
  const authListeners = new Set();
  function notifyAuth() { authListeners.forEach(fn => { try { fn(authUser); } catch (_) {} }); }
  async function refreshAuth() {
    try {
      const res = await fetch('/api/auth/session', { credentials: 'same-origin', cache: 'no-store' });
      const data = await res.json();
      authUser = data && data.authenticated ? { email: data.email || 'admin' } : null;
    } catch (_) { authUser = null; }
    notifyAuth();
    return authUser;
  }
  const authCompat = {
    get currentUser() { return authUser; },
    onAuthStateChanged(fn) {
      authListeners.add(fn);
      Promise.resolve().then(refreshAuth);
      return () => authListeners.delete(fn);
    },
    async signInWithEmailAndPassword(email, password) {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
        body: JSON.stringify({ email, password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Login gagal');
      authUser = { email: data.email || email };
      notifyAuth();
      return { user: authUser };
    },
    async signOut() {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
      authUser = null;
      notifyAuth();
    }
  };

  const firebase = window.firebase = window.firebase || {};
  firebase.apps = Array.isArray(firebase.apps) ? firebase.apps : [];
  firebase.initializeApp = firebase.initializeApp || function initializeApp(config) {
    if (!firebase.apps.length) firebase.apps.push({ options: config || {} });
    return firebase.apps[0];
  };
  function firestoreFn() { return db; }
  firestoreFn.FieldValue = FieldValue;
  firestoreFn.Timestamp = MujaTimestamp;
  firebase.firestore = firestoreFn;
  firebase.auth = function authFn() { return authCompat; };

  window.firebaseConfig = window.firebaseConfig || { projectId: 'muja-prime-firestore' };
  window.initMujaFirebase = function initMujaFirebase() {
    if (!firebase.apps.length) firebase.initializeApp(window.firebaseConfig);
    window.db = db;
    window.firebaseApp = firebase;
    return db;
  };
  window.db = db;
  window.MujaTimestamp = MujaTimestamp;
  window.initMujaFirebase();
})();
