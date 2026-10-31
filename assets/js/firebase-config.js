/**
 * GEC Sheikhpura Student Life Hub - Firebase Centralized Configuration
 * Backend: Firebase Authentication (Email/Password, Google Sign-in, Phone OTP) & Cloud Firestore
 * Project ID: gec-sheikhpura
 * Primary Owner: pk3334238@gmail.com
 */

const DEFAULT_FIREBASE_CONFIG = {
  projectId: "gec-sheikhpura",
  authDomain: "gec-sheikhpura.firebaseapp.com",
  storageBucket: "gec-sheikhpura.firebasestorage.app",
  messagingSenderId: window.localStorage.getItem('gec_firebase_messaging_sender_id') || "",
  apiKey: window.localStorage.getItem('gec_firebase_api_key') || "",
  appId: window.localStorage.getItem('gec_firebase_app_id') || ""
};

window.FIREBASE_CONFIG = {
  ...DEFAULT_FIREBASE_CONFIG,

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.length > 15 && this.projectId === 'gec-sheikhpura');
  },

  setCredentials(apiKey, appId, messagingSenderId) {
    if (apiKey) {
      window.localStorage.setItem('gec_firebase_api_key', apiKey.trim());
      this.apiKey = apiKey.trim();
    }
    if (appId) {
      window.localStorage.setItem('gec_firebase_app_id', appId.trim());
      this.appId = appId.trim();
    }
    if (messagingSenderId) {
      window.localStorage.setItem('gec_firebase_messaging_sender_id', messagingSenderId.trim());
      this.messagingSenderId = messagingSenderId.trim();
    }
    this.reinit();
    return true;
  },

  reinit() {
    if (typeof firebase !== 'undefined') {
      try {
        if (firebase.apps && firebase.apps.length) {
          firebase.app().delete().then(() => {
            this.init();
          });
        } else {
          this.init();
        }
      } catch (e) {
        console.warn("Firebase reinit warning:", e);
      }
    }
  },

  init() {
    if (typeof firebase === 'undefined') return null;
    try {
      if (!firebase.apps || !firebase.apps.length) {
        const configToUse = {
          projectId: this.projectId,
          authDomain: this.authDomain,
          storageBucket: this.storageBucket,
          apiKey: this.apiKey || "AIzaSy_GEC_Sheikhpura_Placeholder",
          appId: this.appId || "1:gec-sheikhpura:web:hub",
          messagingSenderId: this.messagingSenderId || "1234567890"
        };
        firebase.initializeApp(configToUse);
      }
      window.firebaseApp = firebase.app();
      window.firebaseAuth = firebase.auth();
      if (typeof firebase.firestore === 'function') {
        window.firebaseDb = firebase.firestore();
      }
      return firebase.app();
    } catch (e) {
      console.warn("Firebase init notice:", e);
      return null;
    }
  }
};

// Initialize immediately if Firebase SDK is present
if (typeof firebase !== 'undefined') {
  window.FIREBASE_CONFIG.init();
}
