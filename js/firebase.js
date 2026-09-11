// ============================================================
// FIREBASE — Рейтинги воқеӣ
// ============================================================

// Конфиги шумо
const firebaseConfig = {
  apiKey: "AIzaSyADKhYDf1dc11VJHmFdT26irHHBUt_Lkrk",
  authDomain: "my-projekt-d246d.firebaseapp.com",
  databaseURL: "https://my-projekt-d246d-default-rtdb.firebaseio.com", // ⚠️ Ин хаттро илова кунед!
  projectId: "my-projekt-d246d",
  storageBucket: "my-projekt-d246d.firebasestorage.app",
  messagingSenderId: "149204965139",
  appId: "1:149204965139:web:b4c1bc35b4a373cddc2ce6"
};

// ============================================================
// БОРКУНИИ FIREBASE SDK (compat version)
// ============================================================
(function loadFirebase() {
  const scripts = [
    'https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.7.0/firebase-database-compat.js'
  ];
  let loaded = 0;
  scripts.forEach(src => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => {
      loaded++;
      if (loaded === scripts.length) initFirebase();
    };
    document.head.appendChild(s);
  });
})();

let db = null;
let isFirebaseReady = false;

function initFirebase() {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    isFirebaseReady = true;
    console.log('✅ Firebase омода');
    if (typeof onFirebaseReady === 'function') onFirebaseReady();
  } catch (e) {
    console.error('❌ Firebase:', e);
  }
}

// ============================================================
// САБТИ КОРБАР ДАР FIREBASE
// ============================================================
function saveUserToFirebase(userData) {
  if (!isFirebaseReady || !userData.id) return;

  const userRef = db.ref('users/' + userData.id);
  userRef.update({
    id: userData.id,
    name: userData.name,
    username: userData.username || null,
    photo: userData.photo || null,
    lessonsCount: userData.lessonsCount,
    avgScore: userData.avgScore,
    totalScore: userData.totalScore,
    isPremium: userData.isPremium,
    isAdmin: userData.isAdmin,
    lastActive: firebase.database.ServerValue.TIMESTAMP
  }).catch(err => console.error('Firebase save error:', err));
}

// ============================================================
// ХОНДАНИ РЕЙТИНГ (100 корбари беҳтарин)
// ============================================================
function fetchRatingFromFirebase(callback, limit = 100) {
  if (!isFirebaseReady) {
    callback([]);
    return;
  }

  db.ref('users')
    .orderByChild('totalScore')
    .limitToLast(limit)
    .once('value')
    .then(snapshot => {
      const users = [];
      snapshot.forEach(child => {
        users.push(child.val());
      });
      users.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
      callback(users);
    })
    .catch(err => {
      console.error('Firebase read error:', err);
      callback([]);
    });
}

// ============================================================
// РЕЙТИНГ ДАР ВАҚТИ ВОҚЕӢ (Real-time)
// ============================================================
let ratingListener = null;

function listenRatingRealtime(callback) {
  if (!isFirebaseReady) return;

  if (ratingListener) {
    db.ref('users').off('value', ratingListener);
  }

  ratingListener = db.ref('users')
    .orderByChild('totalScore')
    .limitToLast(100)
    .on('value', snapshot => {
      const users = [];
      snapshot.forEach(child => {
        users.push(child.val());
      });
      users.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
      callback(users);
    }, err => {
      console.error('Firebase listen error:', err);
    });
}


// ============================================================
// 🎧 LISTEN MY PREMIUM — real-time аз Firebase
// ============================================================
let myPremiumListener = null;

function listenMyPremiumFromFirebase(userId, callback) {
  if (!isFirebaseReady || !userId) return;

  // Агар listener-и кӯҳна бошад — хомӯш кун
  if (myPremiumListener) {
    db.ref('users/' + userId).off('value', myPremiumListener);
  }

  myPremiumListener = db.ref('users/' + userId).on('value', snap => {
    const data = snap.val();
    if (!data) return;

    callback({
      isPremium: !!data.isPremium,
      premiumPlan: data.premiumPlan || null,
      premiumStartedAt: data.premiumStartedAt || null,
      premiumExpiresAt: data.premiumExpiresAt || null
    });
  }, err => {
    console.error('Premium listener error:', err);
  });
}

// ============================================================
// ГИРИФТАНИ ЯК КОРБАР
// ============================================================
function fetchUserFromFirebase(userId, callback) {
  if (!isFirebaseReady) {
    callback(null);
    return;
  }

  db.ref('users/' + userId).once('value').then(snapshot => {
    callback(snapshot.val());
  });
}
