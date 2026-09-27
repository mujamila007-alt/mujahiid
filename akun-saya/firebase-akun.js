// Muja Prime database compatibility bootstrap.
// Database is provided by /firebase-config.js and backed by Firestore.
(function(){
  if (window.initMujaFirebase) window.initMujaFirebase();
  if (window.db) window.db = window.db;
})();
