/**
 * Firebase Client Initialization
 * Credentials are read dynamically from .env.local (NOT hardcoded)
 */

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

// Security check: verify that required credentials exist
export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.projectId && firebaseConfig.apiKey);
}

// Global instances holder
let firebaseAppInstance: any = null;
let firestoreDbInstance: any = null;
let analyticsInstance: any = null;

export async function getFirebaseApp() {
  if (firebaseAppInstance) return firebaseAppInstance;

  try {
    const { initializeApp, getApps, getApp } = await import("firebase/app");
    if (getApps().length > 0) {
      firebaseAppInstance = getApp();
    } else if (isFirebaseConfigured()) {
      firebaseAppInstance = initializeApp(firebaseConfig);
    }
  } catch (err) {
    // Dynamic import fallback if native package is still downloading
    console.warn("[Firebase] SDK dynamic load fallback:", err);
  }

  return firebaseAppInstance;
}

export async function getFirestoreDb() {
  if (firestoreDbInstance) return firestoreDbInstance;

  try {
    const app = await getFirebaseApp();
    if (app) {
      const { getFirestore } = await import("firebase/firestore");
      firestoreDbInstance = getFirestore(app);
    }
  } catch (err) {
    console.warn("[Firebase Firestore] SDK fallback:", err);
  }

  return firestoreDbInstance;
}

export async function initAnalytics() {
  if (typeof window === "undefined" || analyticsInstance) return analyticsInstance;

  try {
    const { getAnalytics, isSupported } = await import("firebase/analytics");
    const supported = await isSupported();
    if (supported) {
      const app = await getFirebaseApp();
      if (app) {
        analyticsInstance = getAnalytics(app);
      }
    }
  } catch {
    // Ignore analytics error in dev / SSR
  }

  return analyticsInstance;
}
