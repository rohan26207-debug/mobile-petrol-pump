// Firebase Configuration and Initialization
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBH57yXo3xno_5jpzC_xPB_X_7Yi0KFRbc",
  authDomain: "manager-petrol-pump-9e452.firebaseapp.com",
  projectId: "manager-petrol-pump-9e452",
  storageBucket: "manager-petrol-pump-9e452.firebasestorage.app",
  messagingSenderId: "180699454459",
  appId: "1:180699454459:web:ec2859947a4d34c611495e",
  measurementId: "G-LX3Y4ZQEXL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with offline persistence
const db = getFirestore(app);

// Enable offline persistence (works even without internet)
enableIndexedDbPersistence(db)
  .then(() => {
    console.log('✅ Firebase offline persistence enabled');
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time');
    } else if (err.code === 'unimplemented') {
      console.warn('⚠️ Browser does not support offline persistence');
    }
  });

// Initialize Auth
const auth = getAuth(app);

// Email/password authentication (no auto-login)
let authInitialized = false;

const initializeAuth = () => {
  if (authInitialized) return Promise.resolve();
  
  return new Promise((resolve) => {
    // Check if user is already signed in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      
      if (user) {
        console.log('✅ User authenticated:', user.email || user.uid);
        authInitialized = true;
        resolve(user);
      } else {
        console.log('🔒 User not authenticated - login required');
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
