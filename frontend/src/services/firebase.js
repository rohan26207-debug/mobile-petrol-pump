// Firebase Configuration and Initialization
import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInAnonymously, setPersistence, browserLocalPersistence } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHz4e4fQKL3zl9UdyOh83vli9IJ70FPDM",
  authDomain: "manager-petrol-pump-f55db.firebaseapp.com",
  projectId: "manager-petrol-pump-f55db",
  storageBucket: "manager-petrol-pump-f55db.firebasestorage.app",
  messagingSenderId: "480091504176",
  appId: "1:480091504176:web:743c51b87adb62a2a977f5",
  measurementId: "G-T0P6PY2MCJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with new cache settings (recommended approach)
// Using persistentLocalCache with multiple tab support for offline functionality
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

console.log('✅ Firebase offline persistence enabled (new cache API)');

// Initialize Auth
const auth = getAuth(app);

// Email/password authentication (no auto-login)
let authInitialized = false;

const initializeAuth = async () => {
  if (authInitialized) return Promise.resolve();

  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (e) {
    console.log('Auth persistence setup warning:', e?.message || e);
  }

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      try {
        if (!user) {
          // Anonymous mode: sign in silently
          const cred = await signInAnonymously(auth);
          user = cred.user;
          console.log('🕶️ Anonymous user signed in:', user.uid);
        }
        console.log('✅ User authenticated:', user.email || user.uid);
        authInitialized = true;
        resolve(user);
      } catch (err) {
        console.error('Anonymous sign-in failed:', err);
        authInitialized = true;
        resolve(null);
      }
    });
  });
};

// Initialize auth (doesn't auto-login)
initializeAuth();

// Get device ID for tracking which device made changes
const getDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

export { db, auth, initializeAuth, getDeviceId };
export default app;
